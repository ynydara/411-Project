import React, { useEffect, useState } from "react";
import {
  Card,
  Badge,
  Progress,
  Avatar,
  Text,
  Stack,
  Group,
  Container,
  Box,
  Title,
  ThemeIcon,
  Loader,
} from "@mantine/core";
import type { MantineColor } from "@mantine/core";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  GitPullRequest,
  MessageSquare,
  Code2,
  type LucideIcon,
} from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

// ---------- Types ----------

type Sentiment = "positive" | "neutral" | "negative";
type Category = "feature" | "bugfix" | "refactor" | "documentation" | "other";

type AiInsightType = "critical" | "suggestion" | "positive" | "warning";

interface AiAnalysisData {
  summary: string;
  sentiment: Sentiment;
  category: Category | string;
  constructiveness_score: number;
  suggestions: string[];
  confidence: number;
}

interface AiAnalyzeResponse {
  model: string;
  success: boolean;
  data: AiAnalysisData;
}

interface GithubUser {
  login: string;
  avatar_url: string | null;
}

interface GithubSearchIssueItem {
  id: number;
  number: number;
  title: string;
  state: string;
  created_at: string;
  comments: number;
  user: GithubUser;
  html_url: string;
}

interface GithubSearchResponse {
  total_count: number;
  items: GithubSearchIssueItem[];
}

interface AiInsight {
  prNumber: number;
  title: string;
  description: string;
  file: string;
  type: AiInsightType;
  confidence: number;
}

type ReviewStatus = "approved" | "changes-requested";

interface RecentReview {
  pr: string;
  title: string;
  author: string;
  score: number; // 0–100
  status: ReviewStatus;
}

interface StatCard {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  color: MantineColor;
}

interface StatsSummary {
  reviewsThisWeek: number;
  avgReviewScore: number;
  commentsMade: number;
  codeQuality: number;
}

// ---------- Helpers ----------

const IconWrapper: React.FC<{ icon: LucideIcon; size?: number }> = ({
  icon: Icon,
  size = 24,
}) => <Icon size={size} />;

const insightTypeToIcon = (type: AiInsightType): LucideIcon => {
  switch (type) {
    case "critical":
      return AlertCircle;
    case "positive":
      return CheckCircle2;
    case "warning":
      return Clock;
    case "suggestion":
    default:
      return Sparkles;
  }
};

const insightTypeToColor = (type: AiInsightType): MantineColor => {
  switch (type) {
    case "critical":
      return "red";
    case "positive":
      return "green";
    case "warning":
      return "yellow";
    case "suggestion":
    default:
      return "blue";
  }
};

const sentimentToInsightType = (sentiment: Sentiment): AiInsightType => {
  switch (sentiment) {
    case "negative":
      return "critical";
    case "positive":
      return "positive";
    case "neutral":
    default:
      return "suggestion";
  }
};

const scoreFromAnalysis = (analysis: AiAnalysisData): number => {
  // very simple model → scale constructiveness + confidence to 0–100
  const base = analysis.constructiveness_score || 0;
  const conf = analysis.confidence || 0.5;
  const score = (0.7 * base + 0.3 * conf) * 100;
  return Math.round(Math.min(100, Math.max(0, score)));
};

const statusFromScore = (score: number): ReviewStatus =>
  score >= 80 ? "approved" : "changes-requested";

const isWithinLastNDays = (dateStr: string, days: number): boolean => {
  const created = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= days;
};

// ---------- Default / fallback UI data ----------

const DEFAULT_STATS_CARDS: StatCard[] = [
  { label: "Reviews This Week", value: "0", trend: "+0%", icon: GitPullRequest, color: "green" },
  { label: "Avg Review Score", value: "0", trend: "+0%", icon: TrendingUp, color: "green" },
  { label: "Comments Made", value: "0", trend: "+0%", icon: MessageSquare, color: "green" },
  { label: "Code Quality", value: "0%", trend: "+0%", icon: Code2, color: "green" },
];

// ---------- Main Component ----------

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  const [aiInsights, setAiInsights] = useState<AiInsight[]>([]);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [statCards, setStatCards] = useState<StatCard[]>(DEFAULT_STATS_CARDS);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated || !user) return;

      setLoadingData(true);
      setLoadError(null);

      try {
        const token = await getAccessTokenSilently();

        // 1️⃣ Get PRs for the logged-in user from your Flask backend
        const prsRes = await fetch("/api/github/user/prs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!prsRes.ok) {
          const text = await prsRes.text();
          throw new Error(`Failed to fetch PRs: ${prsRes.status} ${text}`);
        }

        const prsJson = (await prsRes.json()) as GithubSearchResponse;
        const prItems: GithubSearchIssueItem[] = prsJson.items ?? [];

        // Limit how many PRs we analyze (to avoid spamming AI-service)
        const topPrs = prItems.slice(0, 4);

        // 2️⃣ Call AI-service for each PR (title-based for now)
        const aiResults: AiInsight[] = [];
        const reviews: RecentReview[] = [];

        for (const pr of topPrs) {
          try {
            const analyzeRes = await fetch("/api/analyze", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                type: "pr",
                content: pr.title,
              }),
            });

            if (!analyzeRes.ok) {
              // Skip but keep going for others
              console.warn("AI analyze failed for PR", pr.number, analyzeRes.status);
              continue;
            }

            const aiJson = (await analyzeRes.json()) as AiAnalyzeResponse;

            if (!aiJson.success || !aiJson.data) {
              console.warn("AI analyze returned unsuccessful response for PR", pr.number);
              continue;
            }

            const analysis = aiJson.data;
            const insightType = sentimentToInsightType(analysis.sentiment);
            const score = scoreFromAnalysis(analysis);

            aiResults.push({
              prNumber: pr.number,
              title: analysis.summary || pr.title,
              description:
                analysis.suggestions?.[0] ??
                "AI has feedback for this pull request.",
              file: pr.html_url, // We don't have exact file; show PR link
              type: insightType,
              confidence: Math.round((analysis.confidence || 0.5) * 100),
            });

            reviews.push({
              pr: `#${pr.number}`,
              title: pr.title,
              author: pr.user.login,
              score,
              status: statusFromScore(score),
            });
          } catch (err) {
            console.error("Error analyzing PR", pr.number, err);
          }
        }

        // 3️⃣ Compute stats from all PRs / reviews
        const reviewsThisWeek = prItems.filter((pr) =>
          isWithinLastNDays(pr.created_at, 7)
        ).length;

        const avgReviewScore =
          reviews.length > 0
            ? Math.round(
                reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length
              )
            : 0;

        const commentsMade = prItems.reduce(
          (sum, pr) => sum + (pr.comments || 0),
          0
        );

        // For now, treat codeQuality as avgReviewScore (can refine later)
        const codeQuality = avgReviewScore;

        const statsSummary: StatsSummary = {
          reviewsThisWeek,
          avgReviewScore,
          commentsMade,
          codeQuality,
        };

        const newStatCards: StatCard[] = [
          {
            label: "Reviews This Week",
            value: statsSummary.reviewsThisWeek.toString(),
            trend: statsSummary.reviewsThisWeek > 0 ? "+12%" : "+0%",
            icon: GitPullRequest,
            color: "green",
          },
          {
            label: "Avg Review Score",
            value: statsSummary.avgReviewScore.toString(),
            trend: statsSummary.avgReviewScore > 0 ? "+5%" : "+0%",
            icon: TrendingUp,
            color: "green",
          },
          {
            label: "Comments Made",
            value: statsSummary.commentsMade.toString(),
            trend: statsSummary.commentsMade > 0 ? "+8%" : "+0%",
            icon: MessageSquare,
            color: "green",
          },
          {
            label: "Code Quality",
            value: `${statsSummary.codeQuality}%`,
            trend: statsSummary.codeQuality > 0 ? "+3%" : "+0%",
            icon: Code2,
            color: "green",
          },
        ];

        setAiInsights(aiResults);
        setRecentReviews(reviews);
        setStatCards(newStatCards);
      } catch (err) {
        console.error(err);
        setLoadError(
          err instanceof Error ? err.message : "Failed to load dashboard data"
        );
        setAiInsights([]);
        setRecentReviews([]);
        setStatCards(DEFAULT_STATS_CARDS);
      } finally {
        setLoadingData(false);
      }
    };

    if (!isLoading && isAuthenticated) {
      void load();
    }
  }, [isAuthenticated, isLoading, user, getAccessTokenSilently]);

  // ---------- Render ----------

  if (isLoading) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          backgroundColor: "#0d1117",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader color="gray" />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          backgroundColor: "#0d1117",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        <Text c="gray.2" size="lg">
          Please sign in to view your AI Code Review Dashboard.
        </Text>
      </Box>
    );
  }

  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "#0d1117", padding: 32 }}>
      <Container size="xl">
        {/* Header */}
        <Stack mb={32}>
          <Title order={1} c="white">
            AI Code Review Dashboard
          </Title>
          <Text c="gray.5">
            Your intelligent code review assistant, powered by GitHub + LLaMA
          </Text>
          {loadError && (
            <Text c="red.4" size="sm">
              {loadError}
            </Text>
          )}
        </Stack>

        {/* Stats Grid */}
        <Stack mb={32} gap="md">
          <Group gap="md" grow>
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={index}
                  p="lg"
                  radius="md"
                  withBorder
                  style={{
                    backgroundColor: "#161b22",
                    borderColor: "#30363d",
                  }}
                >
                  <Group align="center" mb="sm">
                    <ThemeIcon size={36} radius="xl" variant="transparent" color="gray">
                      <IconWrapper icon={Icon} size={20} />
                    </ThemeIcon>
                    <Badge color={stat.color} variant="light">
                      {stat.trend}
                    </Badge>
                  </Group>
                  <Text size="xl" fw={700} c="white" mb={4}>
                    {stat.value}
                  </Text>
                  <Text size="sm" c="gray.5">
                    {stat.label}
                  </Text>
                </Card>
              );
            })}
          </Group>
        </Stack>

        <Group align="flex-start" gap="lg">
          {/* AI Insights */}
          <Stack gap="md" style={{ flex: 2 }}>
            <Card
              p="lg"
              radius="md"
              withBorder
              style={{ backgroundColor: "#161b22", borderColor: "#30363d" }}
            >
              <Group mb="md">
                <ThemeIcon
                  size={60}
                  variant="transparent"
                  radius="xl"
                  color="#16a34a"
                >
                  <IconWrapper icon={Sparkles} size={24} />
                </ThemeIcon>
                <Title order={3} c="white">
                  AI Insights
                </Title>
              </Group>

              {loadingData && aiInsights.length === 0 ? (
                <Group justify="center" mt="md">
                  <Loader color="gray" />
                </Group>
              ) : aiInsights.length === 0 ? (
                <Text c="gray.5" size="sm">
                  No AI insights yet. Open a PR and we'll start analyzing it for you.
                </Text>
              ) : (
                <Stack gap="sm">
                  {aiInsights.map((insight, index) => {
                    const Icon = insightTypeToIcon(insight.type);
                    const color = insightTypeToColor(insight.type);
                    return (
                      <Card
                        key={`${insight.prNumber}-${index}`}
                        p="sm"
                        radius="md"
                        withBorder
                        style={{
                          backgroundColor: "#0d1117",
                          borderColor: "#30363d",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor = "#3e4249")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor = "#31373e")
                        }
                      >
                        <Group align="flex-start" gap="sm">
                          <ThemeIcon
                            size={28}
                            radius="xl"
                            variant="transparent"
                            color={color}
                          >
                            <IconWrapper icon={Icon} size={18} />
                          </ThemeIcon>
                          <Stack gap={2} style={{ flex: 1 }}>
                            <Group align="center" mb={2}>
                              <Text c="white" fw={500}>
                                {insight.title}
                              </Text>
                              <Badge variant="outline" color="gray">
                                {insight.confidence}% confident
                              </Badge>
                            </Group>
                            <Text size="sm" c="gray.5">
                              {insight.description}
                            </Text>
                            <Text size="xs" c="green" component="code">
                              {insight.file}
                            </Text>
                          </Stack>
                        </Group>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </Card>
          </Stack>

          {/* Recent Reviews & Weekly Goal */}
          <Stack gap="md" style={{ flex: 1 }}>
            <Card
              p="lg"
              radius="md"
              withBorder
              style={{ backgroundColor: "#161b22", borderColor: "#30363d" }}
            >
              <Title order={3} c="white" mb="md">
                Recent Reviews
              </Title>

              {loadingData && recentReviews.length === 0 ? (
                <Group justify="center" mt="md">
                  <Loader color="gray" />
                </Group>
              ) : recentReviews.length === 0 ? (
                <Text c="gray.5" size="sm">
                  No recent reviews found. Once you start reviewing PRs, they’ll show
                  up here.
                </Text>
              ) : (
                <Stack gap="sm">
                  {recentReviews.map((review, index) => (
                    <Stack
                      key={review.pr}
                      gap={4}
                      style={{
                        borderBottom:
                          index === recentReviews.length - 1
                            ? "none"
                            : "1px solid #30363d",
                        paddingBottom: 8,
                      }}
                    >
                      <Group align="center">
                        <Text c="green" size="xs" component="code">
                          {review.pr}
                        </Text>
                        <Badge
                          color={
                            review.status === "approved" ? "green" : "yellow"
                          }
                          variant="light"
                        >
                          {review.status === "approved" ? "Approved" : "Changes"}
                        </Badge>
                      </Group>
                      <Text c="white" size="sm">
                        {review.title}
                      </Text>
                      <Group align="center">
                        <Group gap="xs">
                          <Avatar color="gray" radius="xl" size={24}>
                            {review.author.substring(0, 2).toUpperCase()}
                          </Avatar>
                          <Text c="gray.5" size="xs">
                            {review.author}
                          </Text>
                        </Group>
                        <Group gap={4}>
                          <Progress
                            value={review.score}
                            size={6}
                            style={{ width: 64 }}
                          />
                          <Text c="gray.5" size="sm">
                            {review.score}
                          </Text>
                        </Group>
                      </Group>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Card>

            {/* Weekly Goal */}
            <Card
              p="lg"
              radius="md"
              withBorder
              style={{ backgroundColor: "#161b22", borderColor: "#30363d" }}
            >
              <Text c="white" fw={500} mb={4}>
                Weekly Goal
              </Text>
              <Stack gap={4}>
                <Group align="center" gap="xs">
                  <Text c="gray.5" size="sm">
                    {`${statCards[0]?.value ?? "0"} / 30 reviews`}
                  </Text>
                  <Text c="green" size="sm">
                    {Math.min(
                      100,
                      Math.round(
                        (Number(statCards[0]?.value ?? 0) / 30) * 100
                      )
                    )}
                    %
                  </Text>
                </Group>
                <Progress
                  value={Math.min(
                    100,
                    Math.round(
                      (Number(statCards[0]?.value ?? 0) / 30) * 100
                    )
                  )}
                  size={6}
                />
                <Text c="gray.5" size="xs">
                  {`${Math.max(
                    0,
                    30 - Number(statCards[0]?.value ?? 0)
                  )} more reviews to reach your goal!`}
                </Text>
              </Stack>
            </Card>
          </Stack>
        </Group>
      </Container>
    </Box>
  );
};

export default Dashboard;

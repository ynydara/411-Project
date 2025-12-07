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
  type MantineColor,
} from "@mantine/core";
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

const CLAIM_NAMESPACE = "https://codearena.app";

function decodeJwt(token?: string): any | null {
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const payload = parts[1];

    // base64url -> base64
    let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padding = 4 - (base64.length % 4);
    if (padding !== 4) {
      base64 += "=".repeat(padding);
    }

    const json = atob(base64);
    return JSON.parse(json);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
}

// ==================================================
// TYPES
// ==================================================

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
  score?: number;
}

interface AiAnalyzeResponse {
  model: string;
  success: boolean;
  data: AiAnalysisData;
  insight?: any;
}

interface GithubUser {
  login: string;
  avatar_url: string | null;
}

interface GithubPRComment {
  id: number;
  body: string;
  user: GithubUser;
  pr_number: number;
  created_at: string;
}

interface GithubPR {
  id: number;
  number: number;
  title: string;
  created_at: string;
  comments: number;
  user: GithubUser;
  html_url: string;
  commentData?: Array<{ id: number; body: string; user: GithubUser }>;
}



interface GithubSearchResponse {
  total_count?: number;
  items: GithubPR[];
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
  score: number;
  status: ReviewStatus;
}

interface StatCard {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  color: MantineColor;
}
declare global {
  interface Window {
    getToken?: (options?: any) => Promise<any>;
  }
}

// ==================================================
// HELPERS
// ==================================================


async function getGithubToken(
  getAccessTokenSilently: (options?: any) => Promise<any>
): Promise<string> {
  const verbose: any = await getAccessTokenSilently({ detailedResponse: true });

  const claimToken: string | undefined =
    verbose?.decodedToken?.claims?.github_access_token ??
    verbose?.id_token_claims?.github_access_token ??
    verbose?.accessToken?.github_access_token;

  if (!claimToken) {
    throw new Error("GitHub token missing — check Auth0 Action / claims mapping.");
  }

  return claimToken;
}

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

const scoreFromAnalysis = (a: AiAnalysisData): number => {
  const base = a.constructiveness_score ?? 0;
  const conf = a.confidence ?? 0.5;
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

const DEFAULT_STATS: StatCard[] = [
  {
    label: "Reviews This Week",
    value: "0",
    trend: "+0%",
    icon: GitPullRequest,
    color: "green",
  },
  {
    label: "Avg Review Score",
    value: "0",
    trend: "+0%",
    icon: TrendingUp,
    color: "green",
  },
  {
    label: "Comments Made",
    value: "0",
    trend: "+0%",
    icon: MessageSquare,
    color: "green",
  },
  {
    label: "Code Quality",
    value: "0%",
    trend: "+0%",
    icon: Code2,
    color: "green",
  },
];
// src/api/score.ts
export async function updateUserScores(username: string) {
  if (!username) throw new Error("Username is required");

  const res = await fetch("/api/score/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update scores: ${res.status} ${text}`);
  }

  return await res.json();
}

const IconWrapper: React.FC<{ icon: LucideIcon; size?: number }> = ({
  icon: Icon,
  size = 24,
}) => <Icon size={size} />;



export const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  const [aiInsights, setAiInsights] = useState<AiInsight[]>([]);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [statCards, setStatCards] = useState<StatCard[]>(DEFAULT_STATS);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [commentList, setCommentList] = useState<GithubPRComment[]>([]);


useEffect(() => {
  if (!isAuthenticated || !user) return;

  async function load() {
    try {
      setLoadingData(true);
      setLoadError(null);

      const username = (user as any).nickname;
      if (!username) {
        setLoadError("No GitHub username found in profile.");
        setAiInsights([]);
        setRecentReviews([]);
        setStatCards(DEFAULT_STATS);
        setLoadingData(false);
        return;
      }

      const scoreRes = await updateUserScores(username);

      console.log("Updated scores:", scoreRes);

      // 1) Fetch user's PRs from backend by username

      const prsRes = await fetch(`/api/github/user/prs?username=${encodeURIComponent(username)}`);

      const commentsRes = await fetch(`/api/github/user/prs/comments?username=${encodeURIComponent(username)}`);



      if (!prsRes.ok) {
        const text = await prsRes.text();
        throw new Error(`Failed to fetch PRs: ${prsRes.status} ${text}`);
      }

      if (!commentsRes.ok){
          const text = await commentsRes.text();
          throw new Error(`failed to fetch comments': ${commentsRes.status} ${text}`);
      }

      const prsJson = (await prsRes.json()) as GithubSearchResponse;
      const prItems: GithubPR[] = prsJson.items ?? [];
      const topPrs = prItems.slice(0, 4);


      const commentsJson = (await commentsRes.json()) as Array<{
  comments: GithubPRComment[];
  pr_number: number;
}>;

const commentItems: GithubPRComment[] = commentsJson.flatMap(pr =>
  pr.comments.map(comment => ({
    ...comment,
    pr_number: pr.pr_number, // make sure pr_number is on the comment
  }))
);

setCommentList(commentItems);

      // const commentsJson = (await commentsRes.json()) as {items: GithubPRComment[]};
      // const commentItems = commentsJson.items ?? [];
      // setCommentList(commentItems);

  const insights: AiInsight[] = [];
      const reviews: RecentReview[] = [];
      for (const comment of commentItems) {
  try {
    const aiRes = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "comment",
        content: comment.body,
      }),
    });

    if (!aiRes.ok) {
      console.warn("AI-service failed for comment", comment.id, aiRes.status);
      continue;
    }

    const aiJson = (await aiRes.json()) as AiAnalyzeResponse;
    if (!aiJson.success || !aiJson.data) {
      console.warn("AI-service returned unsuccessful for comment", comment.id);
      continue;
    }

    const analysis = aiJson.data;
    const type = sentimentToInsightType(analysis.sentiment);

    insights.push({
      prNumber: comment.pr_number,
      title: `Comment by ${comment.user.login}. \n The comment was:  ${comment.body}`,
      description: analysis.suggestions?.[0] ?? "The ai didnt provide an analysis for this comment",
      // file: `PR #${comment.pr_number}`, // or pr.html_url if you have a mapping
        file: `COMMENT on PR #${comment.pr_number}`,

      type,
      confidence: Math.round((analysis.confidence ?? 0.5) * 100),
    });
  } catch (err) {
    console.error("Error analyzing comment", comment.id, err);
  }
}
      //
      // const insights: AiInsight[] = [];
      // const reviews: RecentReview[] = [];


     for (const pr of topPrs) {
        try {
            const aiRes = await fetch("/api/analyze", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "pr",
                content: pr.title,
                githubId: (user as any).nickname,
                file: pr.html_url,
              }),
            });

            if (!aiRes.ok) {
              console.warn("AI-service failed for PR", pr.number, aiRes.status);
              continue;
            }

            const aiJson = (await aiRes.json()) as AiAnalyzeResponse;

            if (!aiJson.success || !aiJson.data) {
              console.warn("AI-service returned unsuccessful for PR", pr.number);
              continue;
            }

            const analysis = aiJson.data;


            const backendScore = (analysis as any).score;
            const score =
              typeof backendScore === "number"
                ? backendScore
                : scoreFromAnalysis(analysis);


            const type = sentimentToInsightType(analysis.sentiment);

            insights.push({
              prNumber: pr.number,
              title: analysis.summary || pr.title,
              description:
                analysis.suggestions?.[0] ??
                "AI has feedback for this pull request.",
              file: pr.html_url,
              type, // <-- now `type` is in scope
              confidence: Math.round((analysis.confidence ?? 0.5) * 100),
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


      const reviewsThisWeek = topPrs.length;


      // 3) Same stats logic
      // const reviewsThisWeek = prItems.filter((pr) =>
      //   isWithinLastNDays(pr.created_at, 7)
      // ).length;

      const avgReviewScore =
        reviews.length > 0
        ? Math.round(reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length)
        : 0;

      const commentsMade = prItems.reduce(
        (sum, pr) => sum + (pr.comments || 0),
         0
       );

      const codeQuality = avgReviewScore;

      const newStatCards: StatCard[] = [
          {
            label: "Reviews This Week",
            value: reviewsThisWeek.toString(),
            trend: reviewsThisWeek > 0 ? "+12%" : "+0%",
            icon: GitPullRequest,
            color: "green",
          },
          {
            label: "Avg Review Score",
            value: avgReviewScore.toString(),
            trend: avgReviewScore > 0 ? "+5%" : "+0%",
            icon: TrendingUp,
            color: "green",
          },
          {
              label: "Comments Made",
              value: commentsMade.toString(),
              trend: avgReviewScore >0 ? "+3%" : "+0%",
              icon: MessageSquare,
              color: "green",
          },
          {
            label: "Code Quality",
            value: `${codeQuality}%`,
            trend: codeQuality > 0 ? "+3%" : "+0%",
            icon: Code2,
            color: "green",
          },
        ];

              // Sort PR insights first, then comment insights
            insights.sort((a, b) => {
              const typeOrder = { pr: 0, comment: 1 };

            const aType = a.file.includes("COMMENT") ? "comment" : "pr";
            const bType = b.file.includes("COMMENT") ? "comment" : "pr";
            console.log("Comments JSON:", commentsJson);


              // group by PR number first
              if (a.prNumber !== b.prNumber) return a.prNumber - b.prNumber;

              // PR insight first, then comment insights
              return typeOrder[aType] - typeOrder[bType];
            });

            setAiInsights(insights);

              setRecentReviews(reviews);
              setStatCards(newStatCards);
            } catch (err: any) {
              console.error(err);
              setLoadError(
                err instanceof Error ? err.message : "Failed to load dashboard data"
              );
              setAiInsights([]);
              setRecentReviews([]);
              setStatCards(DEFAULT_STATS);
            } finally {
              setLoadingData(false);
            }
          }

          void load();
        }, [isAuthenticated, user]);


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
{/*<Card*/}
{/*  p="lg"*/}
{/*  radius="md"*/}
{/*  withBorder*/}
{/*  style={{ backgroundColor: "#161b22", borderColor: "#30363d" }}*/}
{/*>*/}
{/*  <Title order={3} c="white" mb="md">*/}
{/*    Your GitHub Comments*/}
{/*  </Title>*/}

{/*  {commentList.length === 0 ? (*/}
{/*    <Text c="gray.5" size="sm">No GitHub comments found.</Text>*/}
{/*  ) : (*/}
{/*    <Stack gap="sm">*/}
{/*      {commentList.map((c) => (*/}
{/*        <Card*/}
{/*          key={c.id}*/}
{/*          p="sm"*/}
{/*          radius="md"*/}
{/*          withBorder*/}
{/*          style={{ backgroundColor: "#0d1117", borderColor: "#30363d" }}*/}
{/*        >*/}
{/*          <Text c="green" size="xs" component="code">PR #{c.pr_number}</Text>*/}

{/*          <Text size="sm" c="white" mt={4}>*/}
{/*            {c.body}*/}
{/*          </Text>*/}

{/*          <Text size="xs" c="gray.5" mt={6}>*/}
{/*            {new Date(c.created_at).toLocaleString()}*/}
{/*          </Text>*/}
{/*        </Card>*/}
{/*      ))}*/}
{/*    </Stack>*/}
{/*  )}*/}
{/*</Card>*/}

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
                  color="green"
                >
                  <Sparkles size={24} />
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
                  No AI insights yet. Once you open PRs or make comments, we’ll start analyzing them.
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
                              <Text c="white" fw={500}  style={{ whiteSpace: "pre-line" }}>
                                {insight.title}
                              </Text>
                              <Badge variant="outline" color="gray">
                                {"confidence: " + insight.confidence}% confident
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
                  No recent reviews found. Once you start reviewing PRs or make comments, they’ll show
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
                          <Progress value={review.score} size={6} style={{ width: 64 }} />
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

            <Card
              p="lg"
              radius="md"
              withBorder
              style={{ backgroundColor: "#161b22", borderColor: "#30363d" }}
            >
              <Text c="white" fw={500} mb={4}>
                Weekly Goal
              </Text>
              <Stack gap="4px">
                <Group align="center" gap="xs">
                  <Text c="gray.5" size="sm">
                    {`${statCards[0]?.value ?? "0"} / 30 PR reviews`}
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


import "./App.css";
import React, { useEffect, useState } from "react";
import {
  Card,
  Title,
  Text,
  Loader,
  Grid,
  Group,
  Avatar,
  Badge,
  RingProgress,
  Progress,
} from "@mantine/core";
import { LineChart, Heatmap, DonutChart } from "@mantine/charts";
import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import { useAuth0 } from "@auth0/auth0-react";

interface LeaderboardEntry {
  name: string;
  score: number;
  img: string;
}

interface Achievement {
  id: number;
  awardname: string;
  description: string;
}

async function addUserToLeaderboard(user: any) {
  await fetch("/leaderboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ githubId: user.nickname, comment_score: 0, code_score: 0 }),
  });
}

function DashboardPage() {
  const [topMembers, setTopMembers] = useState<LeaderboardEntry[] | null>(null);
  const [achievements, setAchievements] = useState<Achievement[] | null>(null);
  const { user, isAuthenticated, isLoading } = useAuth0();

  const [metrics] = useState({
    helpfulness: 4.2,
    tonePositive: 87,
    technicalAccuracy: 92,
  });

 useEffect(() => {
    if (isAuthenticated && user) {
      fetch(`/api/users/by-nickname/${user.nickname}/achievements`)
        .then((res) => res.json())
        .then((res) => setAchievements(res))
        .catch((err) => {
          console.error("Failed to load achievements:", err);
          setAchievements([]);
        });
    }
  }, [isAuthenticated, user]);

  const heatData = {
    "2025-02-14": 2,
    "2025-03-03": 3,
    "2025-02-08": 4,
    "2025-03-23": 1,
    "2025-04-03": 2,
    "2025-04-01": 2,
    "2025-05-08": 4,
    "2025-05-04": 2,
  };

  const pieData1 = [
    { name: "Group A", value: 400, color: "blue" },
    { name: "Group B", value: 300, color: "purple" },
    { name: "Group C", value: 200, color: "green" },
  ];

  const pieData2 = [
    { name: "Group D", value: 200, color: "blue" },
    { name: "Group E", value: 278, color: "purple" },
    { name: "Group F", value: 189, color: "green" },
  ];

  useEffect(() => {
    fetch("/leaderboard")
      .then((res) => res.json())
      .then((res) => {
        const sorted = [...res.leaderboard].sort(
          (a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score
        );
        setTopMembers(sorted.slice(0, 3)); // only keep top 3
      });
  }, []);

  return user ? (
    <div style={{ padding: "2rem" }}>
      <Title order={1} ta="center">
        Welcome back, {user.name}!
      </Title>
      <Title order={2} ta="center">
        Here’s how your code reviews are looking this week
      </Title>

      <Grid>
        {/* Left Column */}
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Card shadow="sm" radius="md" p="lg">
            <Title order={3}>Leaderboard</Title>
            {!topMembers ? (
              <Loader />
            ) : (
              topMembers.map((member, index) => (
                <Group key={index} mt="xs">
                  <Avatar
                    src={
                      isAuthenticated && user && member.name === user.nickname
                        ? user.picture
                        : member.img
                    }
                    radius="xl"
                  />
                  <Text>{member.name}</Text>
                  <Text c="dimmed" ml="auto">
                    {member.score}
                  </Text>
                </Group>
              ))
            )}

            <Title order={3}>Accomplishments</Title>
            <Group mt="xs">
              {!achievements ? (
                <Loader size="sm" />
              ) : achievements.length === 0 ? (
                <Text c="dimmed">You have no achievements yet.</Text>
              ) : (
                achievements.map((ach) => (
                  <Badge key={ach.id} color="teal">
                    {ach.awardname}
                  </Badge>
                ))
              )}
            </Group>

            <Title order={3}>Streak Tracker</Title>
            <Text size="sm" c="dimmed">
              You’ve reviewed 5 days in a row!
            </Text>
          </Card>
        </Grid.Col>

        {/* Center Column */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" radius="md" p="lg">
            <Title order={3}>Review Quality Scorecard</Title>
            <Group grow mt="md">
              <div>
                <Text fw={500}>Helpfulness</Text>
                <Text size="xl">{metrics.helpfulness}/5</Text>
              </div>
              <div>
                <Text fw={500}>Tone Positive</Text>
                <RingProgress
                  size={80}
                  thickness={8}
                  label={<Text size="sm" ta="center">{metrics.tonePositive}%</Text>}
                  sections={[{ value: metrics.tonePositive, color: "blue" }]}
                />
              </div>
              <div>
                <Text fw={500}>Technical Accuracy</Text>
                <RingProgress
                  size={80}
                  thickness={8}
                  label={<Text size="sm" ta="center">{metrics.technicalAccuracy}%</Text>}
                  sections={[{ value: metrics.technicalAccuracy, color: "green" }]}
                />
              </div>
            </Group>
            <Text size="sm" c="dimmed" mt="md">
              Weekly progress
            </Text>
            <Progress value={70} mt="xs" />
          </Card>

          <Grid mt="md">
            <Grid.Col span={6}>
              <Card shadow="sm" radius="md" p="lg">
                <Title order={3}>Active PRs Overview</Title>
                <Group justify="space-between" mt="sm" mb="xs">
                  <Text size="sm" c="dimmed" mt="xs">
                    great suggestion • clarify • maybe
                  </Text>
                  <DonutChart size={101} thickness={30} data={pieData1} />
                </Group>
              </Card>
            </Grid.Col>
            <Grid.Col span={6}>
              <Card shadow="sm" radius="md" p="lg">
                <Title order={3}>Feedback Insights</Title>
                <Group justify="space-between" mt="sm" mb="xs">
                  <Text size="sm" c="dimmed" mt="xs">
                    “great suggestion” and “good point” are trending
                  </Text>
                  <DonutChart size={101} thickness={30} data={pieData2} />
                </Group>
              </Card>
            </Grid.Col>
          </Grid>
        </Grid.Col>

        {/* Right Column */}
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Card shadow="sm" radius="md" p="lg">
            <Title order={3} mb="xs">Team Trends</Title>
            <Text size="sm" c="dimmed">
              Avg review response time ↓ 12%
            </Text>
            <div>
              <Heatmap data={heatData} startDate="2025-02-08" endDate="2025-05-08" rectSize={17} />
            </div>
            <Text size="sm" c="dimmed" mb="md">
              Participation heatmap
            </Text>

            <Title order={3}>Coaching Tip of the Day</Title>
            <Text size="sm" c="dimmed" mt="xs">
              Try suggesting alternatives instead of just pointing out problems — it boosts
              helpfulness scores by 15%.
            </Text>

            <Text size="sm" mt="md">
              Integrations:{" "}
              <Text span c="blue" style={{ cursor: "pointer" }}>
                GitHub
              </Text>{" "}
            </Text>
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  ) : null;
}

export default DashboardPage;

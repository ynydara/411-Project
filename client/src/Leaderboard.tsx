import {Card, Table, Tabs, Avatar, Badge, Group, Text, Box, Flex, Stack, Container, Title, Divider, ThemeIcon, } from "@mantine/core";
import {LuCrown, LuMedal, LuAward, LuTrendingUp, LuTrendingDown, LuMinus, } from "react-icons/lu";

const IconWrapper = ({ icon: Icon, size = 24 }: { icon: any; size?: number }) => <Icon size={size} />;

export function Leaderboard() {
  const leaderboardData = [
    {
      rank: 1,
      username: "sarah-dev",
      score: 2847,
      reviews: 342,
      accuracy: 96,
      streak: 45,
      change: 2,
      level: 28,
    },
    {
      rank: 2,
      username: "mike-codes",
      score: 2734,
      reviews: 318,
      accuracy: 94,
      streak: 32,
      change: -1,
      level: 27,
    },
    {
      rank: 3,
      username: "alex-eng",
      score: 2612,
      reviews: 295,
      accuracy: 95,
      streak: 28,
      change: 1,
      level: 26,
    },
    {
      rank: 4,
      username: "you",
      score: 2401,
      reviews: 267,
      accuracy: 92,
      streak: 21,
      change: 0,
      level: 24,
      isCurrentUser: true,
    },
    {
      rank: 5,
      username: "emma-tech",
      score: 2289,
      reviews: 251,
      accuracy: 91,
      streak: 19,
      change: 3,
      level: 23,
    },
    {
      rank: 6,
      username: "chris-dev",
      score: 2156,
      reviews: 234,
      accuracy: 89,
      streak: 15,
      change: -2,
      level: 22,
    },
    {
      rank: 7,
      username: "lisa-codes",
      score: 2043,
      reviews: 221,
      accuracy: 90,
      streak: 17,
      change: 1,
      level: 21,
    },
    {
      rank: 8,
      username: "james-eng",
      score: 1987,
      reviews: 208,
      accuracy: 88,
      streak: 12,
      change: 0,
      level: 20,
    },
    {
      rank: 9,
      username: "olivia-dev",
      score: 1845,
      reviews: 192,
      accuracy: 87,
      streak: 14,
      change: 2,
      level: 19,
    },
    {
      rank: 10,
      username: "noah-tech",
      score: 1723,
      reviews: 178,
      accuracy: 85,
      streak: 10,
      change: -1,
      level: 18,
    },
  ];

  // Rank icons
  const getRankIcon = (rank: number) => {
    if (rank === 1) return (
      <ThemeIcon size={28} radius="xl" variant="transparent" color="#f5c518">
          <IconWrapper icon={LuCrown} size={20} />
      </ThemeIcon>
    );
    if (rank === 2) return (
        <ThemeIcon size={28} radius="xl" variant="transparent" color="#9ca3af">
          <IconWrapper icon={LuMedal} size={20} />
        </ThemeIcon>
    );
    if (rank === 3) return (
        <ThemeIcon size={28} radius="xl" variant="transparent" color="#b45309">
          <IconWrapper icon={LuAward} size={20} />
        </ThemeIcon>
    );
    return (
        <Text c="gray.5">#{rank}</Text>
    );
  };

  // Trend icons
  const getTrendIcon = (change: number) => {
      if (change > 0)
        return (
          <ThemeIcon size={28} radius="xl" variant="transparent" color="#22c55e">
            <IconWrapper icon={LuTrendingUp} size={16} />
          </ThemeIcon>
        );

      if (change < 0)
        return (
          <ThemeIcon size={28} radius="xl" variant="transparent" color="#ef4444">
            <IconWrapper icon={LuTrendingDown} size={16} />
          </ThemeIcon>
        );

      return (
        <ThemeIcon size={28} radius="xl" variant="transparent" color="#6b7280">
          <IconWrapper icon={LuMinus} size={16} />
        </ThemeIcon>
      );
    };

  return (
    <Box bg="#0d1117" pt={32} pb={64} style={{ minHeight: "100vh" }}>
      <Container size="lg">
        <Stack mb="xl">
          <Title order={1} c="white">Leaderboard</Title>
          <Text c="dimmed">Compete with other code reviewers</Text>
        </Stack>

        {/* Top 3 Podium */}
        <Card
          p="xl"
          mb="xl"
          withBorder
          style={{ backgroundColor: "#161b22", borderColor: "#30363d" }}
        >
          <Flex justify="center" align="flex-end" gap="xl">

            {/* Second Place */}
            <Stack align="center" gap={6}>
              <Avatar
                  size="lg"
                  radius="xl"
                  color="white"
                  style={{ backgroundColor: "#494f5e", border: "2px solid #9ca3af" }}
              >
                {leaderboardData[1].username.slice(0, 2).toUpperCase()}
              </Avatar>
                <ThemeIcon size={40} radius="xl" variant="transparent" color="#9ca3af">
                  <IconWrapper icon={LuMedal} size={32} />
                </ThemeIcon>
              <Text c="white">{leaderboardData[1].username}</Text>
              <Text c="green.5" fw={700} fz={24}>
                {leaderboardData[1].score}
              </Text>
              <Badge color="gray" variant="light">
                Level {leaderboardData[1].level}
              </Badge>
            </Stack>

            {/* First Place */}
            <Stack align="center" gap={6}>
              <Avatar
                size={96}
                radius={100}
                color="white"
                variant="transparent"
                style={{ backgroundColor: "#b17300",  border: "4px solid #f5c518" }}
              >
                {leaderboardData[0].username.slice(0, 2).toUpperCase()}
              </Avatar>
                <ThemeIcon size={50} radius="xl" variant="transparent" color="#f5c518">
                  <IconWrapper icon={LuCrown} size={40} />
                </ThemeIcon>
              <Text c="white">{leaderboardData[0].username}</Text>
              <Text c="green.5" fw={700} fz={32}>
                {leaderboardData[0].score}
              </Text>
              <Badge color="yellow" variant="light">
                Level {leaderboardData[0].level}
              </Badge>
            </Stack>

            {/* Third Place */}
            <Stack align="center" gap={6}>
              <Avatar
                  size="lg"
                  radius="xl"
                  color="white"
                  variant="transparent"
                  style={{ backgroundColor: "#8e4003", border: "2px solid #b45309" }}
              >
                {leaderboardData[2].username.slice(0, 2).toUpperCase()}
              </Avatar>
                <ThemeIcon size={40} radius="xl" variant="transparent" color="#b45309">
                  <IconWrapper icon={LuAward} size={32} />
                </ThemeIcon>
              <Text c="white">{leaderboardData[2].username}</Text>
              <Text c="green.5" fw={700} fz={24}>
                {leaderboardData[2].score}
              </Text>
              <Badge color="orange" variant="light">
                Level {leaderboardData[2].level}
              </Badge>
            </Stack>

          </Flex>
        </Card>

        {/* FULL LEADERBOARD */}
        <Card
          withBorder
          style={{ backgroundColor: "#161b22", borderColor: "#30363d" }}
        >
          <Tabs defaultValue="overall" variant="pills" radius="x1" style={{ backgroundColor: "#161b22", borderColor: "#30363d" }} >
            <Tabs.List px="md" pt="md">
              <Tabs.Tab value="overall">Overall</Tabs.Tab>
              <Tabs.Tab value="weekly">This Week</Tabs.Tab>
              <Tabs.Tab value="monthly">This Month</Tabs.Tab>
            </Tabs.List>

            {/* Overall Table */}
            <Tabs.Panel value="overall">
              <Table
                highlightOnHover
                verticalSpacing="md"
                horizontalSpacing="lg"
              >
                <Table.Thead>
                  <Table.Tr>
                    {["Rank", "User", "Score", "Reviews", "Accuracy", "Streak", "Change"].map((h) => (
                      <Table.Th key={h}>
                        <Text c="gray.5">{h}</Text>
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                  {leaderboardData.map((user) => (
                    <Table.Tr
                      key={user.rank}
                      style={{
                        backgroundColor: user.isCurrentUser ? "rgba(34,197,94,0.08)" : "transparent",
                        cursor: "pointer",
                      }}
                    >
                      <Table.Td>
                        {getRankIcon(user.rank)}
                      </Table.Td>

                      <Table.Td>
                        <Group>
                          <Avatar size="sm" radius="xl">
                            {user.username.slice(0, 2).toUpperCase()}
                          </Avatar>
                          <div>
                            <Text c="white">
                              {user.username}{" "}
                              {user.isCurrentUser && (
                                <Badge color="green" ml={4} variant="light">You</Badge>
                              )}
                            </Text>
                            <Text c="dimmed" fz="xs">
                              Level {user.level}
                            </Text>
                          </div>
                        </Group>
                      </Table.Td>

                      <Table.Td>
                        <Text c="green.5">{user.score.toLocaleString()}</Text>
                      </Table.Td>

                      <Table.Td>
                        <Text c="gray.4">{user.reviews}</Text>
                      </Table.Td>

                      <Table.Td>
                        <Text c="gray.4">{user.accuracy}%</Text>
                      </Table.Td>

                      <Table.Td>
                        <Badge color="orange" variant="light">
                          🔥 {user.streak}
                        </Badge>
                      </Table.Td>

                      <Table.Td>
                        <Group gap={4}>
                          {getTrendIcon(user.change)}
                          {user.change !== 0 && (
                            <Text c={user.change > 0 ? "green" : "red"}>
                              {Math.abs(user.change)}
                            </Text>
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Tabs.Panel>

            {/* Placeholder panels */}
            <Tabs.Panel value="weekly" p="xl">
              <Text c="dimmed" ta="center">
                Weekly leaderboard data
              </Text>
            </Tabs.Panel>

            <Tabs.Panel value="monthly" p="xl">
              <Text c="dimmed" ta="center">
                Monthly leaderboard data
              </Text>
            </Tabs.Panel>
          </Tabs>
        </Card>
      </Container>
    </Box>
  );
}

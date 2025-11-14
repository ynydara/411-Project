import { LuCircleAlert, LuCircleCheck, LuClock, LuSparkles, LuTrendingUp, LuGitPullRequest, LuMessageSquare, LuCodeXml } from "react-icons/lu";
import { Card, Badge, Progress, Avatar, Text, Stack, Group, Container, Box, Title, ThemeIcon } from "@mantine/core";

const IconWrapper = ({ icon: Icon, size = 24 }: { icon: any; size?: number }) => <Icon size={size} />;

export function Dashboard() {
  const aiInsights = [
    {
      type: 'critical',
      title: 'Security Vulnerability Detected',
      description: 'Potential SQL injection risk in database query on line 142',
      file: 'src/api/users.ts',
      confidence: 95,
      icon: LuCircleAlert,
      color: 'red',
    },
    {
      type: 'suggestion',
      title: 'Code Quality Improvement',
      description: 'Consider extracting this logic into a separate helper function',
      file: 'src/components/Dashboard.tsx',
      confidence: 87,
      icon: LuSparkles,
      color: 'blue',
    },
    {
      type: 'positive',
      title: 'Excellent Test Coverage',
      description: 'Great job! Test coverage increased by 15% in this PR',
      file: 'tests/integration/auth.test.ts',
      confidence: 100,
      icon: LuCircleCheck,
      color: 'green',
    },
    {
      type: 'warning',
      title: 'Performance Concern',
      description: 'Nested loop detected - O(n²) complexity. Consider optimization',
      file: 'src/utils/dataProcessor.ts',
      confidence: 82,
      icon: LuClock,
      color: 'yellow',
    },
  ];

  const recentReviews = [
    { pr: '#1247', title: 'Add user authentication', author: 'sarah-dev', score: 92, status: 'approved' },
    { pr: '#1246', title: 'Fix pagination bug', author: 'mike-codes', score: 88, status: 'approved' },
    { pr: '#1245', title: 'Update dependencies', author: 'alex-eng', score: 76, status: 'changes-requested' },
  ];

  const stats = [
    { label: 'Reviews This Week', value: '24', trend: '+12%', icon: LuGitPullRequest, color: 'green' },
    { label: 'Avg Review Score', value: '87', trend: '+5%', icon: LuTrendingUp, color: 'green' },
    { label: 'Comments Made', value: '156', trend: '+8%', icon: LuMessageSquare, color: 'green' },
    { label: 'Code Quality', value: '92%', trend: '+3%', icon: LuCodeXml, color: 'green' },
  ];

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#0d1117', padding: 32 }}>
      <Container size="xl">
        {/* Header */}
        <Stack mb={32}>
          <Title order={1} c="white">AI Code Review Dashboard</Title>
          <Text c="gray.5">Your intelligent code review assistant</Text>
        </Stack>

        {/* Stats Grid */}
        <Stack mb={32} gap="md">
          <Group gap="md" grow>
            {stats.map((stat, index) => {
                const Icon = stat.icon;
              return (
                <Card key={index} p="lg" radius="md" withBorder style={{ backgroundColor: '#161b22', borderColor: '#30363d' }}>
                  <Group align="center" mb="sm">
                    <ThemeIcon size={36} radius="xl" variant="transparent" color="gray">
                      <IconWrapper icon={Icon} size={20} />
                    </ThemeIcon>
                    <Badge color={stat.color} variant="light">{stat.trend}</Badge>
                  </Group>
                  <Text size="xl" fw={700} c="white" mb={4}>{stat.value}</Text>
                  <Text size="sm" c="gray.5">{stat.label}</Text>
                </Card>
              );
            })}
          </Group>
        </Stack>

        <Group align="flex-start" gap="lg">
          {/* AI Insights */}
          <Stack gap="md" style={{ flex: 2 }}>
            <Card p="lg" radius="md" withBorder style={{ backgroundColor: '#161b22', borderColor: '#30363d' }}>
              <Group mb="md">
                  <ThemeIcon size={60} variant="transparent" radius="xl" color="#16a34a">
                    <IconWrapper icon={LuSparkles} size={20}  />
                  </ThemeIcon>
                <Title order={3} c="white">AI Insights</Title>
              </Group>

              <Stack gap="sm">
                {aiInsights.map((insight, index) => {
                    const Icon = insight.icon;
                  return (
                    <Card
                      key={index}
                      p="sm"
                      radius="md"
                      withBorder
                      style={{ backgroundColor: '#0d1117', borderColor: '#30363d' }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3e4249")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#31373e")}
                    >
                      <Group align="flex-start" gap="sm">
                        <ThemeIcon size={28} radius="xl" variant="transparent" color={insight.color}>
                          <IconWrapper icon={Icon} size={18} />
                        </ThemeIcon>
                        <Stack gap={2} style={{ flex: 1 }}>
                          <Group align="center" mb={2}>
                            <Text c="white" fw={500}>{insight.title}</Text>
                            <Badge variant="outline" color="gray">{insight.confidence}% confident</Badge>
                          </Group>
                          <Text size="sm" c="gray.5">{insight.description}</Text>
                          <Text size="xs" c="green" component="code">{insight.file}</Text>
                        </Stack>
                      </Group>
                    </Card>
                  );
                })}
              </Stack>
            </Card>
          </Stack>

          {/* Recent Reviews & Weekly Goal */}
          <Stack gap="md" style={{ flex: 1 }}>
            <Card p="lg" radius="md" withBorder style={{ backgroundColor: '#161b22', borderColor: '#30363d' }}>
              <Title order={3} c="white" mb="md">Recent Reviews</Title>

              <Stack gap="sm">
                {recentReviews.map((review, index) => (
                  <Stack key={index} gap={4} style={{ borderBottom: index === recentReviews.length - 1 ? 'none' : '1px solid #30363d', paddingBottom: 8 }}>
                    <Group align="center">
                      <Text c="green" size="xs" component="code">{review.pr}</Text>
                      <Badge color={review.status === 'approved' ? 'green' : 'yellow'} variant="light">
                        {review.status === 'approved' ? 'Approved' : 'Changes'}
                      </Badge>
                    </Group>
                    <Text c="white" size="sm">{review.title}</Text>
                    <Group align="center">
                      <Group gap="xs">
                        <Avatar color="gray" radius="xl" size={24}>
                          {review.author.substring(0, 2).toUpperCase()}
                        </Avatar>
                        <Text c="gray.5" size="xs">{review.author}</Text>
                      </Group>
                      <Group gap={4}>
                        <Progress value={review.score} size={6} style={{ width: 64 }} />
                        <Text c="gray.5" size="sm">{review.score}</Text>
                      </Group>
                    </Group>
                  </Stack>
                ))}
              </Stack>
            </Card>

            {/* Weekly Goal */}
            <Card p="lg" radius="md" withBorder style={{ backgroundColor: '#161b22', borderColor: '#30363d' }}>
              <Text c="white" fw={500} mb={4}>Weekly Goal</Text>
              <Stack gap={4}>
                <Group align="center" gap="xs">
                  <Text c="gray.5" size="sm">24 / 30 reviews</Text>
                  <Text c="green" size="sm">80%</Text>
                </Group>
                <Progress value={80} size={6} />
                <Text c="gray.5" size="xs">6 more reviews to reach your goal!</Text>
              </Stack>
            </Card>
          </Stack>
        </Group>
      </Container>
    </Box>
  );
}

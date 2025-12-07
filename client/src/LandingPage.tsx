import { LuZap, LuTrophy, LuTrendingUp, LuGitBranch, LuCodeXml, LuStar } from "react-icons/lu";
import {Container, Title, Text, Button, Card, Grid, Group, Stack, Center, ThemeIcon, Box, } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import {useAuth0} from "@auth0/auth0-react";

const IconWrapper = ({ icon: Icon, size = 24 }: { icon: any; size?: number }) => <Icon size={size} />;

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const navigate = useNavigate();
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0();
  const features = [
    { icon: LuZap, title: "AI-Powered Insights", description: "Get intelligent feedback on your code reviews with advanced AI analysis" },
    { icon: LuTrophy, title: "Gamified Experience", description: "Earn achievements, level up, and compete on the leaderboard" },
    { icon: LuTrendingUp, title: "Track Progress", description: "Monitor your code review quality and improvement over time" },
    { icon: LuGitBranch, title: "Deep Integration", description: "Seamlessly integrates with your GitHub workflow" },
  ];

  return (
    <Box bg="#0d1117" style={{ minHeight: "100vh" }}>
      {/* Hero Section */}
      <Container size="lg" py={80}>
        <Center mb="lg">
          <Box pos="relative">
            <ThemeIcon size={100} variant="transparent" radius="xl" color="green">
              <IconWrapper icon={LuCodeXml} size={80} />
            </ThemeIcon>
            <ThemeIcon
              size={45}
              radius="xl"
              variant="transparent"
              color="yellow"
              style={{ position: "absolute", top: -10, right: -8 }}
            >
              <IconWrapper icon={LuStar} size={30} />
            </ThemeIcon>
          </Box>
        </Center>

        <Stack align="center" gap="md" ta="center">
          <Title order={1} c="white">Level Up Your Code Reviews</Title>
          <Text c="gray.5" size="lg" maw={600}>
            Transform code reviews into an engaging experience with AI-powered insights, achievements, and friendly competition.
          </Text>

          <Group mt="lg">
            <Button color="green" size="md" onClick={() => navigate("/dashboard")} leftSection={<IconWrapper icon={LuCodeXml} size={18}  />}>
              Get Started
            </Button>
            {!isAuthenticated && (
                <Button
                  variant="transparent"
                  color="gray"
                  onClick={()=> loginWithRedirect()}
                  styles={{
                    root: {
                      borderColor: "#30363d",
                      color: "#ccc",
                      "&:hover": { backgroundColor: "#21262d", color: "#fff" },
                    },
                  }}
                >
                  Login
                </Button>
            )}
          </Group>
        </Stack>
      </Container>

      {/* Features Grid */}
      <Container size="lg" py={80}>
        <Grid>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 3 }}>
                <Card
                  shadow="sm"
                  radius="lg"
                  p="lg"
                  mih="100%"
                  style={{ backgroundColor: "#161b22", border: "1px solid #30363d", transition: "border-color 0.3s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#16a34a")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#30363d")}
                >
                  <ThemeIcon size={48} variant="transparent" color="green" radius="xl" mb="md">
                    <IconWrapper icon={Icon} size={28} />
                  </ThemeIcon>
                  <Title order={4} c="white" mb={4}>{feature.title}</Title>
                  <Text size="sm" c="gray.5">{feature.description}</Text>
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Container size="lg" py={80}>
        <Card radius="lg" p="xl" style={{ backgroundColor: "#161b22", border: "1px solid #30363d" }}>
          <Grid ta="center">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Text fz={40} fw={700} c="green">10K+</Text>
              <Text c="gray.5">Reviews Analyzed</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Text fz={40} fw={700} c="green">500+</Text>
              <Text c="gray.5">Active Users</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Text fz={40} fw={700} c="green">95%</Text>
              <Text c="gray.5">Satisfaction Rate</Text>
            </Grid.Col>
          </Grid>
        </Card>
      </Container>
    </Box>
  );
}

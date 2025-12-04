import { Card, Badge, Progress, Grid, Text, Title, Group, ThemeIcon, Box, Container, } from "@mantine/core";
import {LuTrophy, LuStar, LuZap, LuTarget, LuAward, LuLock, LuFlame, LuCrown, LuMedal, LuSparkles, } from "react-icons/lu";
import "./App.css";
import {useEffect, useMemo, useState} from "react";
import {useAuth0} from "@auth0/auth0-react";
import {updateUserScores} from "./Dashboard";

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: React.FC<{ size?: number }>;
  earned: boolean;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  earnedDate?: string;
  max?: number;
  maxPR?: number;
  current?: number;
  PRCount?: number;
  points?: number;
}
interface GithubUser {
  login: string;
  avatar_url: string | null;
}

interface GithubSearchResponse {
  total_count?: number;
  items: GithubPR[];
}

interface GithubPR {
  id: number;
  number: number;
  title: string;
  created_at: string;
  // comments: number;
  user: GithubUser;
  html_url: string;
  commentData?: Array<{ id: number; body: string; user: GithubUser }>;
}

const IconWrapper = ({ icon: Icon, size = 24 }: { icon: any; size?: number }) => <Icon size={size} />;

export function Achievements() {


 const { user, isAuthenticated } = useAuth0();
const [userPoints, setUserPoints] = useState<number>(0);
const [prCount, setPrCount] = useState<number>(0);
  const [topMembers, setTopMembers] = useState<LeaderboardEntry[] | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [reviewsThisWeek, setReviewsThisWeek] = useState<number>(0);


  const achievements: Achievement[] = [
    {
      id: 1,
      name: "First Review",
      description: "Complete your first code review",
      icon: ({ size = 20 }) => <IconWrapper icon={LuStar} size={size} />,
      earned: false,
      rarity: "common",
        points: 1,

    },
    {
      id: 2,
      name: "200 points",
      description: "Achieved 200 points overall",
      icon: ({ size = 20 }) => <IconWrapper icon={LuFlame} size={size} />,
      earned: false,
      rarity: "rare",
        max: 200,
        points: 5,
    },
    {
      id: 3,
      name: "First PR",
      description: "Have 1 PR be reviewed by our AI",
      icon: ({ size = 20 }) => <IconWrapper icon={LuTrophy} size={size} />,
      earned: false,
      rarity: "common",
        points: 1,
    },
    {
      id: 4,
      name: "600 points",
      description: "Achieved 600 points overall",
      icon: ({ size = 20 }) => <IconWrapper icon={LuTarget} size={size} />,
      earned: false,
      rarity: "rare",
      max: 600,
        points: 10,
    },
    {
      id: 5,
      name: "OMEGA",
      description: "Have 3 PRs be reviewed by our AI",
      icon: ({ size = 20 }) => <IconWrapper icon={LuZap} size={size} />,
      earned: false,
      rarity: "uncommon",
        maxPR: 3,
        points: 10,
    },
    {
      id: 6,
      name: "Quality Expert",
      description: "Gain 3000 points",
      icon: ({ size = 20 }) => <IconWrapper icon={LuAward} size={size} />,
      earned: false,
      rarity: "epic",
      max: 3000,
        points: 50,
    },
    {
      id: 7,
      name: "Ultimate Coder",
      description: "Gain 10000000 points",
      icon: ({ size = 20 }) => <IconWrapper icon={LuCrown} size={size} />,
      earned: false,
      rarity: "legendary",
      max: 10000000,
        points: 20,
    },
    {
      id: 8,
      name: "AI Whisperer",
      description: "have 100 PRs be reviewed by our AI",
      icon: ({ size = 20 }) => <IconWrapper icon={LuMedal} size={size} />,
      earned: false,
      rarity: "legendary",
        maxPR: 100,
        points: 100,
    },
    {
      id: 9,
      name: "4 Prs",
      description: "Have 4 Prs be reviewed by our AI",
      icon: ({ size = 20 }) => <IconWrapper icon={LuSparkles} size={size} />,
      earned: false,
      rarity: "rare",
      maxPR: 4,
        points: 3,
    },
  ];
interface LeaderboardEntry {
  id: number;
  name: string;
  score: number;
  img?: string;
}


  const rarityColors: Record<Achievement["rarity"], string> = {
    common: "gray",
    uncommon: "green",
    rare: "blue",
    epic: "grape",
    legendary: "yellow",
  };


const achievementsWithEarned = useMemo(() => {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return achievements.map(a => {
    // Calculate if earned
    let earned = a.earned;
    if (a.name === "First Review") earned = userPoints >= 1;
    if (a.name === "200 points") earned = userPoints >= 200;
    if (a.name === "600 points") earned = userPoints >= 600;
    if (a.name === "Quality Expert") earned = userPoints >=4000;
    if (a.name === "Ultimate Coder") earned = userPoints >= 10000000;

    if (a.name === "First PR") earned = reviewsThisWeek >= 1;
    if (a.name === "OMEGA") earned = reviewsThisWeek >= 3;
    if (a.name === "4 Prs") earned = reviewsThisWeek >= 4;
    if (a.name === "AI Whisperer") earned = reviewsThisWeek >= 100;

    let earnedDate = a.earnedDate;
    if (earned && !earnedDate) {
      earnedDate = today;
    }

    const current = a.maxPR !== undefined ? reviewsThisWeek : userPoints;
    const displayMax = a.maxPR ?? a.max ?? 100;

    // const PRCount = reviewsThisWeek
    //   console.log(PRCount);
    // const current = userPoints;

    return { ...a, earned, earnedDate, current, displayMax };
  });
}, [userPoints, achievements]);



const stats = {
  total: achievementsWithEarned.length,
  earned: achievementsWithEarned.filter((a) => a.earned).length,
  points: achievementsWithEarned.reduce((sum, a) => sum + (a.earned ? a.points ?? 0 : 0), 0),
};




   useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/users?type=overall");
      const data = await res.json();
      const currentUser: LeaderboardEntry | undefined = data.leaderboard.find(
        (u: LeaderboardEntry) => u.name === user?.nickname
      );
      if (currentUser) {
        setUserPoints(currentUser.score);
        setUserId(currentUser.id);
      }
    };
    fetchUser();
  }, []);


    useEffect(() => {
        if (!isAuthenticated || !user) return;

  async function load() {
      try {

          const username = (user as any).nickname;
          if (!username) {
              return;
          }

          const scoreRes = await updateUserScores(username);

          console.log("Updated scores:", scoreRes);

          const prsRes = await fetch(`/api/github/user/prs?username=${encodeURIComponent(username)}`);


          const commentsRes = await fetch(`/api/github/user/prs/comments?username=${encodeURIComponent(username)}`);

          if (!prsRes.ok) {
              const text = await prsRes.text();
              throw new Error(`Failed to fetch PRs: ${prsRes.status} ${text}`);
          }

          if (!commentsRes.ok) {
              const text = await commentsRes.text();
              throw new Error(`failed to fetch comments': ${commentsRes.status} ${text}`);
          }

          const prsJson = (await prsRes.json()) as GithubSearchResponse;
          const prItems: GithubPR[] = prsJson.items ?? [];
          const topPrs = prItems.slice(0, 4);
            setReviewsThisWeek(topPrs.length);
            console.log("Reviews this week:", topPrs.length);


          //const reviewsThisWeek = topPrs.length;
          //console.log(reviewsThisWeek);
      }
      catch (err){
      console.error(err);
        }
  }
           void load();
    }, [isAuthenticated, user]);



  return (
    <Box style={{ backgroundColor: "#0d1117", minHeight: "100vh", padding: 32 }}>
      <Container size="lg">
        <Box mb="xl">
          <Title order={1} c="white" mb={4}>
            Achievements
          </Title>
          <Text c="dimmed">Track your code review accomplishments</Text>
        </Box>

        {/* Stats Overview */}
        <Grid mb="xl">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card
                withBorder p="lg"
                style={{ backgroundColor: "#161b22", borderColor: "#30363d" }}
            >
              <Group align="center">
                <ThemeIcon size={48} color="green" radius="xl" variant="light">
                  <IconWrapper icon={LuTrophy} size={24} />
                </ThemeIcon>
                <div>
                  <Text size="xl" fw={700} c="white">
                    {stats.earned}/{stats.total}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Achievements Unlocked
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card
                withBorder
                p="lg"
                style={{ backgroundColor: "#161b22", borderColor: "#30363d" }}
            >
              <Group align="center">
                <ThemeIcon size={48} color="yellow" radius="xl" variant="light">
                  <IconWrapper icon={LuStar} size={24} />
                </ThemeIcon>
                <div>
                  <Text size="xl" fw={700} c="white">
                    {stats.points}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Achievement Points
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card
                withBorder
                p="lg"
                style={{ backgroundColor: "#161b22", borderColor: "#30363d" }}
            >
              <Group align="center">
                <ThemeIcon size={48} color="grape" radius="xl" variant="light">
                  <IconWrapper icon={LuCrown} size={24} />
                </ThemeIcon>
                <div>
                  <Text size="xl" fw={700} c="white">
                    {Math.round((stats.earned / stats.total) * 100)}%
                  </Text>
                  <Text size="sm" c="dimmed">
                    Completion Rate
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Achievements Grid */}
        <Grid>
          {achievementsWithEarned.map((achievement) => {
            const Icon = achievement.icon;
            const color = rarityColors[achievement.rarity];

            return (
              <Grid.Col span={{ base: 12, sm: 6, lg: 4 }} key={achievement.id}>
                <Card
                    withBorder
                    p="lg"
                    radius="md"
                    style={{
                            backgroundColor: "#161b22",
                            borderColor: "#30363d",
                            opacity: achievement.earned ? 1 : 0.6,
                            transition: "border-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                        if (achievement.earned) {
                            (e.currentTarget.style.borderColor = "#16a34a")
                        }else {
                            (e.currentTarget.style.borderColor = "#3e424a")
                        }
                    }}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#30363d")}
                >
                  <Group justify="space-between" mb="sm">
                    <ThemeIcon
                      size={42}
                      radius="md"
                      variant="light"
                      color={achievement.earned ? color : "gray"} >
                      {achievement.earned ? <IconWrapper icon={Icon} size={20} /> : <IconWrapper icon={LuLock} size={20} />}
                    </ThemeIcon>

                    <Badge color={color} variant="light" tt="capitalize">
                      {achievement.rarity}
                    </Badge>
                  </Group>

                  <Title order={4} c="white" mb={4}>
                    {achievement.name}
                  </Title>
                  <Text c="dimmed" size="sm" mb="sm">
                    {achievement.description}
                  </Text>

                  {achievement.earned ? (
                    <Text size="xs" c="green">
                      Earned on {achievement.earnedDate}
                    </Text>
                  ) : (
                    <Box>
                      <Group justify="space-between" mb={4}>
                        <Text size="xs" c="dimmed">
                          {achievement.current ?? 0} / {achievement.displayMax}

                        </Text>

                      </Group>

                    </Box>
                  )}
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
  }


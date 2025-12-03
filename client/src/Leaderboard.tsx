import {Card, Table, Tabs, Avatar, Badge, Group, Text, Box, Flex, Stack, Container, Title, Divider, ThemeIcon, } from "@mantine/core";
import {LuCrown, LuMedal, LuAward, LuTrendingUp, LuTrendingDown, LuMinus, } from "react-icons/lu";
import {useEffect, useState} from "react";
import {useAuth0} from "@auth0/auth0-react";

interface LeaderboardEntry {
  id: number;
  name: string;
  score: number;
  img?: string;
}

const IconWrapper = ({ icon: Icon, size = 24 }: { icon: any; size?: number }) => <Icon size={size} />;







export function Leaderboard() {
const [members, setMembers] = useState<LeaderboardEntry[] | null>(null);
const [activeTab, setActiveTab] = useState<string>("overall");
 const { user, isAuthenticated } = useAuth0();

const fetchLeaderboard = async (type: string) => {
  //  setMembers(null);


    try {
      const res = await fetch(`/api/users?type=${type}`);
      const data = await res.json();
      if (data.leaderboard) {
        const sorted = [...data.leaderboard].sort((a, b) => b.score - a.score);
        setMembers(sorted);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setMembers([]);
    }
  };
    // const leaderboardData = [
    //   {
    //     rank: 1,
    //     username: "sarah-dev",
    //     score: 2847,
    //     reviews: 342,
    //     accuracy: 96,
    //     streak: 45,
    //     change: 2,
    //     level: 28,
    //   },
    //   {
    //     rank: 2,
    //     username: "mike-codes",
    //     score: 2734,
    //     reviews: 318,
    //     accuracy: 94,
    //     streak: 32,
    //     change: -1,
    //     level: 27,
    //   },
    //   {
    //     rank: 3,
    //     username: "alex-eng",
    //     score: 2612,
    //     reviews: 295,
    //     accuracy: 95,
    //     streak: 28,
    //     change: 1,
    //     level: 26,
    //   },
    //   {
    //     rank: 4,
    //     username: "you",
    //     score: 2401,
    //     reviews: 267,
    //     accuracy: 92,
    //     streak: 21,
    //     change: 0,
    //     level: 24,
    //     isCurrentUser: true,
    //   },
    //   {
    //     rank: 5,
    //     username: "emma-tech",
    //     score: 2289,
    //     reviews: 251,
    //     accuracy: 91,
    //     streak: 19,
    //     change: 3,
    //     level: 23,
    //   },
    //   {
    //     rank: 6,
    //     username: "chris-dev",
    //     score: 2156,
    //     reviews: 234,
    //     accuracy: 89,
    //     streak: 15,
    //     change: -2,
    //     level: 22,
    //   },
    //   {
    //     rank: 7,
    //     username: "lisa-codes",
    //     score: 2043,
    //     reviews: 221,
    //     accuracy: 90,
    //     streak: 17,
    //     change: 1,
    //     level: 21,
    //   },
    //   {
    //     rank: 8,
    //     username: "james-eng",
    //     score: 1987,
    //     reviews: 208,
    //     accuracy: 88,
    //     streak: 12,
    //     change: 0,
    //     level: 20,
    //   },
    //   {
    //     rank: 9,
    //     username: "olivia-dev",
    //     score: 1845,
    //     reviews: 192,
    //     accuracy: 87,
    //     streak: 14,
    //     change: 2,
    //     level: 19,
    //   },
    //   {
    //     rank: 10,
    //     username: "noah-tech",
    //     score: 1723,
    //     reviews: 178,
    //     accuracy: 85,
    //     streak: 10,
    //     change: -1,
    //     level: 18,
    //   },
    // ];
useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);
    // Rank icons
    const getRankIcon = (rank: number) => {
        if (rank === 1) return (
            <ThemeIcon size={28} radius="xl" variant="transparent" color="#f5c518">
                <IconWrapper icon={LuCrown} size={20}/>
            </ThemeIcon>
        );
        if (rank === 2) return (
            <ThemeIcon size={28} radius="xl" variant="transparent" color="#9ca3af">
                <IconWrapper icon={LuMedal} size={20}/>
            </ThemeIcon>
        );
        if (rank === 3) return (
            <ThemeIcon size={28} radius="xl" variant="transparent" color="#b45309">
                <IconWrapper icon={LuAward} size={20}/>
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
                    <IconWrapper icon={LuTrendingUp} size={16}/>
                </ThemeIcon>
            );

        if (change < 0)
            return (
                <ThemeIcon size={28} radius="xl" variant="transparent" color="#ef4444">
                    <IconWrapper icon={LuTrendingDown} size={16}/>
                </ThemeIcon>
            );

        return (
            <ThemeIcon size={28} radius="xl" variant="transparent" color="#6b7280">
                <IconWrapper icon={LuMinus} size={16}/>
            </ThemeIcon>
        );
    };


    if (!isAuthenticated) return <Text c="white">Please log in</Text>;
  if (!members) return <Text c="white">Loading...</Text>;

  const username = (user as any).nickname;
    if(!members){
      return <Text c="white">Loading...</Text>;
    }
    if (members != null && isAuthenticated) {

        return (
            <Box bg="#0d1117" pt={32} pb={64} style={{minHeight: "100vh"}}>
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
                        style={{backgroundColor: "#161b22", borderColor: "#30363d"}}
                    >
                        <Flex justify="center" align="flex-end" gap="xl">

                            {/* Second Place */}
                            <Stack align="center" gap={6}>
                                <Avatar
                                    size="lg"
                                    radius="xl"
                                    color="white"
                                    style={{backgroundColor: "#494f5e", border: "2px solid #9ca3af"}}
                                >

                                    {members?.[1].name.slice(0, 2).toUpperCase()}
                                </Avatar>
                                <ThemeIcon size={40} radius="xl" variant="transparent" color="#9ca3af">
                                    <IconWrapper icon={LuMedal} size={32}/>
                                </ThemeIcon>
                                <Text c="white">{members?.[1].name}</Text>
                                <Text c="green.5" fw={700} fz={24}>
                                    {members?.[1].score}
                                </Text>
                                {/*<Badge color="gray" variant="light">*/}
                                {/*  /!*Level {members[1].level}*!/*/}
                                {/*</Badge>*/}
                            </Stack>

                            {/* First Place */}
                            <Stack align="center" gap={6}>
                                <Avatar
                                    size={96}
                                    radius={100}
                                    color="white"
                                    variant="transparent"
                                    style={{backgroundColor: "#b17300", border: "4px solid #f5c518"}}
                                >
                                    {members?.[0].name.slice(0, 2).toUpperCase()}
                                </Avatar>
                                <ThemeIcon size={50} radius="xl" variant="transparent" color="#f5c518">
                                    <IconWrapper icon={LuCrown} size={40}/>
                                </ThemeIcon>
                                <Text c="white">{members?.[0].name}</Text>
                                <Text c="green.5" fw={700} fz={32}>
                                    {members?.[0].score}
                                </Text>
                                {/*<Badge color="yellow" variant="light">*/}
                                {/*  /!*Level {members[0].level}*!/*/}
                                {/*</Badge>*/}
                            </Stack>

                            {/* Third Place */}
                            <Stack align="center" gap={6}>
                                <Avatar
                                    size="lg"
                                    radius="xl"
                                    color="white"
                                    variant="transparent"
                                    style={{backgroundColor: "#8e4003", border: "2px solid #b45309"}}
                                >
                                    {members?.[2].name.slice(0, 2).toUpperCase()}
                                </Avatar>
                                <ThemeIcon size={40} radius="xl" variant="transparent" color="#b45309">
                                    <IconWrapper icon={LuAward} size={32}/>
                                </ThemeIcon>
                                <Text c="white">{members?.[2].name}</Text>
                                <Text c="green.5" fw={700} fz={24}>
                                    {members?.[2].score}
                                </Text>
                                {/*<Badge color="orange" variant="light">*/}
                                {/*  Level {leaderboardData[2].level}*/}
                                {/*</Badge>*/}
                            </Stack>

                        </Flex>
                    </Card>

                    {/* FULL LEADERBOARD */}
                    <Card
                        withBorder
                        style={{backgroundColor: "#161b22", borderColor: "#30363d"}}
                    >
                       <Tabs
                              value={activeTab}
                              onChange={(value: string | null) => setActiveTab(value || "overall")}
                              variant="pills"
                              radius="md"
                              color="#30363d" c="gray.5"
                             // style={{ backgroundColor: "#161b22", borderColor: "#30363d" }}
>

                            <Tabs.List px="md" pt="md">

                                <Tabs.Tab value="overall">Overall</Tabs.Tab>
                                <Tabs.Tab value="comment">Commenters</Tabs.Tab>
                                <Tabs.Tab value="code">PR Code</Tabs.Tab>
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
                                            {["Rank", "User", "Score", "Reviews", "Change"].map((h) => (
                                                <Table.Th key={h}>
                                                    <Text c="gray.5">{h}</Text>
                                                </Table.Th>
                                            ))}
                                        </Table.Tr>
                                    </Table.Thead>


                                    <Table.Tbody>

                                        {members.map((member) => (
                                            <Table.Tr
                                                key={member.id}
                                                style={{
                                                    backgroundColor:
                                                        isAuthenticated && member.name.toLowerCase() == username
                                                       ? "rgba(34,197,94,0.08)" : "transparent",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <Table.Td>
                                                    {/*{getRankIcon(user.rank)}*/}
                                                </Table.Td>

                                                <Table.Td>
                                                    <Group>
                                                        <Avatar size="sm" radius="xl">
                                                            {member.name.slice(0, 2).toUpperCase()}
                                                        </Avatar>
                                                        <div>
                                                            <Text c="white">

                                                                {member.name}{" "}
                                                                {isAuthenticated && member.name === username &&(
                                                                    <Badge color="green" ml={4}
                                                                           variant="light">You</Badge>
                                                                )}
                                                            </Text>
                                                            <Text c="dimmed" fz="xs">
                                                                {/*Level {user.level}*/}
                                                            </Text>
                                                        </div>
                                                    </Group>
                                                </Table.Td>

                                                <Table.Td>
                                                    <Text c="green.5">{member.score.toLocaleString()}</Text>
                                                </Table.Td>

                                                {/*<Table.Td>*/}
                                                {/*    /!*<Text c="gray.4">{user.reviews}</Text>*!/*/}
                                                {/*</Table.Td>*/}

                                                {/*<Table.Td>*/}
                                                {/*    /!*<Text c="gray.4">{user.accuracy}%</Text>*!/*/}
                                                {/*</Table.Td>*/}

                                                <Table.Td>
                                                    <Badge color="orange" variant="light">
                                                        {/*🔥 {user.streak}*/}
                                                    </Badge>
                                                </Table.Td>

                                                <Table.Td>
                                                    {/*<Group gap={4}>*/}
                                                    {/*    /!*{getTrendIcon(user.change)}*!/*/}
                                                    {/*    /!*{user.change !== 0 && (*!/*/}
                                                    {/*    /!*    <Text c={user.change > 0 ? "green" : "red"}>*!/*/}
                                                    {/*    /!*        {Math.abs(user.change)}*!/*/}
                                                    {/*    /!*    </Text>*!/*/}
                                                    {/*    )}*/}
                                                    {/*</Group>*/}
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Tabs.Panel>

                            {/* Placeholder panels */}
                            <Tabs.Panel value="comment">
                                <Table
                                    highlightOnHover
                                    verticalSpacing="md"
                                    horizontalSpacing="lg"
                                >
                                    <Table.Thead>
                                        <Table.Tr>
                                            {["Rank", "User", "Score", "Reviews", "Change"].map((h) => (
                                                <Table.Th key={h}>
                                                    <Text c="gray.5">{h}</Text>
                                                </Table.Th>
                                            ))}
                                        </Table.Tr>
                                    </Table.Thead>


                                    <Table.Tbody>

                                        {members.map((member) => (
                                            <Table.Tr
                                                key={member.id}
                                                style={{
                                                    backgroundColor:
                                                        isAuthenticated && member.name.toLowerCase() == username
                                                       ? "rgba(34,197,94,0.08)" : "transparent",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <Table.Td>
                                                    {/*{getRankIcon(user.rank)}*/}
                                                </Table.Td>

                                                <Table.Td>
                                                    <Group>
                                                        <Avatar size="sm" radius="xl">
                                                            {member.name.slice(0, 2).toUpperCase()}
                                                        </Avatar>
                                                        <div>
                                                            <Text c="white">

                                                                {member.name}{" "}
                                                                {isAuthenticated && member.name === username &&(
                                                                    <Badge color="green" ml={4}
                                                                           variant="light">You</Badge>
                                                                )}
                                                            </Text>
                                                            <Text c="dimmed" fz="xs">
                                                                {/*Level {user.level}*/}
                                                            </Text>
                                                        </div>
                                                    </Group>
                                                </Table.Td>

                                                <Table.Td>
                                                    <Text c="green.5">{member.score.toLocaleString()}</Text>
                                                </Table.Td>

                                                {/*<Table.Td>*/}
                                                {/*    /!*<Text c="gray.4">{user.reviews}</Text>*!/*/}
                                                {/*</Table.Td>*/}

                                                {/*<Table.Td>*/}
                                                {/*    /!*<Text c="gray.4">{user.accuracy}%</Text>*!/*/}
                                                {/*</Table.Td>*/}

                                                <Table.Td>
                                                    <Badge color="orange" variant="light">
                                                        {/*🔥 {user.streak}*/}
                                                    </Badge>
                                                </Table.Td>

                                                <Table.Td>
                                                    {/*<Group gap={4}>*/}
                                                    {/*    /!*{getTrendIcon(user.change)}*!/*/}
                                                    {/*    /!*{user.change !== 0 && (*!/*/}
                                                    {/*    /!*    <Text c={user.change > 0 ? "green" : "red"}>*!/*/}
                                                    {/*    /!*        {Math.abs(user.change)}*!/*/}
                                                    {/*    /!*    </Text>*!/*/}
                                                    {/*    )}*/}
                                                    {/*</Group>*/}
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Tabs.Panel>

                            <Tabs.Panel value="code">
                                <Table
                                    highlightOnHover
                                    verticalSpacing="md"
                                    horizontalSpacing="lg"
                                >
                                    <Table.Thead>
                                        <Table.Tr>
                                            {["Rank", "User", "Score", "Reviews", "Change"].map((h) => (
                                                <Table.Th key={h}>
                                                    <Text c="gray.5">{h}</Text>
                                                </Table.Th>
                                            ))}
                                        </Table.Tr>
                                    </Table.Thead>


                                    <Table.Tbody>

                                        {members.map((member) => (
                                            <Table.Tr
                                                key={member.id}
                                                style={{
                                                    backgroundColor:
                                                        isAuthenticated && member.name.toLowerCase() == username
                                                       ? "rgba(34,197,94,0.08)" : "transparent",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <Table.Td>
                                                    {/*{getRankIcon(user.rank)}*/}
                                                </Table.Td>

                                                <Table.Td>
                                                    <Group>
                                                        <Avatar size="sm" radius="xl">
                                                            {member.name.slice(0, 2).toUpperCase()}
                                                        </Avatar>
                                                        <div>
                                                            <Text c="white">

                                                                {member.name}{" "}
                                                                {isAuthenticated && member.name === username &&(
                                                                    <Badge color="green" ml={4}
                                                                           variant="light">You</Badge>
                                                                )}
                                                            </Text>
                                                            <Text c="dimmed" fz="xs">
                                                                {/*Level {user.level}*/}
                                                            </Text>
                                                        </div>
                                                    </Group>
                                                </Table.Td>

                                                <Table.Td>
                                                    <Text c="green.5">{member.score.toLocaleString()}</Text>
                                                </Table.Td>

                                                {/*<Table.Td>*/}
                                                {/*    /!*<Text c="gray.4">{user.reviews}</Text>*!/*/}
                                                {/*</Table.Td>*/}

                                                {/*<Table.Td>*/}
                                                {/*    /!*<Text c="gray.4">{user.accuracy}%</Text>*!/*/}
                                                {/*</Table.Td>*/}

                                                <Table.Td>
                                                    <Badge color="orange" variant="light">
                                                        {/*🔥 {user.streak}*/}
                                                    </Badge>
                                                </Table.Td>

                                                <Table.Td>
                                                    {/*<Group gap={4}>*/}
                                                    {/*    /!*{getTrendIcon(user.change)}*!/*/}
                                                    {/*    /!*{user.change !== 0 && (*!/*/}
                                                    {/*    /!*    <Text c={user.change > 0 ? "green" : "red"}>*!/*/}
                                                    {/*    /!*        {Math.abs(user.change)}*!/*/}
                                                    {/*    /!*    </Text>*!/*/}
                                                    {/*    )}*/}
                                                    {/*</Group>*/}
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Tabs.Panel>
                        </Tabs>
                    </Card>
                </Container>
            </Box>
        );
    } return null;
}

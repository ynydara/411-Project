import "./App.css";
import React, { useEffect, useState } from "react";
import { IconTrophy } from "@tabler/icons-react";
import {useAuth0} from "@auth0/auth0-react";
import { Text, Card, Center, Button, Container, Group, Stack, Avatar, Badge } from "@mantine/core";
import '@mantine/core/styles.css';


type LeaderBoardUser = {
    rank: number;
    name: string;
    score: number;
    color: string;
    badgeColor: string;
    };
const leaderboardData: LeaderBoardUser[] = [
        { rank: 1, name: "John Doe", score: 1790, color: "yellow", badgeColor: "blue" },
        { rank: 2, name: "Jane Doe", score: 1490, color: "gray", badgeColor: "teal"},
        { rank: 3, name: "Bob Johnson", score: 1230, color: "orange", badgeColor: "red" },
    ];


function LoginPage() {
    const { loginWithRedirect, logout, isAuthenticated, user, isLoading, getAccessTokenSilently } = useAuth0();
     const [githubToken, setGithubToken] = useState<string | null>(null);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const token = await getAccessTokenSilently();
                setGithubToken(token);
                //put cookie stuff here
            } catch (err) {
                console.error("Error getting GitHub token:", err);
            }
        };
        fetchToken();
    }, [getAccessTokenSilently]);


    return (
    <>
        <Container fluid py="xl">
              <Card
                shadow="xl"
                padding="2xl"
                radius="lg"
                withBorder
                style={{   maxWidth: "80%",
                            minWidth: "700px",
                            height: "500px",    //  fixed height
                            margin: "0 auto",
                            textAlign: "center",

                            display: "flex",         // center content vertically
                            alignItems: "center",    // vertically center
                            justifyContent: "center"}}
              >
                <Center>
                    <Stack align="center" mb="md">
                      <Text
                        component="span"
                        style={{
                          fontFamily: "Greycliff CF, sans-serif",
                          fontSize: "3.5rem",
                          fontWeight: 700,
                          background: "linear-gradient(45deg, indigo, cyan)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          display: "inline-block",
                        }}
                      >
                         Gamify Your<br />Code Reviews
                      </Text>
                      <Text
                        component="span"
                        style={{
                            fontFamily: "Arial, sans-serif",
                            fontSize: "5.0 rem",
                            maxWidth: "420px",
                            align: "center",
                            }}

                      >
                      Turn everyday code into a competitive,
                      engaging, and AI-powered experience. Connect with Github,
                      review smarter, and climb the leaderboard.
                      </Text>
                      <Button
                        variant="gradient"
                        gradient={{from: 'indigo', to: 'cyan', deg: 90}}
                        size="compact-lg"
                        onClick={()=> loginWithRedirect()}

                      >
                        Login with Github
                      </Button>
                    </Stack>
                    <Card
                       withBorder
                       shadow="md"
                       radius="md"
                       p = "lg"
                       style={{
                           width: 400,
                           marginLeft: "2rem"
                       }}
                   >
                          <Stack>
                                {leaderboardData.map((user) => (
                                  <Group key={user.rank} justify="space-between">
                                    <Group>
                                      <Avatar
                                        radius="xl"
                                        size="md"
                                        color={user.color}
                                      >
                                        {user.rank}
                                      </Avatar>
                                      <Stack gap={0} style={{ lineHeight: 1 }}>
                                        <Text fw={500}>{user.name}</Text>
                                        <Text size="sm" c="dimmed">
                                          {user.score}
                                        </Text>
                                      </Stack>
                                    </Group>

                                    <Badge
                                      variant="light"
                                      color={user.badgeColor}
                                      size="lg"
                                      radius="md"
                                      style={{ paddingInline: 10 }}
                                    >
                                      <IconTrophy size={18} />
                                    </Badge>
                                  </Group>
                                ))}
                              </Stack>
                         </Card>
                </Center>
              </Card>
        </Container>


    </>
  );
}
export default LoginPage;
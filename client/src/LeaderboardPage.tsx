import "./App.css";
import React, { useEffect, useState } from "react";
import {Title, Text, Loader, Table, Tabs, Avatar, Group} from "@mantine/core";
import {useAuth0} from "@auth0/auth0-react";

interface LeaderboardEntry {
  name: string;
  score: number;
  img: "https://i.pravatar.cc/100?img=5";
}


function LeaderboardPage() {
  const [topMembers, setTopMembers] = useState<LeaderboardEntry[] | null>(null);
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [activeTab, setActiveTab] = useState<string | null>("overall");

  const thStyle: React.CSSProperties = {
      border: "1px solid black",
      padding: "4px",
      backgroundColor: "#c6c6c6",
      textAlign: "center"
    };

    const tdStyle: React.CSSProperties = {
      border: "1px solid black",
      padding: "4px"
    };

  useEffect(() => {
    fetch("/leaderboard")
      .then((res) => res.json())
      .then((res) => {
        const sorted = [...res.leaderboard].sort(
          (a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score
        );
       setTopMembers(sorted)
      });
  }, []);

  return (
      <div style={{ padding: "2rem", height: "100vh"}}>
          <Tabs
              value={activeTab}
              onChange={setActiveTab}
              orientation="vertical"
              keepMounted={false}
              styles={(theme) => ({
              root: {
                  display: "flex",
                  minHeight: "80vh",
              },
              list: {
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "stretch",
                  minWidth: 180,
                  borderRight: `1px solid ${theme.colors.gray[3]}`,
                  paddingRight: "1rem",
                  height: "100%",
              },
              tab: {
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  padding: "0.8rem 1rem",
                  fontSize: theme.fontSizes.md,
                  borderRadius: theme.radius.sm,
                  fontWeight: 500,
                  transition: "background-color 150ms ease",
                  "&:hover": {
                      backgroundColor: theme.colors.gray[0],
                  },
                  "&[data-active]": {
                      backgroundColor: theme.colors.blue[0],
                      borderLeft: `4px solid ${theme.colors.blue[6]}`,
                      color: theme.colors.blue[7],
                      fontWeight: 600,
                  },
              },
              panel: {
                  flex: 1,
                  paddingLeft: "1.5rem",
              },
          })}
      >
            <Tabs.List>
                <Tabs.Tab value="overall">Overall</Tabs.Tab>
                <Tabs.Tab value="commenters">Commenters</Tabs.Tab>
                <Tabs.Tab value="pr code">PR Code</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="overall">
              <Title order={2} ta="center">
                Overall
              </Title>

              <Table.ScrollContainer minWidth={500}>
                <Table
                  highlightOnHover
                  verticalSpacing="xs"
                  striped
                  withColumnBorders={false}
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.95rem",
                  }}
                >
                  <thead style={{ backgroundColor: "#f2f2f2" }}>
                    <tr>
                      <th style={{ width: "5%", textAlign: "center" }}>#</th>
                      <th style={{ width: "45%" }}>User Name</th>
                      <th style={{ width: "20%", textAlign: "center" }}>Badges</th>
                      <th style={{ width: "20%", textAlign: "right" }}>Points</th>
                    </tr>
                  </thead>

                  <tbody>
                    {!topMembers ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center" }}>
                          <Loader />
                        </td>
                      </tr>
                    ) : (
                      topMembers.map((member, index) => (
                        <tr
                          key={index}
                          style={{
                            backgroundColor:
                              isAuthenticated && user && member.name === user.nickname
                                ? "#e6f4ff" // highlight color for current user
                                : index % 2 === 0
                                ? "#ffffff"
                                : "#f9fafb",
                          }}
                        >
                          {/* Rank */}
                          <td style={{ textAlign: "center", fontWeight: 500 }}>
                            {index + 1}
                          </td>

                          {/* Name + Avatar */}
                          <td>
                            <Group gap="sm">
                              <Avatar
                                size={30}
                                src={
                                  isAuthenticated && user && member.name === user.nickname
                                    ? user.picture
                                    : member.img
                                }
                                radius="xl"
                              />
                              <Text
                                fw={500}
                                component="a"
                                href="#"
                                style={{
                                  color: "#0077cc",
                                  textDecoration: "none",
                                }}
                              >
                                {member.name}
                              </Text>
                            </Group>
                          </td>

                          {/* Badges */}
                          <td style={{ textAlign: "center" }}>
                            {Math.floor(Math.random() * 6)} {/* placeholder */}
                          </td>

                          {/* Points */}
                          <td style={{ textAlign: "right", fontWeight: 600 }}>
                            {member.score}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </Table.ScrollContainer>
            </Tabs.Panel>

            <Tabs.Panel value="commenters">
              <Title order={2} ta="center">
                Commenters
              </Title>

              <Table.ScrollContainer minWidth={500}>
                <Table
                  highlightOnHover
                  verticalSpacing="xs"
                  striped
                  withColumnBorders={false}
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.95rem",
                  }}
                >
                  <thead style={{ backgroundColor: "#f2f2f2" }}>
                    <tr>
                      <th style={{ width: "5%", textAlign: "center" }}>#</th>
                      <th style={{ width: "45%" }}>User Name</th>
                      <th style={{ width: "20%", textAlign: "center" }}>Badges</th>
                      <th style={{ width: "20%", textAlign: "right" }}>Points</th>
                    </tr>
                  </thead>

                  <tbody>
                    {!topMembers ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center" }}>
                          <Loader />
                        </td>
                      </tr>
                    ) : (
                      topMembers.map((member, index) => (
                        <tr
                          key={index}
                          style={{
                            backgroundColor:
                              isAuthenticated && user && member.name === user.nickname
                                ? "#e6f4ff" // highlight color for current user
                                : index % 2 === 0
                                ? "#ffffff"
                                : "#f9fafb",
                          }}
                        >
                          {/* Rank */}
                          <td style={{ textAlign: "center", fontWeight: 500 }}>
                            {index + 1}
                          </td>

                          {/* Name + Avatar */}
                          <td>
                            <Group gap="sm">
                              <Avatar
                                size={30}
                                src={
                                  isAuthenticated && user && member.name === user.nickname
                                    ? user.picture
                                    : member.img
                                }
                                radius="xl"
                              />
                              <Text
                                fw={500}
                                component="a"
                                href="#"
                                style={{
                                  color: "#0077cc",
                                  textDecoration: "none",
                                }}
                              >
                                {member.name}
                              </Text>
                            </Group>
                          </td>

                          {/* Badges */}
                          <td style={{ textAlign: "center" }}>
                            {Math.floor(Math.random() * 6)} {/*  placeholder */}
                          </td>

                          {/* Points */}
                          <td style={{ textAlign: "right", fontWeight: 600 }}>
                            {member.score}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </Table.ScrollContainer>
            </Tabs.Panel>

            <Tabs.Panel value="pr code">
              <Title order={2} ta="center">
                PR Code
              </Title>

              <Table.ScrollContainer minWidth={500}>
                <Table
                  highlightOnHover
                  verticalSpacing="xs"
                  striped
                  withColumnBorders={false}
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.95rem",
                  }}
                >
                  <thead style={{ backgroundColor: "#f2f2f2" }}>
                    <tr>
                      <th style={{ width: "5%", textAlign: "center" }}>#</th>
                      <th style={{ width: "45%" }}>User Name</th>
                      <th style={{ width: "20%", textAlign: "center" }}>Badges</th>
                      <th style={{ width: "20%", textAlign: "right" }}>Points</th>
                    </tr>
                  </thead>

                  <tbody>
                    {!topMembers ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center" }}>
                          <Loader />
                        </td>
                      </tr>
                    ) : (
                      topMembers.map((member, index) => (
                        <tr
                          key={index}
                          style={{
                            backgroundColor:
                              isAuthenticated && user && member.name === user.nickname
                                ? "#e6f4ff" // highlight color for current user
                                : index % 2 === 0
                                ? "#ffffff"
                                : "#f9fafb",
                          }}
                        >
                          {/* Rank */}
                          <td style={{ textAlign: "center", fontWeight: 500 }}>
                            {index + 1}
                          </td>

                          {/* Name + Avatar */}
                          <td>
                            <Group gap="sm">
                              <Avatar
                                size={30}
                                src={
                                  isAuthenticated && user && member.name === user.nickname
                                    ? user.picture
                                    : member.img
                                }
                                radius="xl"
                              />
                              <Text
                                fw={500}
                                component="a"
                                href="#"
                                style={{
                                  color: "#0077cc",
                                  textDecoration: "none",
                                }}
                              >
                                {member.name}
                              </Text>
                            </Group>
                          </td>

                          {/* Badges */}
                          <td style={{ textAlign: "center" }}>
                            {Math.floor(Math.random() * 6)} {/* placeholder */}
                          </td>

                          {/* Points */}
                          <td style={{ textAlign: "right", fontWeight: 600 }}>
                            {member.score}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </Table.ScrollContainer>
            </Tabs.Panel>

      </Tabs>
  </div>
  );
}


export default LeaderboardPage;
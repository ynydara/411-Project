import "./App.css";
import React, { useEffect, useState } from "react";
import { Title, Text, Loader, Table, Tabs } from "@mantine/core";
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
      backgroundColor: "#f2f2f2",
      textAlign: "left"
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
              <Title order={2} ta="center">Overall(to be changed)</Title>
              <Table.ScrollContainer minWidth={500}>
                  <Table stickyHeader stickyHeaderOffset={60} style={{ borderCollapse: "collapse", width: "100%" }}>
                      <thead>
                        <tr>
                            <th style={thStyle}>Rank</th>
                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!topMembers ? (
                            <Loader />
                        ) : (
                            topMembers.map((member, index) => (
                                 <tr key={index}>
                                    <td style={tdStyle}>{index + 1}</td>
                                    <td style={tdStyle}>{member.img}{member.name}</td>
                                    <td style={tdStyle}>{member.score}</td>
                                 </tr>
                            ))
                        )}
                      </tbody>
                  </Table>
              </Table.ScrollContainer>
            </Tabs.Panel>
            <Tabs.Panel value="commenters">
              <Title order={2} ta="center">Commenters</Title>
              <Table style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead>
                    <tr>
                        <th style={thStyle}>Rank</th>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!topMembers ? (
                        <Loader />
                    ) : (
                        topMembers.map((member, index) => (
                             <tr key={index}>
                                <td style={tdStyle}>{index + 1}</td>
                                <td style={tdStyle}>{member.name}</td>
                                <td style={tdStyle}>{member.score}</td>
                             </tr>
                        ))
                    )}
                  </tbody>
              </Table>
            </Tabs.Panel>
            <Tabs.Panel value="pr code">
              <Title order={2} ta="center">PR Code</Title>
              <Table style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead>
                    <tr>
                        <th style={thStyle}>Rank</th>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!topMembers ? (
                        <Loader />
                    ) : (
                        topMembers.map((member, index) => (
                             <tr key={index}>
                                <td style={tdStyle}>{index + 1}</td>
                                <td style={tdStyle}>{member.name}</td>
                                <td style={tdStyle}>{member.score}</td>
                             </tr>
                        ))
                    )}
                  </tbody>
              </Table>
            </Tabs.Panel>

      </Tabs>
  </div>
  );
}


export default LeaderboardPage;
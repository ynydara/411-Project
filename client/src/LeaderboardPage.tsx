import "./App.css";
import React, { useEffect, useState } from "react";
import { Card, Title, Text, Loader, Container, List, Paper, Table } from "@mantine/core";
import {useAuth0} from "@auth0/auth0-react";

interface LeaderboardEntry {
  name: string;
  score: number;
}
    
      

function LeaderboardPage() {
  const [topMembers, setTopMembers] = useState<LeaderboardEntry[] | null>(null);
  const { user, isAuthenticated, isLoading } = useAuth0();


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
      <div className="page-container">
            <Paper shadow="lg" p="xl" radius="md" withBorder>
                <Title ta="center" mb="xl" size= {60}>
                    Leaderboard
                </Title>
                <Table
                    striped
                    highlightOnHover
                    withTableBorder
                    withColumnBorders
                    horizontalSpacing="md"
                    verticalSpacing="md"
                    maw={800}
                    mx="auto"
                    fz="md"
                >
                    <thead>
                        <tr>
                            <th style={{ textAlign: "center", fontSize: "30px" }}>Rank</th>
                            <th style={{ textAlign: "center", fontSize: "30px" }}>Name</th>
                            <th style={{ textAlign: "center", fontSize: "30px" }}>Score</th>
                        </tr>
                    </thead>
                    <tbody>
          {!topMembers ? (
            <Loader />
          ) : (
            <List spacing="sm" size="lg" type="ordered">
              {topMembers.map((member, index) => (
                <List.Item key={index}>
                  <Text>
                    {member.name} --- {member.score}
                  </Text>
                </List.Item>
              ))}
            </List>
          )}

        </tbody>
                </Table>
            </Paper>
      </div>
  );
}

export default LeaderboardPage;
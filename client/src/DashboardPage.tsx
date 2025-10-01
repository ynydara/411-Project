import "./App.css";
import React, { useEffect, useState } from "react";
import { Card, Title, Text, Loader, Container, List } from "@mantine/core";
import {useAuth0} from "@auth0/auth0-react";

interface LeaderboardEntry {
  name: string;
  score: number;
}

function DashboardPage() {
  const [topMembers, setTopMembers] = useState<LeaderboardEntry[] | null>(null);
  const { user, isAuthenticated, isLoading } = useAuth0();

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

  return isAuthenticated && user ? (
      <div className="page-container">
        <div className="welcome-box">
          <Title order={1}>Welcome back, {user.name}!</Title>
          <Title order={2}>Here's how your code reviews are looking this week</Title>
        </div>

        <Card key={1} shadow="sm" p="lg" mb="sm" radius="md" className="card-item"> 
          <Title order={3} mb="sm">Leaderboard</Title>
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
        </Card>

        <Card key={2} shadow="sm" p="lg" mb="sm" radius="md" className="card-item">
          <Title order={3} mb="sm">Accomplishments</Title>
        </Card>
        <Card key={3} shadow="sm" p="lg" mb="sm" radius="md" className="card-item">
          <Title order={3} mb="sm">Streak Tracker</Title>
        </Card>
      </div>
  ) : null;
}

export default DashboardPage;
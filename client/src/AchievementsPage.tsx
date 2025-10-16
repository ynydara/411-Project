import "./App.css";
import React, { useEffect, useState } from "react";
import {
  Title,
  Grid,
  Card,
  Text,
  Group,
  Badge,
  Loader,
  Center,
  Avatar,
} from "@mantine/core";
import { useAuth0 } from "@auth0/auth0-react";

interface Award {
  awardname: string;
  description: string;
  icon?: string;
}

function AchievementsPage() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [awards, setAwards] = useState<Award[] | null>(null);

  useEffect(() => {
    fetch("/awards")
      .then((res) => res.json())
      .then((res) => {
        setAwards(res.awards);
      })
      .catch((err) => {
        console.error("Failed to load awards:", err);
        setAwards([]);
      });
  }, []);

  if (!isAuthenticated || !user) return null;

  return (
    <div style={{ padding: "2rem" }}>
      <Title order={1} ta="center" mb="xl">
        Achievements
      </Title>

      {!awards ? (
        <Center>
          <Loader size="lg" />
        </Center>
      ) : awards.length === 0 ? (
        <Center>
          <Text c="dimmed">You have no achievements yet.</Text>
        </Center>
      ) : (
        <Grid>
          {awards.map((award, index) => (
            <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.03)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <Group justify="space-between" mb="sm">
                  <Group>
                    <Avatar
                      src={
                        award.icon ||
                        `https://api.dicebear.com/8.x/identicon/svg?seed=${award.awardname}`
                      }
                      radius="xl"
                    />
                    <Text fw={600}>{award.awardname}</Text>
                  </Group>
                  <Badge color="teal" variant="light">
                    Have you earned this award yet?
                  </Badge>
                </Group>
                <Text size="sm" c="dimmed">
                  {award.description}
                </Text>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}
    </div>
  );
}

export default AchievementsPage;

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

import { Octokit } from "octokit";


async function getPRsInvolved(username: string, token: string) {
  const octokit = new Octokit({ auth: token });

  const result = await octokit.request("GET /search/issues", {
    q: `involves:${username} is:pr`,
  });

  return result.data.items;
}

function Githubint() {
  const { user, isAuthenticated } = useAuth0();
  const [prs, setPrs] = useState<any[] | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

 const token = process.env.REACT_APP_GITHUB_TOKEN;
  if (!token) {
  console.error("Missing REACT_APP_GITHUB_TOKEN");
  return;
}

    getPRsInvolved(user.nickname!, token)
      .then((prList) => setPrs(prList))
      .catch((err) => {
        console.error("Failed to load PRs:", err);
        setPrs([]);
      });
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user) return null;

  return (
    <div style={{ padding: "2rem" }}>
      <Title order={1} ta="center" mb="xl">
        Pull Requests You Are Involved In
      </Title>

      {prs === null ? (
        <Center>
          <Loader size="lg" />
        </Center>
      ) : prs.length === 0 ? (
        <Center>
          <Text c="dimmed">No PRs found.</Text>
        </Center>
      ) : (
        <Grid>
          {prs.map((pr) => (
            <Grid.Col key={pr.id} span={{ base: 12, sm: 6, md: 4 }}>
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{ transition: "transform 0.2s ease" }}
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
                      src={pr.user?.avatar_url}
                      radius="xl"
                    />
                    <Text fw={600}>{pr.title}</Text>
                  </Group>

                  <Badge color="blue" variant="light">
                    #{pr.number}
                  </Badge>
                </Group>

                <Text size="sm" c="dimmed" mb="xs">
                  {pr.repository_url.replace("https://api.github.com/repos/", "")}
                </Text>

                <Text size="sm">
                  <a href={pr.html_url} target="_blank" rel="noopener noreferrer">
                    View Pull Request →
                  </a>
                </Text>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}
    </div>
  );
}

export default Githubint;

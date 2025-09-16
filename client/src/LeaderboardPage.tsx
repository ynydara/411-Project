import "./App.css";
import React, { useEffect, useState } from "react";
import { Table, Loader, Container, Title, Paper } from "@mantine/core";

interface LeaderboardEntry {
  name: string;
  score: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
}

function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    fetch("/leaderboard")
      .then((res) => res.json())
      .then((res: LeaderboardData) => {
        const sorted = [...res.leaderboard].sort((a, b) => b.score - a.score);
        setData(sorted);
      });
  }, []);

  if (!data) return <Loader />;

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
                        {data.map((entry, index) => {
                            let style = {};
                            if (index === 0) style = { backgroundColor: "#ffd700", textAlign: "center", fontSize: "25px" }; 
                            if (index === 1) style = { backgroundColor: "#c0c0c0", textAlign: "center", fontSize: "25px"}; 
                            if (index === 2) style = { backgroundColor: "#cd7f32", textAlign: "center", fontSize: "25px"}; 
                            if (index > 2) style = { textAlign: "center", fontSize: "25px"}; 

                            return (
                            <tr key={index} style={style}>
                                <td>{index + 1}</td>
                                <td>{entry.name}</td>
                                <td>{entry.score}</td>
                            </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Paper>
    </div>
  );
}

export default LeaderboardPage;

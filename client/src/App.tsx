import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Card, Text, Loader, Container, Title, Button, Center, Grid, Avatar, Group } from "@mantine/core";



interface DashboardData {
  dashboard: string[];
}

interface LeaderboardData {
  leaderboard: string[];
}

interface InsightsData {
  insights: string[];
}

interface ProfileData {
  profile: string[];
}

interface SettingsData {
  settings: string[];
}



function DashboardPage() {
  const [dashData, setDashData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/")
      .then(res =>res.json())
      .then((data: DashboardData) => {
        setDashData(data);
        console.log(data);  });
  }, []);

  return (
    <div className="page-container">
      <div className="App">
        <h1>Welcome back!</h1>
      </div>
      <Card key={1} shadow="sm" p="lg" mb="sm" radius="md" className="card-item">
        <Text>Leaderboard</Text>
      </Card>
      <Card key={2} shadow="sm" p="lg" mb="sm" radius="md" className="card-item">
        <Text>Accomplishments</Text>
      </Card>
      <Card key={3} shadow="sm" p="lg" mb="sm" radius="md" className="card-item">
        <Text>Streak Tracker</Text>
      </Card>
      <Card key={4} shadow="sm" p="lg" mb="sm" radius="md" className="card-item">
        <Text>Review Quality Scorecard</Text>
      </Card>
      {dashData === null ? (
        <p> Dashboard Loading...</p>
      ) : (
        dashData.dashboard.map((dash, i) =>  <p key={i}>{dash}</p>)
      )}
    </div>
  );
}

function LeaderboardPage() {
  const [leadData, setLeadData] = useState<LeaderboardData | null>(null);

  useEffect(() => {
    fetch("/leaderboard")
      .then(res =>res.json())
      .then((data: LeaderboardData) => {
        setLeadData(data);
        console.log(data);  
      });
  }, []);

  return (
    <div>
      {leadData === null ? (
        <p> Leaderboard Loading...</p>
      ) : (
        leadData.leaderboard.map((lb, i) => <p key={i}>{lb}</p>)
      )}
    </div>
  );
}

function InsightsPage() {
  const [inData, setInData] = useState<InsightsData | null>(null);

  useEffect(() => {
    fetch("/insights")
      .then(res =>res.json())
      .then((data: InsightsData) => {
        setInData(data);
        console.log(data);  
      });
  }, []);

  return (
    <div>
      {inData === null ? (
        <p> Insights Loading...</p>
      ) : (
        inData.insights.map((insights, i) => <p key={i}>{insights}</p>)
      )}
    </div>
  );
}

function ProfilePage() {
  const [proData, setProData] = useState<ProfileData | null>(null);

  useEffect(() => {
    fetch("/profile")
      .then(res =>res.json())
      .then((data: ProfileData) => {
        setProData(data);
        console.log(data);  
      });
  }, []);

  return (
    <div>
      {proData === null ? (
        <p> Profile Loading...</p>
      ) : (
        proData.profile.map((profile, i) => <p key={i}>{profile}</p>)
      )}
    </div>
  );
}

function SettingsPage() {
  const [sgsData, setSgsData] = useState<SettingsData | null>(null);

  useEffect(() => {
    fetch("/settings")
      .then(res =>res.json())
      .then((data: SettingsData) => {
        setSgsData(data);
        console.log(data);  
      });
  }, []);

  return (
    <div>
      {sgsData === null ? (
        <p> Settings Loading...</p>
      ) : (
        sgsData.settings.map((settings, i) => <p key={i}>{settings}</p>)
      )}
    </div>
  );
}

function App() {
  return (
     <Router>
      <div className="App">
        <nav>
          <Link to="/">Dashboard</Link> | <Link to="/leaderboard">Leaderboard</Link> | <Link to="/insights">Insights</Link> | <Link to="/profile">My Profile</Link> | <Link to="/settings">Settings</Link>
        </nav>
      </div>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
     </Router>
  );
}

export default App;
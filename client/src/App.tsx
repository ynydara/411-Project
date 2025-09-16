import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Card, Text, Table, Image, Flex, AspectRatio } from "@mantine/core";

import LeaderboardPage from "./LeaderboardPage";
import DashboardPage from "./DashboardPage";
import SettingsPage from "./SettingsPage";
import ProfilePage from "./ProfilePage";


function App() {
  return (
     <Router>
      <div>
        <div className="nav-bar">
          <nav>
            <Link to="/">Dashboard</Link> | <Link to="/leaderboard">Leaderboard</Link> | <Link to="/profile">My Profile</Link> | <Link to="/settings">Settings</Link>
          </nav>
        </div>
      </div>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
     </Router>
  );
}

export default App;
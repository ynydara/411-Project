import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, Text, Table, Image, Flex, AspectRatio, Button } from "@mantine/core";

import LeaderboardPage from "./LeaderboardPage";
import DashboardPage from "./DashboardPage";
import SettingsPage from "./SettingsPage";
import ProfilePage from "./ProfilePage";
import AuthLogin from "./authLogin";
import AuthProfile from "./authProfile";
import AuthLogout from "./authLogout";


function App() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

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
         <AuthLogin></AuthLogin>
         <AuthLogout></AuthLogout>
         <AuthProfile></AuthProfile>
     </Router>
  );
}

export default App;
import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {Loader, Center, Avatar, Flex, Button} from "@mantine/core";

import LeaderboardPage from "./LeaderboardPage";
import DashboardPage from "./DashboardPage";
import SettingsPage from "./SettingsPage";
import AchievementsPage from "./AchievementsPage";
import LoginPage from "./LoginPage";
import AuthLogin from "./authLogin";
import AuthProfile from "./authProfile";
import AuthLogout from "./authLogout";


function App() {
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading} = useAuth0();

  if (isLoading) {
    return <Center>
            <Loader color="indigo" size="xl" />
        </Center>;
  }

      return !isAuthenticated ? (
          <Router>
              <Routes>
                  <Route path="/" element={<LoginPage/>}/>
              </Routes>
          </Router>


      ) : user ? (
          <Router>
              <Flex
                  mih={50}
                  bg="rgba(0, 0, 0, 0)"
                  gap="sm"
                  justify="flex-end"
                  align="center"
                  direction="row"
                  wrap="wrap"
                >
                  <Link to="/">Dashboard</Link>
                  <Link to="/leaderboard">Leaderboard</Link>
                  <Link to="/achievements">Achievements</Link>
                  <AuthLogout></AuthLogout>
                  <Avatar src={user.picture} />
              </Flex>

              <Routes>
                  <Route path="/" element={<DashboardPage/>}/>
                  <Route path="/leaderboard" element={<LeaderboardPage/>}/>
                  <Route path="/achievements" element={<AchievementsPage/>}/>
                  <Route path="/settings" element={<SettingsPage/>}/>
              </Routes>
          </Router>
      ) : null;
}

export default App;
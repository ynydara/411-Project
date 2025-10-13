import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, Text, Table, Image, Flex, AspectRatio, Button, Loader, Center, Avatar } from "@mantine/core";

import LeaderboardPage from "./LeaderboardPage";
import DashboardPage from "./DashboardPage";
import SettingsPage from "./SettingsPage";
import AchievementsPage from "./AchievementsPage";
import LoginPage from "./LoginPage";
import AuthLogin from "./authLogin";
import AuthProfile from "./authProfile";
import AuthLogout from "./authLogout";
import PrInputPage from "./PullRequest";

import { Burger, Container, Group, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import classes from './HeaderSimple.module.css';

const links = [
  { link: '/dashboard', label: 'Dashboard' },
  { link: '/leaderboard', label: 'Leaderboard' },
  { link: '/profile', label: 'My Profile' },
  { link: '/settings', label: 'Settings' },
];

export function HeaderSimple() {
    const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState(links[0].link);

  const items = links.map((link) => (
  <Link
    key={link.label}
    to={link.link}  
    className={classes.link}
    data-active={active === link.link || undefined}
    onClick={() => setActive(link.link)}
  >
    {link.label}
  </Link>
));

  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>

        <Group gap={5} visibleFrom="xs" ml="auto">
          {items}
          <Button
              component={Link}
              to="/input"
              variant="filled"
              color="blue"
              ml="md"
          >
              + New PR
          </Button>
        </Group>


        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
      </Container>
    </header>
  );
}




function App() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  if (isLoading) {
    return <Center>
            <Loader color="indigo" size="xl" />
        </Center>;
  }
  return !isAuthenticated ? (
     <Router>
      <div>
        <div className="nav-bar">
          <nav>
            <Link to="/dashboard">Dashboard</Link> | <Link to="/leaderboard">Leaderboard</Link> | <Link to="/profile">My Profile</Link> | <Link to="/settings">Settings</Link>
          </nav>
        </div>
      </div>
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
        <Route path="/" element={<LoginPage />}/>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
     </Router>
  ) : null;
}

export default App;

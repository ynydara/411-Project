import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, Text, Table, Image, Flex, AspectRatio, Loader, Center, Avatar } from "@mantine/core";
import '@mantine/core/styles.css';
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
  { link: '/achievements', label: 'Acheivements' },
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
      <Container size="sm" className={classes.inner}>

        <Group gap={4} visibleFrom="xs" ml="auto">
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
const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0();

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
      <div>
        <div className="nav-bar">
          <nav>
            <Link to="/dashboard">Dashboard</Link> | <Link to="/leaderboard">Leaderboard</Link> | <Link to="/Acheivements">Acheivements</Link> | <Link to="/settings">Settings</Link> |  <AuthLogout></AuthLogout>
                  | <Avatar src={user.picture} />
          </nav>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<LoginPage />}/>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/input" element={<PrInputPage />} />

      </Routes>
     </Router>
  ) : null;
}

export default App;

import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, Text, Table, Image, Flex, AspectRatio,Loader, Center, Avatar, Burger, Container, Group, Button } from "@mantine/core";

import LeaderboardPage from "./LeaderboardPage";
import DashboardPage from "./DashboardPage";
import AchievementsPage from "./AchievementsPage";
import AuthLogout from "./authLogout";
import PrInputPage from "./PullRequest";
import { useDisclosure } from '@mantine/hooks';

import classes from './HeaderSimple.module.css';
import LoginPage from "./LoginPage";

const links = [
  { link: '/', label: 'Dashboard' },
  { link: '/leaderboard', label: 'Leaderboard' },
    { link: '/achievements', label: 'Achievements'},

];

export function HeaderSimple() {
    const {loginWithRedirect, logout, isAuthenticated, user} = useAuth0();
    const [opened, {toggle}] = useDisclosure(false);
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
                            {/*<Avatar src={user.picture}/>*/}
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
                            {/*<Button*/}
                            {/*    component={Link}*/}
                            {/*    to="./authLogout"*/}
                            {/*    variant="filled"*/}
                            {/*    color="blue"*/}
                            {/*    ml="md"*/}
                            {/*>*/}
                            {/*    <AuthLogout*/}


                            {/*</Button>*/}
                            <AuthLogout></AuthLogout>

                        </Group>


                        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm"/>
                    </Container>
                </header>
            );
        }


function App() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  // if (isLoading) {
  //   return <Center>
  //           <Loader color="indigo" size="xl" />
  //       </Center>;
  // }
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
                  {/*<Link to="/">Dashboard</Link>*/}
                  {/*<Link to="/leaderboard">Leaderboard</Link>*/}
                  {/*<Link to="/achievements">Achievements</Link>*/}
                  <HeaderSimple></HeaderSimple>
                  {/*<Avatar src={user.picture} />*/}

              </Flex>

      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/achievements" element={<AchievementsPage/>}/>
         <Route path="/input" element={<PrInputPage />} />
      </Routes>
     </Router>

  ) : null;
}

export default App;

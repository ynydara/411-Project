import { LuCodeXml, LuTrophy, LuChartColumn, LuPanelsTopLeft } from "react-icons/lu";
import { Button, Group, Text, Box, ThemeIcon, Container, Menu } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import {useAuth0} from "@auth0/auth0-react";


export function Navbar() {
  const IconWrapper = ({ icon: Icon, size = 24 }: { icon: any; size?: number }) => <Icon size={size} />;
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated } = useAuth0();

  const navItems = [
    { link: "/dashboard", label: "Dashboard", icon: LuCodeXml },
    { link: "/achievements", label: "Achievements", icon: LuTrophy },
    { link: "/leaderboard", label: "Leaderboard", icon: LuChartColumn },
    { link: "/", label: "Home", icon: LuPanelsTopLeft, isMenu: true },
  ];

  return (
    <Box
      component="nav"
      style={{
        borderBottom: "1px solid #30363d",
        backgroundColor: "#0d1117",
        height: 64,
      }}
    >
      <Container
        size="xl"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        {/* Logo */}
        <Group gap="xs">
          <ThemeIcon size={36} variant="transparent" radius="xl" color="green">
            <IconWrapper icon={LuCodeXml} size={20} />
          </ThemeIcon>
          <Text color="white" fw={700}>
            CodeReview AI
          </Text>
        </Group>

        {/* Navigation buttons */}
        <Group gap="sm">
          {navItems.map((item) => {
            const isActive = location.pathname === item.link;

            //Menu home button with logout
            if (item.isMenu) {
                return (
                  <Menu key={item.link} shadow="md" position="bottom-end">
                    <Menu.Target>
                    <Button
                        key={item.link}
                        variant={isActive ? "filled" : "subtle"}
                        color={isActive ? "green" : "gray"}
                        styles={{
                            root: {
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                fontWeight: 500,
                                "&:hover": {
                                    backgroundColor: isActive ? "#16a34a" : "#21262d", // keep hover color static if needed
                                    color: "#fff",
                                },
                            },
                        }}
                    >
                        <IconWrapper icon={item.icon} size={16}/>
                        {item.label}
                    </Button>
                    </Menu.Target>

                    <Menu.Dropdown >
                        <Menu.Item onClick={() => navigate("/")}>Home</Menu.Item>
                        <Menu.Item fw={200} color="red" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                            Log Out
                        </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                );
              }

            // Non menu buttons
                return (
                  <Button
                    key={item.link}
                    variant={isActive ? "filled" : "subtle"}
                    color={isActive ? "green" : "gray"}
                    onClick={() => navigate(item.link)}
                    styles={{
                      root: {
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontWeight: 500,
                        "&:hover": {
                          backgroundColor: isActive ? "#16a34a" : "#21262d",
                          color: "#fff",
                        },
                      },
                    }}
                  >
                    <IconWrapper icon={item.icon} size={16} />
                    {item.label}
                  </Button>
                );
          })}
        </Group>
      </Container>
    </Box>
  );
}

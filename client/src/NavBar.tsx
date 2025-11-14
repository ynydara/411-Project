import { LuCodeXml, LuTrophy, LuChartColumn, LuPanelsTopLeft } from "react-icons/lu";
import { Button, Group, Text, Box, ThemeIcon, Container } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";


export function Navbar() {
  const IconWrapper = ({ icon: Icon, size = 24 }: { icon: any; size?: number }) => <Icon size={size} />;
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { link: "/", label: "Home", icon: LuPanelsTopLeft },
    { link: "/dashboard", label: "Dashboard", icon: LuCodeXml },
    { link: "/achievements", label: "Achievements", icon: LuTrophy },
    { link: "/leaderboard", label: "Leaderboard", icon: LuChartColumn },
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
                      backgroundColor: isActive ? "#16a34a" : "#21262d", // keep hover color static if needed
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

import "./App.css";
import React, { useEffect, useState } from "react";
import { Container, Title, Tabs, TextInput, PasswordInput, Switch, Button, Card, Group, Stack, Flex } from "@mantine/core";

import AuthLogout from "./authLogout";
import AuthProfile from "./authProfile";
import {useAuth0} from "@auth0/auth0-react";

function SettingsPage() {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [emailNotifications, setEmailNotifications] = useState(true);

  return  (
    <Container size="md" py="xl">
      <Title order={2} mb="lg">
        Settings
      </Title>

      <Tabs
        orientation="vertical"
        defaultValue="profile"
        variant="outline"
        radius="md"
        style={{ display: "flex" }}
      >
        <Flex gap="lg" align="flex-start">
          {/* Tabs navigation */}
          <Tabs.List style={{ minWidth: 200 }}>
              <div>
            <Tabs.Tab value="profile">Profile</Tabs.Tab>
              </div>
              <div>
            <Tabs.Tab value="security">Security</Tabs.Tab>
              </div>

              <div>
            <Tabs.Tab value="logout">Log Out</Tabs.Tab>
              </div>
          </Tabs.List>

          {/* Tabs content */}
          <div style={{ flex: 1, marginLeft: "1rem" }}>
            {/* Profile Settings */}
            <Tabs.Panel value="profile">
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack>
                  <Title order={4}>Profile Information</Title>
                  <TextInput label="Full Name" placeholder="Your name" />
                  <TextInput label="Email Address" placeholder="your@email.com" />
                  <TextInput label="Username" placeholder="username" />
                  <Button variant="filled">Save Changes</Button>
                </Stack>
              </Card>
            </Tabs.Panel>

            {/* Security Settings */}
            <Tabs.Panel value="security">
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack>
                  <Title order={4}>Account Security</Title>
                  <PasswordInput label="Current Password" placeholder="••••••••" />
                  <PasswordInput label="New Password" placeholder="••••••••" />
                  <PasswordInput
                    label="Confirm New Password"
                    placeholder="••••••••"
                  />
                  <Button variant="filled">Update Password</Button>
                </Stack>
              </Card>
            </Tabs.Panel>

            {/* Logout Settings */}
            <Tabs.Panel value="logout">
              <AuthLogout></AuthLogout>
            </Tabs.Panel>
          </div>
        </Flex>
      </Tabs>
    </Container>
  );
}

export default SettingsPage;
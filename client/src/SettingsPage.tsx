import "./App.css";
import React, { useEffect, useState } from "react";
import { Tabs, TextInput } from '@mantine/core';

import AuthLogout from "./authLogout";
import AuthProfile from "./authProfile";
import {useAuth0} from "@auth0/auth0-react";

function SettingsPage() {
    const { user, isAuthenticated, isLoading } = useAuth0();

  return  (
    <div className="settings-page">
    <Tabs color="gray" variant="outline" defaultValue="gallery" orientation="vertical" >
      <Tabs.List grow>
        <Tabs.Tab value="profile">
          Profile
        </Tabs.Tab>
        <Tabs.Tab value="password">
            Password
        </Tabs.Tab>
        <Tabs.Tab value="github">
            Github
        </Tabs.Tab>
        <Tabs.Tab value="logout">
          Logout
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="profile">
        profile stuff, username/edit, email/edit
          <AuthProfile></AuthProfile>
      </Tabs.Panel>

      <Tabs.Panel value="password">
        change/new password
      </Tabs.Panel>

      <Tabs.Panel value="github">
        connect to github
      </Tabs.Panel>

      <Tabs.Panel value="logout">
        <AuthLogout></AuthLogout>
      </Tabs.Panel>
    </Tabs>
    </div>
  );
}

export default SettingsPage;
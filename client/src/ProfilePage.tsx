import "./App.css";
import React, { useEffect, useState } from "react";
import { Title, Space, Avatar} from "@mantine/core";
import {useAuth0} from "@auth0/auth0-react";

function ProfilePage() {
    const { user, isAuthenticated, isLoading } = useAuth0();

    return isAuthenticated && user ? (
        <div className="profile-page">
            <Title order={1} ta="center">{user.name}'s Profile</Title>
            <Space h="md" />
             <Avatar src={user.picture} alt={user.name} />
        </div>
    ) : null;

}


export default ProfilePage;

import "./App.css";
import React, { useEffect, useState } from "react";
import { Title, Space, Image, Center, Avatar } from "@mantine/core";
import {useAuth0} from "@auth0/auth0-react";

function AchievementsPage() {
    const { user, isAuthenticated, isLoading } = useAuth0();

    return user ? (
        <div className="profile-page">
            <div>
            <Title order={1} ta="center">Achievements</Title>
            </div>
        </div>
    ) : null;

}


export default AchievementsPage;

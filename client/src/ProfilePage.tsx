import "./App.css";
import React, { useEffect, useState } from "react";
import { Title, Space, Image, Center} from "@mantine/core";
import {useAuth0} from "@auth0/auth0-react";

function ProfilePage() {
    const { user, isAuthenticated, isLoading } = useAuth0();

    return user ? (
        <div className="profile-page">
            <div className="rounded">
             <Image src={user.picture} width={150} height={150} ta="center" border-radius="50px"/>
            </div>
            <div>
            <Title order={1} ta="center">{user.name}'s Profile</Title>
            </div>
            <div>
            <Title order={2} ta="left">Achievements</Title>
            </div>
        </div>
    ) : null;

}


export default ProfilePage;

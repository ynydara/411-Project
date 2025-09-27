import "./App.css";
import React, { useEffect, useState } from "react";
import { Title } from "@mantine/core";

function ProfilePage() {
    return(
        <div className="profile-page">
            <Title order={1} ta="center">My Profile</Title>
        </div>
    );

}


export default ProfilePage;

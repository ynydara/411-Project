import "./App.css";
import React, { useEffect, useState } from "react";
import AuthLogin from "./authLogin";
import {useAuth0} from "@auth0/auth0-react";
import { Title } from "@mantine/core";


function LoginPage() {
    const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

    return(
        <div>
            <Title order={1}>Please log in</Title>
            <Title order={2}></Title>
            <AuthLogin></AuthLogin>
        </div>
    );

}

export default LoginPage;
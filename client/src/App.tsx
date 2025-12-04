import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import AuthLogout from "./authLogout";
import { useDisclosure } from '@mantine/hooks';

import {LandingPage} from "./LandingPage";
import {Navbar} from "./NavBar"
import {Dashboard} from "./Dashboard";
import {Achievements} from "./Achievements";
import {Leaderboard} from "./Leaderboard";


export default function App() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  return (
     <Router>
         <Navbar></Navbar>
         <Routes>
           <Route path="/" element={<LandingPage onGetStarted={function(): void {
                  throw new Error("Function not implemented.");
              } }/>}/>
             <Route path="/dashboard" element={<Dashboard />}/>
             <Route path="/achievements" element={<Achievements />}/>
             <Route path="/leaderboard" element={<Leaderboard />}/>
         </Routes>
      </Router>
  );
}

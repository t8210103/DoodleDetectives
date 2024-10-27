import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles.css'
import Main from './pages/Main.js';
import GameLobby from './pages/GameLobby.js';
import GamePage from './pages/GamePage.js';
import NoPage from './pages/NoPage.js';
import { WebSocketProvider } from './components/WebSocketContext.js';
import ProtectedRoutes from './utils/ProtectedRoutes.js';

// AWS Amplify with Cognito
import awsExports from './aws-exports';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';  // Optional: for default styles

Amplify.configure(awsExports);

// Initialize token object
let auth = { token: false };

export default function App() {
  return (
    <>
      <Authenticator
        // Specify sign-up attributes, must agree with aws configuration
        signUpAttributes={['email']}
        formFields={{
          signUp: {
            username: {
              label: "Username",
              placeholder: "Enter your username",
              isRequired: true,
            },
            password: {
              label: "Password",
              placeholder: "Enter your password",
              isRequired: true,
            },
            email: {
              label: "Email",
              placeholder: "Enter your email",
              isRequired: true,
            }
          }
        }}
      >
        {({ signOut, user }) => {
          // Update token when user is authenticated
          if (user) {
            auth.token = true;
          }

          return (
            <WebSocketProvider>
              <BrowserRouter>
                <Routes>
                  <Route index element={<Main signOut={signOut} user={user} />} />
                  <Route element={<ProtectedRoutes auth={auth} />}>
                    <Route path="/GameLobby" element={<GameLobby signOut={signOut} user={user} />} />
                    <Route path="/GamePage" element={<GamePage signOut={signOut} user={user} />} />
                  </Route>
                  <Route path="*" element={<NoPage />} />
                </Routes>
              </BrowserRouter>
            </WebSocketProvider>
          );
        }}
      </Authenticator>
    </>
  );
}

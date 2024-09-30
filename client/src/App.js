import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import '@aws-amplify/ui-react/styles.css'; // Optional: for default styles
Amplify.configure(awsExports);

export default function App() {
  return (
    <>
      <Authenticator
        signUpAttributes={['email']}  // Specify sign-up attributes
        formFields={{
          signUp: {
            username: {
              label: "Username",
              placeholder: "Enter your username",
              isRequired: true,   // Correct attribute for Amplify form fields
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
        <WebSocketProvider>
          <BrowserRouter>
            <Routes>
              <Route index element={<Main />} />
              {/*<Route path="/Main" element={<Main />} />*/}
              <Route element={<ProtectedRoutes />}>
                <Route path="/GameLobby" element={<GameLobby />} />
              </Route>
              <Route path="/GamePage" element={<GamePage />} />
              <Route path="*" element={<NoPage />} />
            </Routes>
          </BrowserRouter>
        </WebSocketProvider>
      </Authenticator>
    </>
  );
}

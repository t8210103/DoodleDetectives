import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from './pages/Main.js';
import GameLobby from './pages/GameLobby.js';
import GamePage from './pages/GamePage.js';
import NoPage from './pages/NoPage.js';
import { WebSocketProvider } from './components/WebSocketContext.js';

// App.js is for defining the routes - all the different pages
export default function App(){
    return (
      <>
        <WebSocketProvider>
          <BrowserRouter>
            <Routes>
                <Route index element = {<Main />} />  {/*this is the default page (no path)*/}
                <Route path="/GameLobby" element = {<GameLobby />} />
                <Route path="/GamePage/" element = {<GamePage />} />
                <Route path="*" element = {<NoPage />} />
            </Routes>
          </BrowserRouter>
        </WebSocketProvider>
      </>
    )
}
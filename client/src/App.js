import React from 'react'; // Import React
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Import routing components
import Main from './pages/Main.js'; // Import the Main component
import { WebSocketProvider } from './components/WebSocketContext.js';

// App.js is for defining the routes - all the different pages
export default function App(){
    return (
      <>
        <WebSocketProvider>
          <BrowserRouter>
            <Routes>
                <Route index element = {<Main />} />  {/*this is the default page (no path)*/}
                {/*<Route path="/GameLobby/" element = {<GameLobby />} />
                <Route path="/GamePage/" element = {<GamePage />} />
                <Route path="*" element = {<NoPage />} />*/}
            </Routes>
          </BrowserRouter>
        </WebSocketProvider>
      </>
    )
}
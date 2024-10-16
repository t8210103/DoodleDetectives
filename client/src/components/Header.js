// Header.js
import React from 'react';
import '../styles.css';  // Ensure you are importing your styles

const Header = ({ signOut }) => {
  return (
    <header className="header">
      <h1 className="title">Doodle Detectives</h1>
      <button onClick={signOut} className="sign-out-button">Sign Out</button>
    </header>
  );
};

export default Header;

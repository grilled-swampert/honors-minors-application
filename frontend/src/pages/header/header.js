import React from 'react';
import { Link } from 'react-router-dom';
import './header.css';
import kjscelogo from '../photos-logos/KJSCE-logo.png';

const Header = () => {
  return (
    <header>
      <div className="navbar">
        <Link to="/">
          <img className="somaiya-logo-main" src={kjscelogo} alt="Somaiya Logo" />
        </Link>
        <button className="logoutBtn">
          LOGOUT    
        </button>
      </div>
    </header>
  );
}

export default Header;

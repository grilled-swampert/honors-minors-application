import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import './header.css';
import kjscelogo from '../photos-logos/KJSCE-logo.png';

const Header = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  return (
    <header>
      <div className="navbar">
        <Link to="/">
          <img className="somaiya-logo-main" src={kjscelogo} alt="Somaiya Logo" />
        </Link>
        <button className="logoutBtn" onClick={handleLogout}>
          LOGOUT    
        </button>
      </div>
    </header>
  );
}

export default Header;

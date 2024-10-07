import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import kjscelogo from "../photos-logos/KJSCE-logo.png";
import './header.css'

const Header = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="kjsce-header">
      <div className="kjsce-header__navbar">
        <Link to="/" className="kjsce-header__logo-link">
          <img
            className="kjsce-header__logo"
            src={kjscelogo}
            alt="KJSCE Logo"
          />
        </Link>
        <button className="kjsce-header__logout-btn" onClick={handleLogout}>
          LOGOUT
        </button>
      </div>
    </header>
  );
};

export default Header;

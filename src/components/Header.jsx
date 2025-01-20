import React from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";
import logo from "../assets/sun_logo.png";

const Header = () => {
  return (
    <header className="header">
      <nav className="nav">
        {/* Logo Placeholder */}

        <div className="logo">
          <img
            src={logo}
            alt="the image of the sun as a logo"
            style={{ height: 50, width: 50 }}
          />
          Enjoy English
        </div>
        <ul className="nav-links">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-link">
              About
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/modules" className="nav-link">
              Modules
            </Link>
          </li>
        </ul>

        {/* Log in and Sign up */}
        <div className="auth-actions">
          <Link to="/login" className="login-link">
            Log in
          </Link>
          <Link to="/signup" className="signup-button">
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;

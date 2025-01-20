import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

const footerList = [
  { id: 1, name: "Home", path: "/" },
  { id: 2, name: "About", path: "/about" },
  { id: 3, name: "Modules", path: "/modules" },
];

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <ul className="footer-links">
          {footerList.map((item) => (
            <li key={item.id} className="footer-item">
              <Link to={item.path} className="footer-link">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        <p className="footer-text">
          &copy; 2024 Enjoy English. All rights reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;

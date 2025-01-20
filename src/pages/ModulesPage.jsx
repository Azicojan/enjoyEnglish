import React from "react";
import { Link } from "react-router-dom";
import "../styles/ModulesPage.css";

const ModulesPage = () => {
  const modules = [
    { id: 1, name: "Numbers and Counting", path: "/modules/1" },
    { id: 2, name: "Shapes", path: "/modules/2" },
    { id: 3, name: "Colors", path: "/modules/3" },
  ];

  return (
    <div className="modules-page">
      <h1 className="modules-title">Modules</h1>
      <ul className="modules-list">
        {modules.map((module) => (
          <li key={module.id} className="module-card">
            <Link to={module.path} className="module-link">
              {module.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ModulesPage;

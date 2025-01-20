import React from "react";
import { Link } from "react-router-dom";
import "../../styles/Module1.css";

const Module1 = () => {
  const lessons = [
    {
      id: 1,
      title: "Lesson 1. Counting from 1 to 10",
      path: "/modules/1/lessons/1",
    },
    {
      id: 2,
      title: "Lesson 2. Counting from 11 to 20",
      path: "/modules/1/lessons/2",
    },
  ];

  return (
    <div className="module1-page">
      <h2 className="module1-title">Numbers and Counting</h2>
      <ul className="lesson-list">
        {lessons.map((lesson) => (
          <li key={lesson.id} className="lesson-item">
            <Link to={lesson.path} className="lesson-link">
              {lesson.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Module1;

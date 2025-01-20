import React, { useEffect, useState } from "react";
import "../styles/About.css";

const About = () => {
  const [shapes, setShapes] = useState([]);

  useEffect(() => {
    const generateShapes = () => {
      const newShapes = [];
      const shapeCount = 30;
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight;

      while (newShapes.length < shapeCount) {
        const size = Math.random() * 150 + 100; //Size between 100px and 250px
        const top = Math.random() * (containerHeight - size);
        const left = Math.random() * (containerWidth - size);

        //Ensure no overlap
        const hasOverlap = newShapes.some(
          (shape) =>
            Math.abs(shape.top - top) < size &&
            Math.abs(shape.left - left) < size
        );

        if (!hasOverlap) {
          const type =
            Math.random() > 0.33
              ? Math.random() > 0.5
                ? "circle"
                : "rounded-square"
              : "triangle";

          newShapes.push({
            id: newShapes.length,
            type, // Random type
            top,
            left,
            size,
            rotate: Math.random() * 360, // Random rotation for fun
          });
        }
      }
      setShapes(newShapes);
    };

    generateShapes();
    window.addEventListener("resize", generateShapes);
    return () => window.removeEventListener("resize", generateShapes);
  }, []);

  return (
    <div className="about-container">
      <h2 className="about-title">
        Here will be some information about this app.
      </h2>
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className={shape.type}
          style={{
            width: shape.type === "triangle" ? 0 : `${shape.size}px`,
            height: shape.type === "triangle" ? 0 : `${shape.size}px`,
            borderLeft:
              shape.type === "triangle"
                ? `${shape.size / 2}px solid transparent`
                : "none",
            borderRight:
              shape.type === "triangle"
                ? `${shape.size / 2}px solid transparent`
                : "none",
            borderBottom:
              shape.type === "triangle"
                ? `${shape.size}px solid rgba(200, 200, 200, 0.2)`
                : "none",
            top: `${shape.top}px`,
            left: `${shape.left}px`,
            transform: `rotate(${shape.rotate}deg)`,
          }}
        ></div>
      ))}
    </div>
  );
};

export default About;

// components/Flashcard.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesome component
import { faVolumeUp } from "@fortawesome/free-solid-svg-icons"; // Import the volume-up icon
import "../styles/Flashcard.css";

const Flashcard = ({ front, back, flipped, setFlipped, audio }) => {
  const playAudio = () => {
    if (audio) {
      const audioInstance = new Audio(audio);
      audioInstance.play();
    }
  };

  return (
    <div
      className={`flashcard ${flipped ? "flipped" : ""}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="flashcard-content front">{front}</div>

      <div className="flashcard-content back">
        <FontAwesomeIcon
          icon={faVolumeUp}
          className="audio-icon"
          title="Play Audio"
          onClick={(e) => {
            e.stopPropagation(); // Prevent flipping when clicking the icon
            playAudio();
          }}
        />
        {back}
      </div>
    </div>
  );
};

export default Flashcard;

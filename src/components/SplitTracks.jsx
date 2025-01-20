import React from "react";
import { flashcards } from "../utils/flashcardsData";
import "../styles/SplitTracks.css";

const SplitTracks = () => {
  const playAudio = (track) => {
    const audio = new Audio(track);
    audio.play().catch((error) => {
      console.log("Audio playback failed:", error);
    });
  };

  return (
    <div className="split-tracks-container">
      <table className="split-tracks-table">
        <thead>
          <tr>
            <th>Sentence</th>
            <th>Translation (with Audio)</th>
          </tr>
        </thead>
        <tbody>
          {flashcards.map((item) => (
            <tr key={item.id}>
              <td className="front-cell">{item.front}</td>
              <td className="back-cell">
                {item.back.text}
                <span
                  className="listen-button"
                  role="button"
                  aria-label="Listen"
                  onClick={() => playAudio(item.back.audio)}
                >
                  🎧
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SplitTracks;

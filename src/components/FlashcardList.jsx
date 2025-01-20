// components/FlashcardList.jsx
import React, { useState } from "react";
import { flashcards } from "../utils/flashcardsData";
import Flashcard from "./Flashcard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesome component
import { faShuffle } from "@fortawesome/free-solid-svg-icons"; // Import the shuffle icon
import "../styles/Flashcard.css";

// Shuffle the flashcards
const shuffleCards = (cards) => {
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  return shuffled;
};

const FlashcardList = () => {
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current flashcard
  const [flipped, setFlipped] = useState(false); // Track the flipped state
  const [cards, setCards] = useState(shuffleCards(flashcards));

  // Function to reset the flip and navigate
  const navigateCard = (direction) => {
    if (flipped) {
      setFlipped(false); // Reset flip state first
      setTimeout(() => {
        updateIndex(direction); // Navigate after resetting flip
      }, 300); // Ensure sync with flip animation duration
    } else {
      updateIndex(direction); // Navigate immediately if not flipped
    }
  };

  // Update the index based on direction
  const updateIndex = (direction) => {
    if (direction === "forward") {
      setCurrentIndex((prevIndex) =>
        prevIndex < cards.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (direction === "backward") {
      setCurrentIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : prevIndex
      );
    }
  };

  // Shuffle Button Handler
  const handleShuffle = () => {
    const shuffledCards = shuffleCards(cards);
    setCards(shuffledCards);
    setCurrentIndex(0); // Reset to the first card in the shuffled set
    setFlipped(false); // Ensure the card in not flipped
  };

  return (
    <div className="flashcard-list">
      {/* Flashcard Content */}
      <h3>Flashcards</h3>
      <Flashcard
        front={cards[currentIndex].front}
        back={cards[currentIndex].back.text}
        flipped={flipped}
        setFlipped={setFlipped} // Pass the flip state and handler
        audio={cards[currentIndex].back.audio} // Pass the audio for the current card
      />

      {/* Navigation Controls */}
      <div className="flashcard-controls">
        <button
          onClick={() => navigateCard("backward")}
          className="flashcard-button"
          disabled={currentIndex === 0}
        >
          &#8592;
        </button>
        <span className="flashcard-status">
          {currentIndex + 1}/{cards.length}
        </span>
        <button
          onClick={() => navigateCard("forward")}
          className="flashcard-button"
          disabled={currentIndex === cards.length - 1}
        >
          &#8594;
        </button>
        <button
          className="shuffle-button"
          onClick={handleShuffle}
          title="Shuffle"
        >
          <FontAwesomeIcon icon={faShuffle} />
        </button>
      </div>
    </div>
  );
};

export default FlashcardList;

import React, { useState, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { dragAndDropSentences } from "../utils/numbersLessonData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesome component
import { faShuffle } from "@fortawesome/free-solid-svg-icons"; // Import the shuffle icon
import ConfettiExplosion from "react-confetti-explosion";
import "../styles/DragAndDrop.css";

const DragAndDrop = () => {
  // Prepare sentences, shuffle words, and set state
  const shuffleSentences = () => {
    return dragAndDropSentences.map((sentences) =>
      sentences.split(" ").sort(() => Math.random() - 0.5)
    );
  };

  const [sentences, setSentences] = useState(shuffleSentences());
  const [feedback, setFeedback] = useState(
    Array(dragAndDropSentences.length).fill(null)
  ); // Stores feedback for each sentence
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const successMessages = [
    "Great Job!",
    "Well done!",
    "Outstanding! Your hard work pays off.",
    "Excellent!",
    "Fantastic! Keep it up!",
    "You're amazing!",
  ];
  // Handle word drop
  const moveWord = useCallback(
    (sentenceIndex, dragIndex, hoverIndex) => {
      const updatedSentences = [...sentences];
      const words = [...updatedSentences[sentenceIndex]];
      const [movedWord] = words.splice(dragIndex, 1);
      words.splice(hoverIndex, 0, movedWord);
      updatedSentences[sentenceIndex] = words;
      setSentences(updatedSentences);
    },
    [sentences]
  );

  // Shuffle Button Handler
  const handleShuffle = () => {
    setSentences(shuffleSentences());
    setFeedback(Array(dragAndDropSentences.length).fill(null)); // Reset feedback
    setSuccess(false);
    setMessage("");
  };

  const handleCheckAnswers = () => {
    const results = sentences.map((userSentence, index) => {
      const originalSentence = dragAndDropSentences[index].split(" ");
      return JSON.stringify(userSentence) === JSON.stringify(originalSentence);
    });
    setFeedback(results);

    if (results.every((result) => result)) {
      // All sentences are correct
      setSuccess(true);
      setMessage(
        successMessages[Math.floor(Math.random() * successMessages.length)]
      );
    } else {
      setSuccess(false);
      setMessage("");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="drag-and-drop-container">
        <h3>Drag and Drop</h3>
        {success && (
          <div className="confetti-container">
            <ConfettiExplosion
              force={0.8}
              duration={5000}
              particleCount={250}
              width={1600}
            />
          </div>
        )}
        {success && <p className="success-message">{message}</p>}
        <div className="sentences-container">
          {sentences.map((words, sentenceIndex) => (
            <Sentence
              key={sentenceIndex}
              sentenceIndex={sentenceIndex}
              words={words}
              moveWord={moveWord}
              isCorrect={feedback[sentenceIndex]}
            />
          ))}
        </div>

        <div className="buttons-container">
          <button
            className="shuffle-button"
            onClick={handleShuffle}
            title="Shuffle"
          >
            <FontAwesomeIcon icon={faShuffle} />
          </button>
          <button className="check-button" onClick={handleCheckAnswers}>
            Check Answer
          </button>
        </div>
      </div>
    </DndProvider>
  );
};

// Sentence Component

const Sentence = ({ sentenceIndex, words, moveWord, isCorrect }) => {
  const sentenceClassName =
    isCorrect === null
      ? "sentence"
      : isCorrect
      ? "sentence correct"
      : "sentence incorrect";

  return (
    <div className={sentenceClassName}>
      {words.map((word, wordIndex) => (
        <Word
          key={wordIndex}
          word={word}
          sentenceIndex={sentenceIndex}
          index={wordIndex}
          moveWord={moveWord}
        />
      ))}
    </div>
  );
};

// Word Component
const Word = ({ word, sentenceIndex, index, moveWord }) => {
  const [, ref] = useDrag({
    type: "word",
    item: { index },
  });

  const [, drop] = useDrop({
    accept: "word",
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveWord(sentenceIndex, draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <span ref={(node) => ref(drop(node))} className="word">
      {word}
    </span>
  );
};

export default DragAndDrop;

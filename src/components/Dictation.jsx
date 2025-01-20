import React, { useState, useEffect, useRef } from "react";
import { flashcards } from "../utils/flashcardsData";
import "../styles/Dictation.css";

const Dictation = () => {
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current audio track
  const [userInput, setUserInput] = useState(""); // Store user's input
  const [validationMessage, setValidationMessage] = useState(""); // Validation message
  const [maskedSentence, setMaskedSentence] = useState(""); // Masked sentence with errors
  const [isCorrect, setIsCorrect] = useState(false); // Track if the answer is correct
  const [isExerciseComplete, setIsExerciseComplete] = useState(false); // Track if the exercise is completed
  const audioRef = useRef(null); // Reference to the audio player

  const currentTrack = flashcards[currentIndex]?.back;

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
    setValidationMessage("");
    setMaskedSentence("");
    setIsCorrect(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default new line behavior
      if (isCorrect) {
        goToNext(); // Proceed to the next sentence if correct
      } else {
        validateInput(); // Trigger "Check" button if the answer is not correct
      }
    }
  };

  const validateInput = () => {
    // Normalize the expected text and user input
    const normalizeText = (text) =>
      text
        .split(" ") //Split into words
        .filter((word) => word.trim() !== "") // Remove extra spaces
        .join(" "); // Rejoin into a single string

    const expectedText = normalizeText(currentTrack.text);
    const userText = normalizeText(userInput);

    // Compare normalized texts
    const expectedWords = expectedText.split(" ");
    const userWords = userText.split(" ");

    let correctPart = [];
    let isError = false;

    for (let i = 0; i < expectedWords.length; i++) {
      if (userWords[i] === expectedWords[i]) {
        correctPart.push(expectedWords[i]);
      } else {
        isError = true;
        correctPart.push(`<span class="error">${userWords[i] || "*"}</span>`);
        break;
      }
    }

    const remaining = expectedWords
      .slice(correctPart.length)
      .map(() => "*")
      .join(" ");

    if (isError) {
      setMaskedSentence(correctPart.join(" ") + " " + remaining);
      setValidationMessage("There is an error.");
    } else if (userText === expectedText) {
      if (currentIndex === flashcards.length - 1) {
        setValidationMessage("Great job! You've completed the exercise.");
        setIsExerciseComplete(true); // Mark the exercise as complete
      } else {
        setValidationMessage("You are correct!");
        setIsCorrect(true);
      }
    } else {
      setMaskedSentence(correctPart.join(" ") + " " + remaining);
      setValidationMessage("Keep going, you're close!");
    }
  };

  const goToNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetState();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetState();
    }
  };

  const resetState = () => {
    setUserInput("");
    setValidationMessage("");
    setMaskedSentence("");
    setIsCorrect(false);
  };

  const restartExercise = () => {
    setCurrentIndex(0);
    resetState();
    setIsExerciseComplete(false);
  };

  // Play the updated audio track when the currentIndex changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load(); // Reload the audio with the new src
      if (currentIndex > 0) {
        // Automatically play the audio for tracks after the first one
        audioRef.current.play(); // Automatically play the updated track
      }
    }
  }, [currentIndex]);

  return (
    <div className="dictation-container">
      <h3>Dictation</h3>

      {/* Navigation Controls */}
      <div className="navigation-controls">
        <button
          onClick={goToPrevious}
          className="navigation-button"
          disabled={currentIndex === 0 || isExerciseComplete}
        >
          &#8592;
        </button>
        <span className="tracks-status">
          {currentIndex + 1}/{flashcards.length}
        </span>
        <button
          onClick={goToNext}
          className="navigation-button"
          disabled={
            currentIndex === flashcards.length - 1 || isExerciseComplete
          }
        >
          &#8594;
        </button>
      </div>

      {/* End of Exercise Message */}
      {isExerciseComplete ? (
        <div className="completion-message">
          <p>Great Job! You've completed the exercise.</p>
          <button onClick={restartExercise} className="restart-button">
            Restart
          </button>
        </div>
      ) : (
        <>
          {/* Audio Player */}
          <div className="audio-container">
            <audio controls className="audio-player" ref={audioRef}>
              <source src={currentTrack.audio} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
          {/* Textarea for dictation */}
          <textarea
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown} // Listen for key presses
            rows="5"
            cols="65"
            placeholder="Type what you hear..."
          ></textarea>

          {/* Validation Area */}
          <div className="validation-area">
            {!isCorrect && (
              <button
                onClick={validateInput}
                className="check-dictation-button"
                disabled={!userInput.trim()}
                style={{ display: validationMessage && "none" }}
              >
                Check
              </button>
            )}

            {isCorrect && (
              <>
                {/* Validation Feedback */}
                <p className="validation-message">{validationMessage}</p>
                <button onClick={goToNext} className="next-button">
                  Next
                </button>
              </>
            )}

            {!isCorrect && validationMessage && (
              <p className="validation-message error-message">
                {validationMessage}
              </p>
            )}

            {/* Masked Sentence */}
            {!isCorrect && maskedSentence && (
              <div
                className="masked-sentence"
                dangerouslySetInnerHTML={{ __html: maskedSentence }}
              ></div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dictation;

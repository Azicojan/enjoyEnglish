import React, { useState, useEffect } from "react";
import { allPairs } from "../utils/numbersLessonData";
import ListenAndRepeat from "./ListenAndRepeat";

const getRandomPairs = () => {
  const shuffled = allPairs.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 10);
};

const Pronunciation = () => {
  const [pairs, setPairs] = useState(getRandomPairs());
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [completed, setCompleted] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [started, setStarted] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);

  const initializeExercise = () => {
    const randomIndex = Math.floor(Math.random() * 2);
    const selectedAudio = pairs[index].audios[randomIndex];
    setCurrentAudio(selectedAudio);
    setCorrectAnswer(pairs[index].options[randomIndex]);

    //Ensure the audio player reloads and plays
    setTimeout(() => {
      const audio = document.getElementById("audio-player");
      if (audio) {
        audio.load();
        audio.onloadeddata = () => {
          audio.play();
        };
      }
    }, 100);
  };

  useEffect(() => {
    if (started) {
      initializeExercise();
    }
  }, [index, started]);

  const handleStart = () => {
    setPairs(getRandomPairs());
    setStarted(true);
    setIndex(0);
    initializeExercise();
  };

  const handleChoice = (choice) => {
    if (answered) return; // Prevent multiple selections
    setAnswered(true);

    if (choice === correctAnswer) {
      setScore(score + 10);
      setFeedback(
        <span style={{ color: "green", fontWeight: "bold" }}>✅ Correct!</span>
      );
    } else {
      setFeedback(
        <span>
          <span style={{ color: "red", fontWeight: "bold" }}>
            ❌ Incorrect.
          </span>{" "}
          {pairs[index].explanations[correctAnswer]}
        </span>
      );
    }
  };

  const handleNext = () => {
    if (index < pairs.length - 1) {
      setIndex(index + 1);
      setFeedback("");
      setAnswered(false);
    } else {
      setCompleted(true);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h3>Minimal Pair Recognition</h3>
      {!started ? (
        <button
          onClick={handleStart}
          style={{
            padding: "10px 20px",
            fontSize: "18px",
            cursor: "pointer",
            borderRadius: "30px",
          }}
        >
          Start Exercise
        </button>
      ) : !completed ? (
        <div>
          <audio id="audio-player" controls autoPlay>
            <source src={currentAudio} type="audio/mp3" />
          </audio>
          <div style={{ marginTop: "20px" }}>
            {pairs[index].options.map((option) => (
              <button
                key={option}
                onClick={() => handleChoice(option)}
                disabled={answered}
                style={{
                  margin: "10px",
                  padding: "10px 20px",
                  fontSize: "18px",
                }}
              >
                {option}
              </button>
            ))}
          </div>

          {feedback && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              <p style={{ fontSize: "18px", marginRight: "10px" }}>
                {feedback}
              </p>
              {answered && (
                <button
                  onClick={handleNext}
                  style={{
                    padding: "10px",
                    fontSize: "24px",
                    backgroundColor: "transparent",
                    color: "black",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  ➡
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <h4>Your score: {score} / 100</h4>
      )}
      <ListenAndRepeat />
    </div>
  );
};

export default Pronunciation;

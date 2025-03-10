import React from "react";
import { numbersLessonSentences } from "../../../utils/numbersLessonData";
import { useNavigate } from "react-router-dom";
import "../../../styles/Lesson1.css";
import image from "../../../assets/Numbers_lesson1/lesson1.jpg";
import lessonAudio from "../../../assets/Numbers_lesson1/lesson1-audio.mp3";
import FlashcardList from "../../../components/FlashcardList";
import SplitTracks from "../../../components/SplitTracks";
import DragAndDrop from "../../../components/DragAndDrop";
import Dictation from "../../../components/Dictation";
import OutputPractice from "../../../components/OutputPractice";
import Pronunciation from "../../../components/Pronunciation";

const Lesson1 = () => {
  const navigate = useNavigate(); // Hook for navigation

  return (
    <div className="lesson1-container">
      {/* Fixed Lesson Header */}
      <div className="lesson1-header">
        <span className="back-arrow" onClick={() => navigate("/modules/1")}>
          &#8592; {/* Left arrow */}
        </span>
        <h2 className="lesson1-title">Lesson 1: Counting from 1 to 10</h2>
      </div>

      {/* Lesson Content */}
      <div className="lesson1-content">
        <img
          src={image}
          alt="Bill at the football match"
          style={{ height: 448, width: 790 }}
        />

        {/* Audio Player */}
        <div className="audio-container">
          <h3>Listen and repeat:</h3>
          <audio controls className="audio-player">
            <source src={lessonAudio} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
        <div className="lesson1-text">
          {numbersLessonSentences.map((sentence, index) => (
            <span key={index} className="lesson1-sentence">
              {" "}
              {sentence}
            </span>
          ))}
        </div>
      </div>
      <SplitTracks />
      <FlashcardList />
      <DragAndDrop />
      <Dictation />
      <OutputPractice />
      <Pronunciation />
    </div>
  );
};

export default Lesson1;

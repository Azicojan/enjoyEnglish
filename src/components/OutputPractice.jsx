import React, { useRef, useState, useEffect } from "react";
import "../styles/OutputPractice.css";

const OutputPractice = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [dialogue, setDialogue] = useState([]); // Stores all questions and answers
  const [exerciseStarted, setExerciseStarted] = useState(false);

  const isRecordingRef = useRef(false); // Track recording state with useRef
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingExceededLimit = useRef(false); // Track if time limit was exceeded
  const timeoutRef = useRef(null); // Store timeout ID

  const questions = [
    { text: "Hi, what is your name?" },
    { text: "And how old are you?" },
    { text: "Great! By the way, where do you live?" },
    { text: "Okay, and do you have any brothers or sisters?" },
  ];

  useEffect(() => {
    if (exerciseStarted && questionIndex < questions.length) {
      // Display the current question in the dialogue immediately
      setDialogue((prevDialogue) => [
        ...prevDialogue,
        {
          question: questions[questionIndex].text,
          transcription: null,
          audio: null,
          feedback: null,
          feedbackType: null, // Stores type of feedback for styling
        },
      ]);

      // Play the current question's audio
      playAudio(questionIndex);
    }
  }, [questionIndex, exerciseStarted]);

  const playAudio = async (questionIndex) => {
    try {
      // Use local audio file from src/assets/Numbers_lesson1
      const audioPath = `/src/assets/Numbers_lesson1/question_${
        questionIndex + 1
      }.mp3`;
      const audio = new Audio(audioPath);
      audio.play();
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        if (recordingExceededLimit.current) {
          // Do not send audio if time limit was exceeded
          audioChunksRef.current = [];
          recordingExceededLimit.current = false; // Reset flag
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/mp3",
        });
        audioChunksRef.current = [];

        // Create a URL for audio playback
        const audioURL = URL.createObjectURL(audioBlob);

        // Proceed to transcription
        await handleTranscription(audioBlob, audioURL);
      };

      // Reset timeout and exceeded flag before starting a new recording
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      recordingExceededLimit.current = false; // Reset limit flag

      mediaRecorderRef.current.start();
      setIsRecording(true);
      isRecordingRef.current = true; // Ensure ref updates immediately

      // Automatically stop recording after 10 seconds and set a new timeout
      timeoutRef.current = setTimeout(() => {
        if (isRecordingRef.current) {
          recordingExceededLimit.current = true; // Mark as exceeded
          stopRecording();
          setFeedback(
            "The time limit was exceeded. Please answer the question concisely."
          );
        }
      }, 10000);
      setFeedback("");
    } catch (error) {
      console.log("Error accessing microphone:", error);
      setFeedback(
        "Error accessing your microphone. Please check your settings."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      isRecordingRef.current = false; // Ensure ref updates immediately

      // Clear timeout when recording stops manually
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };

  const handleTranscription = async (audioBlob, audioURL) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.mp3");
    formData.append("question", questions[questionIndex].text); // Send question with audio

    try {
      const response = await fetch("http://localhost:5000/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      let feedbackType = "neutral"; // Default style

      if (data.feedback === "Sorry, you should answer in English.") {
        feedbackType = "error"; // Red color for non-English responses
      } else if (
        data.feedback.includes(
          "The user's response is grammatically incorrect."
        )
      ) {
        feedbackType = "warning"; // Orange triangle for grammar mistakes
      } else if (data.feedback.includes("No issues found.")) {
        feedbackType = "success"; // Green check mark for correct responses
      }

      // if the response is not in English, show only feedback (no transcription or audio)
      if (!data.transcription) {
        setDialogue((prevDialogue) =>
          prevDialogue.map((item, index) =>
            index === questionIndex
              ? { ...item, feedback: data.feedback, feedbackType }
              : item
          )
        );
        return; // Do not proceed to store transcription or move to next question
      }

      // If response is in English, store transcription, feedback and audio together
      setDialogue((prevDialogue) =>
        prevDialogue.map((item, index) =>
          index === questionIndex
            ? {
                ...item,
                transcription: data.transcription,
                audio: audioURL,
                feedback: data.feedback,
                feedbackType, // Stores feedback type for styling
              }
            : item
        )
      );

      // Move to the next question only if the response is in English
      if (data.proceedToNextQuestion) {
        moveToNextQuestion();
      } else {
        setFeedback("You need to answer in English before continuing.");
      }
    } catch (error) {
      console.error("Error during transcription:", error);
      setFeedback(
        "There was an error processing your recording. Please try again."
      );
    }
  };

  const moveToNextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      setFeedback("You have completed the practice session!");
    }
  };

  const startExercise = () => {
    setExerciseStarted(true);
  };

  return (
    <div className="container">
      <h2>Output Practice</h2>
      {!exerciseStarted ? (
        <button className="start-button" onClick={startExercise}>
          Start Exercise
        </button>
      ) : (
        <>
          <div className="dialogue-container">
            {dialogue.map((item, index) => (
              <div key={index} className="dialogue-row">
                <div className="question">
                  <p>
                    <strong>Question {index + 1}:</strong>
                    {item.question}
                  </p>
                </div>
                <div className="response">
                  {item.transcription && (
                    <>
                      <p>
                        <strong>Answer:</strong> {item.transcription}
                      </p>
                      <audio controls>
                        <source src={item.audio} type="audio/mp3" />
                        Your browser does not support the audio element.
                      </audio>
                    </>
                  )}
                  {item.feedback && (
                    <div className={`feedback ${item.feedbackType}`}>
                      {item.feedbackType === "error"}
                      {item.feedbackType === "warning" && (
                        <span style={{ fontSize: 25 }}>⚠️ </span>
                      )}
                      {item.feedbackType === "success"}
                      <p>{item.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="feedback">{feedback}</div>
          <button
            className={`record-button ${isRecording ? "recording" : ""}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={feedback === "You have completed the practice session!"} // Disable when session is complete
          >
            {isRecording ? "Stop" : "Speak"}
          </button>
        </>
      )}
    </div>
  );
};

export default OutputPractice;

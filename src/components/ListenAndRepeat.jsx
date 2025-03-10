import React, { useState, useRef, useEffect } from "react";
import { audioFiles } from "../utils/numbersLessonData";
import { MediaRecorder, register } from "extendable-media-recorder";
import { connect } from "extendable-media-recorder-wav-encoder";
import axios from "axios";
import { phonemeLetterMap } from "../utils/phonemeMap";

const ListenAndRepeat = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [userScore, setUserScore] = useState(null);
  const [retryAllowed, setRetryAllowed] = useState(false);
  const [wordsFeedback, setWordsFeedback] = useState([]);

  let mediaRecorderRef = useRef(null); // MediaRecorder instance
  let audioChunksRef = useRef([]); // Store recorded audio chunks
  let streamRef = useRef(null); // Store media stream

  const currentWord = audioFiles[currentIndex];
  const audioRef = useRef(null);
  let encoderRegistered = useRef(false); // Prevent multiple encoder registrations

  // Register the WAV encoder only ONCE when the component mounts
  useEffect(() => {
    // Ensure the correct audio file is loaded when the index changes
    audioRef.current = new Audio(currentWord.audioPath);

    const setupWavEncoder = async () => {
      try {
        if (!encoderRegistered.current) {
          console.log("Registering WAV encoder..."); // Debugging
          await register(await connect());
          encoderRegistered.current = true; // Mark encoder as registered
        }
      } catch (err) {
        console.error("Failed to initialize WAV encoder:", err);
      }
    };

    setupWavEncoder();
  }, [currentIndex]); // Runs when currentIndex changes

  // Play model pronunciation
  const playAudio = () => {
    if (!audioRef.current) return;
    setIsPlaying(true);
    audioRef.current.play();
    audioRef.current.onended = () => setIsPlaying(false);
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true },
      });
      streamRef.current = stream;

      // Create MediaRecorder instance
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/wav",
      });
      audioChunksRef.current = [];

      // Collect audio chunks
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      setTimeout(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          mediaRecorderRef.current.stop();
        }
      }, 5000); // Stop recording after 5 seconds

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        await sendAudioToAzure(audioBlob);
        setIsRecording(false);
      };
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setIsRecording(false);
    }
  };

  // Function to send audio to Azure API
  const sendAudioToAzure = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob); // Send the recorded WAV blob directly
    formData.append("expectedPhrase", currentWord.sentence || currentWord.word);

    try {
      const response = await axios.post(
        "http://localhost:5000/azure-pronunciation",
        formData
      );
      const { accuracyScore, wordsFeedback, overallFeedback } = response.data;

      setUserScore(accuracyScore);
      setFeedback(overallFeedback);
      setWordsFeedback(wordsFeedback);
      setRetryAllowed(accuracyScore < 80);
    } catch (error) {
      console.error("Azure API Error:", error);
      setFeedback("Error analyzing pronunciation.");
    }
  };

  // Function to retry pronunciation
  const handleRetry = () => {
    setRetryAllowed(false);
    setUserScore(null);
    setFeedback("");
    setWordsFeedback([]);
    playAudio();
  };
  return (
    <div style={{ marginTop: "50px" }}>
      <h3>Listen and Repeat</h3>
      {wordsFeedback.length > 0 ? (
        wordsFeedback.map(({ text, color, error, phonemeDetails }, index) => {
          let finalColor = color;
          let highlightPhonemes = false;

          // Rule 1: Omission or Mispronunciation → Make the whole word red
          if (error === "Omission" || error === "Mispronunciation") {
            finalColor = "red";
          }

          // Rule 2: Insertion Error → Make the entire sentence red
          if (wordsFeedback.some((word) => word.error === "Insertion")) {
            finalColor = "red";
          }

          // If no full-word error exists, prepare to highlight phonemes
          if (error !== "Omission" && error !== "Mispronunciation") {
            highlightPhonemes = true;
          }

          return (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Display the original sentence with mispronounced letters highlighted */}
              <div
                style={{
                  display: "flex",
                  gap: "5px",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                {highlightPhonemes && phonemeDetails?.length > 0
                  ? text.split("").map((letter, letterIndex) => {
                      let letterColor = finalColor; // Default color for the letter

                      phonemeDetails.forEach((phoneme) => {
                        if (phoneme.NBestPhonemes?.length) {
                          const incorrectPhoneme =
                            phoneme.NBestPhonemes[0].Phoneme;
                          const highScoringCount = phoneme.NBestPhonemes.filter(
                            (p) => p.Score >= 90
                          ).length;

                          // Check if the incorrect phoneme maps to this letter
                          if (
                            Object.keys(phonemeLetterMap).includes(
                              incorrectPhoneme
                            ) &&
                            phonemeLetterMap[incorrectPhoneme].includes(
                              letter.toLowerCase()
                            )
                          ) {
                            letterColor = "red"; // Mark only the letter red
                          }

                          // Rule 3: If a phoneme has two NBestPhonemes with scores ≥ 90, highlight it in red
                          if (highScoringCount >= 2) {
                            letterColor = "red";
                          }
                        }
                      });

                      return (
                        <span key={letterIndex} style={{ color: letterColor }}>
                          {letter}
                        </span>
                      );
                    })
                  : text}
              </div>

              {/* Display phonetic transcription below the original sentence, horizontally */}
              <div
                style={{
                  display: "flex",
                  gap: "5px",
                  fontSize: "18px",
                  fontStyle: "italic",
                  color: "#555",
                }}
              >
                <span>/</span>
                {phonemeDetails.map((phoneme, phonemeIndex) => {
                  let phonemeColor = finalColor; // Default color for phoneme

                  // Apply same color rules for phonemes as letters
                  if (phoneme.NBestPhonemes?.length) {
                    const incorrectPhoneme = phoneme.NBestPhonemes[0].Phoneme;
                    const highScoringCount = phoneme.NBestPhonemes.filter(
                      (p) => p.Score >= 90
                    ).length;

                    if (
                      Object.keys(phonemeLetterMap).includes(
                        incorrectPhoneme
                      ) &&
                      phonemeLetterMap[incorrectPhoneme].includes(
                        phoneme.phoneme.toLowerCase()
                      )
                    ) {
                      phonemeColor = "red"; // Mark mispronounced phoneme red
                    }

                    if (highScoringCount >= 2) {
                      phonemeColor = "red";
                    }
                  }

                  return (
                    <span key={phonemeIndex} style={{ color: phonemeColor }}>
                      {phoneme.phoneme}
                    </span>
                  );
                })}
                <span>/</span>
              </div>
            </div>
          );
        })
      ) : (
        <p>{currentWord.sentence || currentWord.word}</p>
      )}
      <p>{feedback}</p>

      {/* Play Audio Button */}
      <button onClick={playAudio} disabled={isPlaying}>
        {isPlaying ? "Playing..." : "Play Pronunciation"}
      </button>

      {/* Record Button */}
      <button onClick={startRecording} disabled={isRecording}>
        {isRecording ? "Recording..." : "Record Your Pronunciation"}
      </button>

      {/* Retry Button */}
      {retryAllowed && <button onClick={handleRetry}>Retry</button>}
      {/* Display Score */}
      {userScore !== null && <p>Score: {userScore}%</p>}
    </div>
  );
};
export default ListenAndRepeat;

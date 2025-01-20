import React, { useRef, useState, useEffect } from "react";

const OutputPractice = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [feedback, setFeedback] = useState("");
  const [question, setQuestion] = useState("What is your name?"); // Example question
  const [audioURL, setAudioURL] = useState(null); // Store the audio URL for playback

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/mp3",
        });
        audioChunksRef.current = [];

        // Create a URL for audio playback
        const audioURL = URL.createObjectURL(audioBlob);
        setAudioURL(audioURL);

        // Proceed to transcription
        await handleTranscription(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
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
    }
  };

  const handleTranscription = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.mp3");

    try {
      const response = await fetch("http://localhost:5000/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setTranscription(data.transcription);

      setFeedback(
        data.transcription.trim()
          ? `Great! Your response was: ${data.transcription}`
          : "It seems like nothing was recorded. Please try speaking louder or clearer."
      );
    } catch (error) {
      console.error("Error:", error);
      setFeedback(
        "There was an error processing your recording. Please try again."
      );
    }
  };

  return (
    <div>
      <h2>Output Practice</h2>
      <p>
        <strong>Question:</strong>
        {question}
      </p>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        style={{
          backgroundColor: isRecording ? "red" : "blue",
          color: "white",
          padding: "10px 20px",
          borderRadius: "5px",
        }}
      >
        {isRecording ? "Stop" : "Speak"}
      </button>

      {/* Audio playback */}
      {audioURL && (
        <div>
          <h3>Recorded Audio</h3>
          <audio controls>
            <source src={audioURL} type="audio/mp3" />
            Your browser does not support the audio element
          </audio>
        </div>
      )}

      {transcription && (
        <div>
          <h3>Your Response</h3>
          <p>{transcription}</p>
        </div>
      )}
      {feedback && (
        <div>
          <h3>Feedback</h3>
          <p>{feedback}</p>
        </div>
      )}
    </div>
  );
};

export default OutputPractice;

require("dotenv").config();
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 5000;

app.use(cors()); // Allow requests from frontend
app.use(express.json());

// Multer setup for handling audio uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save files in uploads/ folder
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}.wav`); // Ensure the filename has .wav extension
  },
});
const upload = multer({ storage: storage });

// Azure Speech API config
const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_REGION = process.env.AZURE_REGION;
const AZURE_ENDPOINT = `https://${AZURE_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`;

// API route to process audio pronunciation
app.post("/azure-pronunciation", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No audio file uploaded" });

    const audioBuffer = fs.readFileSync(req.file.path);
    const referenceText = req.body.expectedPhrase; // Word/Phrase to compare

    // Build pronunciation assessment parameters
    const pronAssessmentParamsJson = {
      ReferenceText: referenceText,
      GradingSystem: "HundredMark",
      Dimension: "Comprehensive",
      EnableMiscue: true,
      EnableProsodyAssessment: true,
      PhonemeAlphabet: "IPA",
      NBestPhonemeCount: 5,
    };

    const pronAssessmentParams = Buffer.from(
      JSON.stringify(pronAssessmentParamsJson),
      "utf-8"
    ).toString("base64");

    // Prepare Azure request headers
    const headers = {
      "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
      "Pronunciation-Assessment": pronAssessmentParams,
      Accept: "application/json",
      Connection: "Keep-Alive",
      "Content-Type": "audio/wav",
    };

    // Send audio to Azure API

    const response = await axios.post(AZURE_ENDPOINT, audioBuffer, { headers });
    //console.log(response.data);

    // Extract pronunciation assessment results
    const { NBest } = response.data;
    if (!NBest || NBest.length === 0) {
      return res
        .status(400)
        .json({ error: "No pronunciation data returned from Azure." });
    }
    //console.log(NBest[0].Words);

    const bestResult = NBest[0]; // Get the best pronunciation match
    const { AccuracyScore, Words } = bestResult; // Extract overall accuracy and word-level details

    //console.log(bestResult);

    // Process word-level pronunciation feedback
    const wordsFeedback = Words.map((word) => {
      let color = "green"; // Default color

      // Extract phoneme details, ensuring it's defined
      /*const phonemeDetails = word.Phonemes
        ? word.Phonemes.map((phoneme) => ({
            phoneme: phoneme.Phoneme,
            accuracy: phoneme.AccuracyScore,
            errorType: phoneme.ErrorType,
            NBestPhonemes: phoneme.NBestPhonemes || [], // Ensure it's not undefined
          }))
        : [];*/

      // Extract phoneme details
      const phonemeDetails = word.Phonemes
        ? word.Phonemes.map((phoneme) => {
            const topPhoneme = phoneme.NBestPhonemes[0]?.Phoneme || null;
            const isCorrect = topPhoneme === phoneme.Phoneme; // Check if top-matching phoneme is correct

            return {
              phoneme: phoneme.Phoneme,
              accuracy: phoneme.AccuracyScore,
              errorType: phoneme.ErrorType,
              NBestPhonemes: phoneme.NBestPhonemes || [],
              color: isCorrect ? "green" : "red", // Mark incorrect phonemes red
            };
          })
        : [];

      // Extract syllable details
      const syllableDetails = word.Syllables
        ? word.Syllables.map((syllable) => syllable.Syllable)
        : [];

      // Rule 1: Omission or Mispronunciation -> Mark word as red
      if (
        word.ErrorType === "Omission" ||
        word.ErrorType === "Mispronunciation"
      ) {
        color = "red";
        phonemeDetails.forEach((phoneme) => (phoneme.color = "red")); // Ensure all phonemes in this word are red
      }

      // Rule 2: if any word has "Insertion", we need to mark the whole  sentence as red
      const hasInsertion = Words.some((w) => w.ErrorType === "Insertion");
      if (hasInsertion) {
        Words.forEach((w) => (w.color = "red"));
      }

      // Check if the top-matched phoneme is incorrect
      /* const hasIncorrectPhoneme = phonemeDetails.some((phoneme) => {
        const topPhoneme = phoneme.NBestPhonemes[0]?.Phoneme; // Best-matched phoneme
        return topPhoneme && topPhoneme !== phoneme.phoneme; // If best match ≠ expected phoneme
      });

      if (hasIncorrectPhoneme) {
        color = "red"; // Mark word as mispronounced
      }*/

      return {
        text: word.Word,
        accuracy: word.AccuracyScore,
        color,
        error: word.ErrorType,
        phonemeDetails, // Ensure phoneme details are always returned
        syllableDetails, // Include extracted syllables
      };
    });

    // Check if the rule for Insertion is triggered and adjust all colors if needed
    if (wordsFeedback.some((word) => word.error === "Insertion")) {
      wordsFeedback.forEach((word) => (word.color = "red"));
    }

    console.log(
      "Extracted Words Feedback:",
      JSON.stringify(wordsFeedback, null, 2)
    );

    res.json({
      wordsFeedback,
    });
  } catch (error) {
    console.error(
      "Azure API Error",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Failed to process audio" });
  }
});

// Start server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

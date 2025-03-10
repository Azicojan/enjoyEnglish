import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";

dotenv.config();

const app = express();
// Enable CORS to allow requests from your frontend
app.use(cors());
app.use(express.json()); // Enables JSON parsing in the request body

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Multer configuration to handle file + text data
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Transcription endpoint
app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { question } = req.body; // Extracts the question from the request
    if (!question) {
      return res.status(400).json({ error: "No question provided" });
    }

    const audioFilePath = path.resolve(req.file.path); // Path to the uploaded audio file

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: "whisper-1",
    });

    // Delete the uploaded file after processing
    fs.unlinkSync(audioFilePath);

    // Grammar and relevance validation
    const grammarPrompt = `
      The following is a user's response to the question: "${question}".
      Please:
      1. Ensure it is in English. If it is not in English, respond ONLY with: "Sorry, you should answer in English" and do NOT provide further feedback. 
      2. Confirm it directly answers the question: "${question}"
      3. Limit the response to concise, relevant answers.
      4. Check the grammar and spelling of the response.
      5. If the response is in English, but it is grammatically incorrect, reply ONLY "The user's response is grammatically incorrect. The correct response should be:"The correct version". Score:X/10 where X is the score.
      6. If the response is grammatically correct, reply ONLY "No issues found. Score: X/10" where X is the score.
      User's Response: "${transcription.text}"    
    `;

    const grammarResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "developer", content: grammarPrompt }],
    });

    const grammarFeedback = grammarResponse.choices[0].message.content.trim();

    // If the response is "Sorry, you should answer in English", don't proceed to the next question
    if (grammarFeedback.startsWith("Sorry, you should answer in English")) {
      return res.json({
        transcription: null, // Do not display the response
        feedback: grammarFeedback,
        proceedToNextQuestion: false, // Prevents moving to the next question
      });
    }

    // Otherwise, continue as usual
    res.json({
      transcription: transcription.text,
      feedback: grammarFeedback,
      proceedToNextQuestion: true,
    });
  } catch (error) {
    console.error("Error during transcription or grammar feedback:", error);
    res.status(500).json({
      error: "An error occurred while processing the request.",
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));

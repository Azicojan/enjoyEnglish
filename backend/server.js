import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";

dotenv.config();

const app = express();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Enable CORS to allow requests from your frontend
app.use(cors());

// Multer configuration
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
    const audioFilePath = path.resolve(req.file.path); // Path to the uploaded audio file

    //console.log("Resolved file path:", audioFilePath);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: "whisper-1",
    });

    // Delete the uploaded file after processing
    fs.unlinkSync(audioFilePath);
    res.json({ transcription: transcription.text });
  } catch (error) {
    console.error("Error during transcribtion:", error);
    res.status(500).json({
      error: "An error occured while processing the transcription.",
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));

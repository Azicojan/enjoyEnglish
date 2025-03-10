import fs from "fs";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Set the FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const slowDownAudio = async (inputPath, outputPath, speed) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioFilters(`atempo=${speed}`)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
};
/*
const questions = [
  "Hi, what is your name?",
  "And how old are you?",
  "Great! By the way, where do you live?",
  "Okay, and do you have any brothers and sisters?",
];*/

const questions = ["She noticed a my noote detail in the painting."];

const generateAudioFiles = async () => {
  const outputDir = path.join("assets/questions");

  // Ensure the directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const [index, question] of questions.entries()) {
    try {
      console.log(`Generating audio for question ${index + 1}: ${question}`);
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: question,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      // const filePath = path.join(outputDir, `question_${index + 1}.mp3`);
      const tempFilePath = path.join(
        outputDir,
        `temp_question_${index + 1}.mp3`
      );
      const finalFilePath = path.join(outputDir, `question_${index + 1}.mp3`);

      // Save the raw audio
      await fs.promises.writeFile(tempFilePath, buffer);

      // Slow down the audio (e.g reduce speed to 0.8x)
      console.log(`Slowing down audio for question ${index + 1}`);
      await slowDownAudio(tempFilePath, finalFilePath, 0.8);

      // Remove the temporary file
      fs.unlinkSync(tempFilePath);

      console.log(`Audio saved: ${finalFilePath}`);
    } catch (error) {
      console.error(`Error generating audio for question ${index + 1}:`, error);
    }
  }
};

generateAudioFiles();

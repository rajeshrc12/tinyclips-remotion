import { createClient } from "@deepgram/sdk";
import { config } from "../config/config.js";
import fs from "fs";
import path from "path";

const deepgram = createClient(config.deepgram.apiKey);

export const transcribeAudio = async (audioName) => {
  const tempFolder = "/tmp/audio"; // or move this to a shared config

  const audioPath = path.join(tempFolder, audioName);

  // Ensure file exists
  if (!fs.existsSync(audioPath)) {
    throw new Error(`Audio file not found at: ${audioPath}`);
  }

  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(fs.readFileSync(audioPath), {
    model: "nova-3",
    language: "en",
    smart_format: true,
    utterances: true,
  });

  if (error) {
    console.error(error);
  } else {
    const words = result.results.channels[0].alternatives[0].words;
    const sentences = result.results.channels[0].alternatives[0].paragraphs.paragraphs[0].sentences;
    // Iterate through the sentences array, except the last one
    for (let i = 0; i < sentences.length; i++) {
      // Set the current sentence's start to the previous sentence's end
      sentences[i].start = Number(sentences[i].start.toFixed(2));
      sentences[i].word = sentences[i].text;
      delete sentences[i].text;
      if (i < sentences.length - 1) sentences[i].end = Number(sentences[i + 1].start.toFixed(2));
    }
    return { words, sentences };
  }
};

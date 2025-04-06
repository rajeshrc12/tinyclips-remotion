import { AssemblyAI } from "assemblyai";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { config } from "../config/config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const client = new AssemblyAI({ apiKey: config.assemblyAI.apiKey });
const rootDir = path.resolve(__dirname, "../..");
const tempFolder = path.join(rootDir, "temp");

export const transcribeAudio = async (audioFilename) => {
  try {
    const audioPath = path.join(tempFolder, audioFilename);

    // Ensure file exists
    if (!fs.existsSync(audioPath)) {
      throw new Error(`Audio file not found at: ${audioPath}`);
    }

    // Transcribe the audio file
    const transcript = await client.transcripts.transcribe({
      audio: fs.createReadStream(audioPath), // Corrected: Use 'audioPath' here
      speaker_labels: true,
      punctuate: true,
      format_text: true,
    });

    if (transcript.status === "error") {
      console.error(`Transcription failed: ${transcript.error}`);
      return false;
    }

    // Process sentences
    const subtitlesSentence = [];
    transcript.utterances.forEach((sentence) => {
      subtitlesSentence.push({
        start: Number((sentence.start / 1000).toFixed(2)), // Convert ms to sec
        end: Number((sentence.end / 1000).toFixed(2)),
        word: sentence.text,
      });
    });

    const output = [];
    let word = "";
    let start = 0.0;

    // Merge words into sentences based on end/start timings
    for (let i = 0; i < subtitlesSentence.length; i++) {
      if (i + 1 === subtitlesSentence.length) {
        output.push({
          start,
          end: subtitlesSentence[i].end,
          word: word + subtitlesSentence[i].word,
        });
        break;
      }

      if (subtitlesSentence[i].end === subtitlesSentence[i + 1].start) {
        word += subtitlesSentence[i].word + " ";
      } else {
        output.push({
          start,
          end: subtitlesSentence[i + 1].start,
          word: word + subtitlesSentence[i].word,
        });
        word = "";
        start = subtitlesSentence[i + 1].start;
      }
    }

    // Process words for word-level subtitles
    const subtitlesWord = [];
    transcript.words.forEach((wordObj) => {
      subtitlesWord.push({
        start: Number((wordObj.start / 1000).toFixed(2)),
        end: Number((wordObj.end / 1000).toFixed(2)),
        word: wordObj.text,
      });
    });

    console.log("Transcription completed");

    return { subtitlesWord, subtitlesSentence: output };
  } catch (error) {
    console.error("AssemblyAI Transcription Error:", error.message || error);
    throw error;
  }
};

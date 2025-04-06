import "dotenv/config";
import axios from "axios";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
const accessToken = process.env.GOOGLE_CLOUD_ACCESS_TOKEN;
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

export const synthesizeSpeech = async ({ text, voiceName, languageCode }) => {
  const url = "https://texttospeech.googleapis.com/v1/text:synthesize";

  const requestData = {
    input: {
      text,
    },
    voice: {
      languageCode,
      name: voiceName,
    },
    audioConfig: {
      audioEncoding: "LINEAR16",
    },
  };

  try {
    const response = await axios.post(url, requestData, {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-User-Project": projectId,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const base64Audio = response.data.audioContent;
    const buffer = Buffer.from(base64Audio, "base64");

    const filename = `tts-${uuidv4()}.wav`;
    const outputDir = "/tmp/audio"; // make sure this folder exists or create it
    const filePath = path.join(outputDir, filename);

    // Ensure temp directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(filePath, buffer);
    return filename;
  } catch (error) {
    console.error("Text-to-Speech Error:", error.response?.data || error.message);
    throw error;
  }
};

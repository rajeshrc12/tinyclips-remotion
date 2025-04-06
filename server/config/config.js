import "dotenv/config";

export const config = {
  google: {
    accessToken: process.env.GOOGLE_CLOUD_ACCESS_TOKEN,
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  },
  assemblyAI: {
    apiKey: process.env.ASSEMBLYAI_API_KEY,
  },
  deepgram: {
    apiKey: process.env.DEEPGRAM_API_KEY,
  },
  nebius: {
    apiKey: process.env.NEBIUS_API_KEY,
  },
  server: {
    port: process.env.PORT || 3000,
  },
  paths: {
    tempDir: "./temp",
    videoDir: "./videos",
  },
};

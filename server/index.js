import express from "express";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { createRequire } from "node:module";
import { synthesizeSpeech } from "./service/google.js";
import { transcribeAudio } from "./service/deepgram.js";
import { getSubtitleWithImageIndex, splitTimeSeries } from "./utils/subtitle.js";
import { createImagePrompts, generateImage } from "./service/nebius.js";

const require = createRequire(import.meta.url);
const app = express();
app.use(express.json());
// Serve entire /tmp directory
app.use("/tmp", express.static("/tmp"));

const port = process.env.PORT || 3000;

app.post("/render", async (req, res) => {
  const { script, voiceName, languageCode } = req.body;
  const outputPath = `./videos/output-${Date.now()}.mp4`;

  try {
    const audioName = await synthesizeSpeech({
      text: script,
      voiceName,
      languageCode,
    });
    const subtitle = await transcribeAudio(audioName);
    const subtitlesTimeSeries = splitTimeSeries(subtitle.sentences);
    const subtitleWithImageIndex = getSubtitleWithImageIndex(subtitlesTimeSeries);
    const imagePrompts = [];
    const imageStyle = "Hyper-realistic";
    const promptPromises = subtitlesTimeSeries.map((subtitle) => createImagePrompts(script, subtitle.word, subtitle.series.length, imageStyle));
    const allPrompts = await Promise.all(promptPromises);
    allPrompts.forEach((prompt) => imagePrompts.push(...prompt));
    const imagePromises = imagePrompts.map((prompt) => generateImage(prompt));
    const allImagePrompts = await Promise.all(imagePromises);
    const timestampWithImage = subtitleWithImageIndex.map((sub) => ({ ...sub, image: allImagePrompts[sub.index] }));
    const inputProps = { videoLength: subtitle.sentences[subtitle.sentences.length - 1].end, subtitleWithImageIndex: timestampWithImage, subtitles: subtitle.words, audioName };

    console.log("Bundling project...");
    const bundled = await bundle({
      entryPoint: require.resolve("../src/index.ts"),
      webpackOverride: (config) => config,
    });
    const composition = await selectComposition({
      serveUrl: bundled,
      id: "MyComp",
      inputProps,
    });

    console.log("Rendering...");
    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: "h264",
      outputLocation: outputPath,
      inputProps,
      chromiumOptions: {
        enableMultiProcessOnLinux: true,
      },
    });
    console.log("success");
    // res.download(outputPath);
    res.send("audioPath");
  } catch (err) {
    console.error(err);
    res.status(500).send("Render failed");
  }
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

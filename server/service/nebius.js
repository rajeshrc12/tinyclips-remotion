import OpenAI from "openai";
import { config } from "../config/config.js";

const client = new OpenAI({
  baseURL: "https://api.studio.nebius.com/v1/",
  apiKey: config.nebius.apiKey,
});

export const createImagePrompts = async (mainScript, subScript, imageCount, imageStyle) => {
  console.log("Generating prompts from script...");

  const scriptTemplate = `
Read and thoroughly understand the following Main Script to grasp its full context:
Main Script:
"${mainScript}"

Now, analyze the Sub-Script, which is a part of the Main Script. Your task is to generate total ${imageCount} relevant and visually compelling ${imageStyle} style portrait image prompt that aligns with Sub-Script.
Mention ${imageStyle} style in each prompt.
Accurately depict the scene, emotions, facial expressions, and overall atmosphere.
If the Sub-Script references a product, service, or advertisement then add appropriate text, symbols, or objects to blend seamlessly into the environment.
Primary focus should be on the Sub-Script when generating the prompts, ensuring relevance and coherence.

Sub-Script:
"${subScript}"

Return array of prompts with valid JSON format, so I can parse without error.
[
"First prompt description",
"Second prompt description",
...
"Last prompt description"
]

In response ensure there are no extra keys, indices, or labels.
    `;

  try {
    // Generate the response from the model (mocking the model call for now)
    const response = await client.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V3",
      max_tokens: 512,
      temperature: 0.3,
      top_p: 0.95,
      messages: [
        {
          role: "system",
          content: scriptTemplate,
        },
      ],
    });

    // Assuming the model response is in the format where content is a string of JSON
    const content = JSON.parse(response.choices[0].message.content);
    console.log("Prompts generated successfully.");
    return content;
  } catch (error) {
    console.log("Prompt generation error", error);
    return [];
  }
};

export const generateImage = async (prompt) => {
  console.log("generating image...");
  try {
    const response = await client.images.generate({
      model: "black-forest-labs/flux-schnell",
      response_format: "url",
      extra_body: {
        response_extension: "png",
        width: 576,
        height: 1024,
        num_inference_steps: 4,
        negative_prompt: "Distorted body, extra limbs, missing fingers, deformed face, incorrect spelling, gibberish text, extra fingers, disembodied head.",
        seed: -1,
      },
      prompt: prompt,
    });
    const url = response.data[0].url;
    console.log(prompt, url);
    console.log("generating completed!!!");
    return url;
  } catch (error) {
    console.error("Error generating image:", error);
    return "";
  }
};

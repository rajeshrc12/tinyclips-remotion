import { Composition } from "remotion";
import { MyComp } from "./MyComp";
import { getInputProps } from "remotion";
type InputProps = {
  videoLength: number;
};
export const RemotionRoot: React.FC = () => {
  const inputProps = getInputProps<InputProps>();
  const fps = 60;
  const videoLength = inputProps.videoLength;
  const totalDurationFrames = Math.round(videoLength * fps);

  return <Composition id="MyComp" component={MyComp} durationInFrames={totalDurationFrames} fps={fps} width={576} height={1024} />;
};

// Replace these with your actual image dimensions
// const IMAGE_WIDTH = 576; // Your image width in pixels
// const IMAGE_HEIGHT = 1024; // Your image height in pixels
// const fps = 60;
// const durationPerImageMs = 200 + 1700 + 100;
// const imageCount = 3;

// const totalDurationFrames = Math.round(((durationPerImageMs * imageCount) / 1000) * fps);

// export const RemotionRoot = () => {
//   return (
//     <>
//       <Composition
//         id="MyVideo"
//         component={MyVideo}
//         durationInFrames={totalDurationFrames}
//         fps={fps}
//         width={IMAGE_WIDTH} // Use image width
//         height={IMAGE_HEIGHT} // Use image height
//       />
//     </>
//   );
// };

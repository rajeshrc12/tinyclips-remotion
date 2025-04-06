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

  return <Composition id="MyComp" component={MyComp as any} durationInFrames={totalDurationFrames} fps={fps} width={576} height={1024} />;
};

import { useCurrentFrame, useVideoConfig, Img, interpolate, spring, Audio, staticFile } from "remotion";

interface Subtitle {
  start: number;
  end: number;
  image: string;
  word: string;
}
interface MyCompProps {
  text: string;
  subtitleWithImageIndex: Subtitle[]; // Adjust the type depending on your data structure
  subtitles: Subtitle[];
  audioName: string;
}
export const MyComp: React.FC<MyCompProps> = ({ subtitleWithImageIndex, subtitles, audioName }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  // Scale transition values
  const scaleStart = 1.7;
  const scaleMid = 1.3;
  const scaleEnd = 1.0;

  // Phase 1 duration (in seconds)
  const phase1Duration = 0.2;
  const phase1Frames = phase1Duration * fps;
  return (
    <div>
      {/* Add the Audio component to play the audio file */}
      <Audio
        src={`http://localhost:3000/tmp/audio/${audioName}`}
        startFrom={0} // Start the audio at the beginning
        endAt={durationInFrames}
      />
      {subtitleWithImageIndex.map((data, index) => {
        // Convert start and end times to frames
        const imageStartFrame = data.start * fps;
        const imageEndFrame = data.end * fps;

        // If current frame is outside image duration range, don't render it
        if (frame < imageStartFrame || frame > imageEndFrame) return null;

        // Calculate the relative frame for the current image
        const relativeFrame = frame - imageStartFrame;

        // Interpolate scale value
        let scale;
        if (relativeFrame <= phase1Frames) {
          // First phase: scale from 1.5 to 1.3 in 0.2 seconds
          scale = interpolate(relativeFrame, [0, phase1Frames], [scaleStart, scaleMid], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
        } else {
          // Second phase: scale from 1.3 to 1.0 for the remaining duration
          const remainingFrame = relativeFrame - phase1Frames;
          const remainingDurationFrames = imageEndFrame - imageStartFrame - phase1Frames;
          scale = interpolate(remainingFrame, [0, remainingDurationFrames], [scaleMid, scaleEnd], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
        }

        return (
          <Img
            key={index}
            src={data.image}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${scale})`, // Apply scale transition
            }}
          />
        );
      })}
      {subtitles.map((s, i) => {
        const startFrame = Math.floor(s.start * fps);
        const endFrame = Math.floor(s.end * fps);
        const durationFrames = endFrame - startFrame;

        const isVisible = frame >= startFrame && frame < endFrame;
        if (!isVisible) return null;

        const relativeFrame = frame - startFrame;

        const subtitleScale = spring({
          fps,
          frame: relativeFrame,
          from: 0.8,
          to: 1.0,
          config: {
            damping: 80,
            mass: 0.6,
            stiffness: 120,
          },
          durationInFrames: durationFrames,
        });

        const opacity = interpolate(relativeFrame, [0, durationFrames * 0.1, durationFrames * 0.9, durationFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${subtitleScale})`,
              opacity,
              color: "white",
              fontSize: "70px",
              fontWeight: 900,
              textShadow: "4px 4px 8px rgba(0, 0, 0, 0.7)",
              textAlign: "center",
              whiteSpace: "pre-wrap",
              padding: "0 40px",
              WebkitTextStroke: "1px black",
              WebkitTextFillColor: "white", // to ensure stroke + fill works well together
            }}
          >
            {s.word}
          </div>
        );
      })}
    </div>
  );
};

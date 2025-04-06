import { useCurrentFrame, useVideoConfig, Img, interpolate, spring, Audio } from "remotion";
import { loadFont } from "@remotion/google-fonts/LuckiestGuy";
import React, { useMemo } from "react";

const { fontFamily } = loadFont();

interface Subtitle {
  start: number;
  end: number;
  image: string;
  word: string;
}

interface MyCompProps {
  text: string;
  subtitleWithImageIndex: Subtitle[];
  subtitles: Subtitle[];
  audioName: string;
}

export const MyComp: React.FC<MyCompProps> = React.memo(({ subtitleWithImageIndex, subtitles, audioName }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  // Scale transition values
  const scaleStart = 1.7;
  const scaleMid = 1.3;
  const scaleEnd = 1.0;
  const phase1Duration = 0.2;
  const phase1Frames = useMemo(() => phase1Duration * fps, [fps]);

  // Filter visible elements
  const visibleImages = useMemo(() => {
    return subtitleWithImageIndex.filter(data => {
      const imageStartFrame = data.start * fps;
      const imageEndFrame = data.end * fps;
      return frame >= imageStartFrame && frame <= imageEndFrame;
    });
  }, [subtitleWithImageIndex, fps, frame]);

  const visibleSubtitles = useMemo(() => {
    return subtitles.filter(s => {
      const startFrame = Math.floor(s.start * fps);
      const endFrame = Math.floor(s.end * fps);
      return frame >= startFrame && frame < endFrame;
    });
  }, [subtitles, fps, frame]);

  // Create image elements
  const imageElements = useMemo(() => {
    return visibleImages.map((data, index) => {
      const imageStartFrame = data.start * fps;
      const relativeFrame = frame - imageStartFrame;

      let scale;
      if (relativeFrame <= phase1Frames) {
        scale = interpolate(relativeFrame, [0, phase1Frames], [scaleStart, scaleMid], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
      } else {
        const remainingFrame = relativeFrame - phase1Frames;
        const imageEndFrame = data.end * fps;
        const remainingDurationFrames = imageEndFrame - imageStartFrame - phase1Frames;
        scale = interpolate(remainingFrame, [0, remainingDurationFrames], [scaleMid, scaleEnd], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
      }

      return (
        <Img
          key={`img-${index}`}
          src={data.image}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
          }}
        />
      );
    });
  }, [visibleImages, fps, frame, phase1Frames]);

  // Create subtitle elements
  const subtitleElements = useMemo(() => {
    return visibleSubtitles.map((s, i) => {
      const startFrame = Math.floor(s.start * fps);
      const endFrame = Math.floor(s.end * fps);
      const durationFrames = endFrame - startFrame;
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

      const opacity = interpolate(
        relativeFrame,
        [0, durationFrames * 0.1, durationFrames * 0.9, durationFrames],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

      return (
        <div
          key={`sub-${i}`}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${subtitleScale})`,
            opacity,
            color: "white",
            fontSize: "60px",
            textShadow: "4px 4px 8px rgba(0, 0, 0, 0.7)",
            textAlign: "center",
            whiteSpace: "pre-wrap",
            padding: "0 40px",
            WebkitTextStroke: "3px black",
            WebkitTextFillColor: "white",
            fontFamily
          }}
        >
          {s.word}
        </div>
      );
    });
  }, [visibleSubtitles, fps, frame, fontFamily]);

  return (
    <div>
      <Audio
        src={`http://localhost:3000/tmp/audio/${audioName}`}
        startFrom={0}
        endAt={durationInFrames}
      />
      {imageElements}
      {subtitleElements}
    </div>
  );
});
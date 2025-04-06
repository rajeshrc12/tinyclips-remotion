import React from "react";
import { useCurrentFrame, useVideoConfig, Img, interpolate, spring, Audio } from "remotion";
import img1 from "../../public/1.png";
import img2 from "../../public/3.png";
import img3 from "../../public/4.png";
import audio from "../../public/audio.wav";

export const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const subtitle = [
    { start: 0.0, end: 0.3, word: "Welcome" },
    { start: 0.3, end: 0.6, word: "to" },
    { start: 0.6, end: 0.9, word: "the" },
    { start: 0.9, end: 1.2, word: "future" },
    { start: 1.2, end: 1.5, word: "of" },
    { start: 1.5, end: 1.8, word: "AI" },
    { start: 1.8, end: 2.1, word: "and" },
    { start: 2.1, end: 2.4, word: "creativity" },
    { start: 2.4, end: 2.7, word: "in" },
    { start: 2.7, end: 3.0, word: "motion" },
    { start: 3.0, end: 3.3, word: "Where" },
    { start: 3.3, end: 3.6, word: "imagination" },
    { start: 3.6, end: 3.9, word: "meets" },
    { start: 3.9, end: 4.2, word: "intelligence" },
    { start: 4.2, end: 4.5, word: "in" },
    { start: 4.5, end: 4.8, word: "every" },
    { start: 4.8, end: 5.1, word: "frame" },
    { start: 5.1, end: 5.4, word: "of" },
    { start: 5.4, end: 5.7, word: "this" },
    { start: 5.7, end: 6.0, word: "journey" },
  ];

  const images = [img1, img2, img3];

  const t1 = 200;
  const t2 = 1700;
  const t3 = 100;
  const durationPerImageMs = t1 + t2 + t3;
  const durationPerImageFrames = Math.round((durationPerImageMs / 1000) * fps);

  const scaleStart = 1.5;
  const scaleMid1 = 1.3;
  const scaleMid2 = 1.1;
  const scaleEnd = 1.0;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <Audio src={audio} startFrom={0} endAt={durationInFrames} />
      {images.map((src, index) => {
        const imageStart = index * durationPerImageFrames;
        const imageEnd = imageStart + durationPerImageFrames;

        if (frame < imageStart || frame > imageEnd) return null;

        const relativeFrame = frame - imageStart;

        const f1 = (t1 / 1000) * fps;
        const f2 = ((t1 + t2) / 1000) * fps;
        const f3 = ((t1 + t2 + t3) / 1000) * fps;

        const scale = interpolate(relativeFrame, [0, f1, f2, f3], [index === 0 ? 2.0 : scaleStart, scaleMid1, scaleMid2, scaleEnd], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <Img
            key={index}
            src={src}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${scale})`,
            }}
          />
        );
      })}

      {subtitle.map((s, i) => {
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

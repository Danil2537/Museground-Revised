"use client";

import { useRef, useState } from "react";
import WaveSurfer, { WaveSurferOptions } from "wavesurfer.js";

interface Sample {
  name: string;
  fileUrl: string;
}

export default function SampleCard({ sample }: { sample: Sample }) {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const [wave, setWave] = useState<WaveSurfer | null>(null);

  const handleLoadWaveform = async () => {
    if (wave || !waveformRef.current) return; // Already loaded or not mounted

    const options: WaveSurferOptions = {
      container: waveformRef.current,
      waveColor: "#999",
      progressColor: "#0af",
      height: 80,
    };

    const ws = WaveSurfer.create(options);

    //const audioUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/bucket/file/${sample.fileUrl}`;
    //alert(audioUrl);
    ws.load(sample.fileUrl);
    setWave(ws);
  };

  return (
    <div className="sample-card">
      <h3>{sample.name}</h3>
      <button onClick={handleLoadWaveform}>Preview</button>
      <div ref={waveformRef}></div>
    </div>
  );
}

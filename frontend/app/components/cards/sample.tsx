"use client";

import { BACKEND_URL } from "@/app/constants";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import WaveSurfer, { WaveSurferOptions } from "wavesurfer.js";

interface Sample {
  _id: string;
  name: string;
  fileUrl: string;
  BPM: number;
  key: string;
  genres: string;
  instruments: string;
  author: string;
}

export default function SampleCard({ sample }: { sample: Sample }) {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const [wave, setWave] = useState<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loudness, setLoudness] = useState(0.5);

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!waveformRef.current) return;

    const options: WaveSurferOptions = {
      container: waveformRef.current,
      waveColor: "#999",
      progressColor: "#0af",
      height: 80,
    };

    const ws = WaveSurfer.create(options);
    ws.load(sample.fileUrl);

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));

    setWave(ws);

    return () => {
      ws.destroy();
    };
  }, [sample.fileUrl]);

  const handlePlayPause = () => {
    wave?.playPause();
  };

  const handleLoudnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setLoudness(newVolume);
    wave?.setVolume(newVolume);
  };

  const handleSave = async () => {
    const saveSampleDto = {
      userId: user?._id,
      itemType: "Sample",
      itemId: sample._id,
    };
    const url = `${BACKEND_URL}/users/save-item`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(saveSampleDto),
    });

    const data = await res.json();
    alert(JSON.stringify(data));
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  return (
    <tr className="sample-card">
      <td>
        <h3>{sample.name}</h3>
      </td>
      <td>
        <div ref={waveformRef}></div>
      </td>
      <td>
        <button
          onClick={handlePlayPause}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          <span className="material-symbols-outlined">
            {isPlaying ? "pause" : "play_arrow"}
          </span>
        </button>
      </td>
      <td>
        <input
          type="range"
          min="0.01"
          max="1"
          step="0.01"
          value={loudness}
          onChange={handleLoudnessChange}
        />
      </td>
      <td>
        <span>{sample.BPM}</span>
      </td>
      <td>
        <span>{sample.key}</span>
      </td>
      <td>
        <span>{sample.genres}</span>
      </td>
      <td>
        <span>{sample.instruments}</span>
      </td>
      <td>
        <span>{sample.author}</span>
      </td>
      <td>
        <button onClick={handleSave}>Save</button>
      </td>
    </tr>
  );
}

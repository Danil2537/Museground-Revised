"use client";

import { BACKEND_URL } from "@/app/constants";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

interface Sample {
  _id: string;
  name: string;
  fileUrl: string;
  BPM: number;
  key: string;
  genres: string;
  instruments: string;
  authorName: string;
}

export default function SampleCard({ sample }: { sample: Sample }) {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const [wave, setWave] = useState<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loudness, setLoudness] = useState(0.5);
  const [pitch, setPitch] = useState(1.0);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!waveformRef.current) return;

    let ws: WaveSurfer | null = null;
    let isCancelled = false;

    const initWaveform = async () => {
      try {
        ws = WaveSurfer.create({
          container: waveformRef.current!,
          waveColor: "#00F0FF",
          progressColor: "#0070FF",
          height: 80,
        });

        await ws.load(sample.fileUrl);

        if (isCancelled) {
          ws.destroy();
          return;
        }

        ws.on("play", () => setIsPlaying(true));
        ws.on("pause", () => setIsPlaying(false));

        setWave(ws);
      } catch (err) {
        console.error("WaveSurfer init error:", err);
      }
    };

    initWaveform();

    return () => {
      isCancelled = true;
      if (ws) {
        try {
          ws.destroy();
        } catch (err) {
          console.warn("WaveSurfer destroy error:", err);
        }
      }
    };
  }, [sample.fileUrl]);

  const handlePlayPause = () => {
    wave?.playPause();
  };

  const handleLoudnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setLoudness(newVolume);
    wave?.setVolume(loudness);
  };

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPitch = parseFloat(e.target.value);
    setPitch(newPitch);
    wave?.setPlaybackRate(newPitch, false);
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
    <tr className="hover:bg-zinc-800 transition-colors">
      <td className="px-4 py-3">
        <button
          onClick={handlePlayPause}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="text-cyan-400 hover:text-sky-500 transition"
        >
          <span className="material-symbols-outlined text-3xl">
            {isPlaying ? "pause" : "play_arrow"}
          </span>
        </button>
      </td>
      <td className="px-4 py-3 w-[250px]">
        <div ref={waveformRef} className="w-full"></div>
      </td>
      <td className="px-4 py-3">
        <input
          type="range"
          min="0.01"
          max="1"
          step="0.01"
          value={loudness}
          onChange={handleLoudnessChange}
          className="w-full accent-cyan-400"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="range"
          min="0.1"
          max="2"
          step="0.1"
          value={pitch}
          onChange={handlePitchChange}
          onMouseUp={() => {
            setPitch(1.0);
            wave?.setPlaybackRate(1.0, false);
          }}
          onTouchEnd={() => {
            setPitch(1.0);
            wave?.setPlaybackRate(1.0, false);
          }}
          className="w-full accent-cyan-400"
        />
      </td>
      <td className="px-4 py-3">{sample.key}</td>
      <td className="px-4 py-3">{sample.BPM}</td>
      <td className="px-4 py-3">{sample.genres}</td>
      <td className="px-4 py-3">{sample.instruments}</td>
      <td className="px-4 py-3">{sample.authorName}</td>
      <td className="px-4 py-3">
        <button
          onClick={handleSave}
          className="bg-cyan-400 text-shadow-white hover:bg-sky-500 hover:text-[#343a40] font-semibold rounded-lg px-3 py-1 transition"
        >
          Save
        </button>
      </td>
    </tr>
  );
}

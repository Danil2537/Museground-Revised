"use client";

import { BACKEND_URL } from "@/app/constants";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

interface Preset {
  _id: string;
  name: string;
  authorId: string;
  fileUrl: string;
  soundFileUrl: string;
  vst?: string;
  genres?: string;
  types?: string;
  fileId: string;
  soundFileId: string;
  authorName: string;
}

interface PresetCardProps {
  preset: Preset;
  onFilterClick?: (field: string, value: string) => void;
}

export default function PresetCard({ preset, onFilterClick }: PresetCardProps) {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const [wave, setWave] = useState<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
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

        await ws.load(preset.soundFileUrl);
        alert(preset.soundFileUrl);
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
  }, [preset.soundFileUrl]);

  const handlePlayPause = () => {
    wave?.playPause();
  };

  const handleSave = async () => {
    const savePresetDto = {
      userId: user?._id,
      itemType: "Preset",
      itemId: preset._id,
    };
    const url = `${BACKEND_URL}/users/save-item`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(savePresetDto),
    });

    const data = await res.json();
    alert(JSON.stringify(data));
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  return (
    <div className="bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 hover:border-cyan-400 transition-colors flex flex-col justify-between p-4">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={handlePlayPause}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-400 text-zinc-900 hover:bg-sky-500 transition material-symbols-outlined text-3xl"
        >
          {isPlaying ? "pause" : "play_arrow"}
        </button>

        <h2 className="text-lg font-semibold text-gray-100 truncate ml-3 flex-1">
          {preset.name}
        </h2>
      </div>

      <div className="text-sm text-gray-400 space-y-1">
        {preset.vst && (
          <button
            onClick={() => onFilterClick?.("vst", preset.vst!)}
            className="text-cyan-400 font-medium hover:underline"
          >
            {preset.vst}
          </button>
        )}

        {preset.genres && (
          <button
            onClick={() => onFilterClick?.("genres", preset.genres!)}
            className="ml-2 text-gray-300 hover:text-cyan-400 transition"
          >
            {preset.genres}
          </button>
        )}

        {preset.types && (
          <button
            onClick={() => onFilterClick?.("types", preset.types!)}
            className="ml-2 text-gray-400 hover:text-cyan-400 transition"
          >
            {preset.types}
          </button>
        )}
      </div>

      <div ref={waveformRef} className="mt-3 rounded-md overflow-hidden" />

      <div className="flex items-center justify-between mt-3 text-sm text-gray-400">
        <button
          onClick={() =>
            onFilterClick?.("author", preset.authorName ?? preset.authorId)
          }
          className="text-cyan-300 font-medium hover:underline"
        >
          @{preset.authorName ?? preset.authorId}
        </button>
      </div>
      <div className="flex items-center justify-between mt-2 text-gray-400">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 bg-cyan-400 text-white hover:bg-sky-500 hover:text-[#343a40] font-semibold rounded-lg px-3 py-1 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

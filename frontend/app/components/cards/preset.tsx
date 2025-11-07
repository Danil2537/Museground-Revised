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
  const [showIsSaved, setShowIsSaved] = useState(false);
  const [showIsCreated, setShowIsCreated] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Initialize waveform and check if saved/created
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
        if (isCancelled) {
          ws.destroy();
          return;
        }

        ws.on("play", () => setIsPlaying(true));
        ws.on("pause", () => setIsPlaying(false));

        setWave(ws);

        // --- Check saved status ---
        if (user?._id) {
          const res = await fetch(
            `${BACKEND_URL}/saved-items/check-saved/${user._id}/Preset/${preset._id}`,
          );
          const isSaved = await res.json();
          setShowIsSaved(isSaved);

          if (preset.authorId === user._id) {
            setShowIsCreated(true);
          }
        }
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
  }, [preset.soundFileUrl, preset._id, preset.authorId, user?._id]);

  const handlePlayPause = () => {
    wave?.playPause();
  };

  // --- Save Preset ---
  const handleSave = async () => {
    if (!user) return;

    const savePresetDto = {
      userId: user._id,
      itemType: "Preset",
      itemId: preset._id,
    };

    const res = await fetch(`${BACKEND_URL}/users/save-item`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(savePresetDto),
    });

    if (res.ok) {
      //alert(`Preset "${preset.name}" saved!`);
      setShowIsSaved(true);
    } else {
      alert("Failed to save preset.");
    }
  };

  // --- Unsave Preset ---
  const handleDeleteSave = async () => {
    if (!user) return;

    const res = await fetch(`${BACKEND_URL}/users/delete-saved`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user._id,
        itemType: "Preset",
        itemId: preset._id,
      }),
    });

    if (res.ok) {
      //alert("Preset removed from saved!");
      setShowIsSaved(false);
    } else {
      alert("Failed to remove saved preset.");
    }
  };

  // --- Delete created Preset ---
  const handleDelete = async () => {
    if (!user || preset.authorId !== user._id) {
      alert("You can only delete your own presets.");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/presets/delete/${preset._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete preset.");

      //alert(`Preset "${preset.name}" was successfully deleted.`);
      router.refresh();
    } catch (err) {
      console.error("Error deleting preset:", err);
      alert("Failed to delete preset.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  const handleDownloadPreset = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/presets/download/${preset._id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to download preset");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const fileUrl = preset.fileUrl;
      const extensionMatch = fileUrl.match(/\.[^/.]+$/);
      const extension = extensionMatch ? extensionMatch[0] : "";

      a.download = `${preset.name}${extension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download preset.");
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 hover:border-cyan-400 transition-colors flex flex-col justify-between p-4">
      {/* Header */}
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

      {/* Metadata */}
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

      {/* Waveform */}
      <div ref={waveformRef} className="mt-3 rounded-md overflow-hidden" />

      {/* Author */}
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

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 mt-3">
        {!showIsSaved && (
          <button
            onClick={handleSave}
            className="bg-green-600 text-white font-semibold rounded-lg px-3 py-1 hover:bg-green-500 transition"
          >
            Save Preset
          </button>
        )}

        {showIsSaved && (
          <div>
            <button
              onClick={handleDeleteSave}
              className="bg-cyan-400 text-white font-semibold rounded-lg px-3 py-1 my-2 w-full hover:bg-cyan-500 transition"
            >
              Saved
            </button>
            <button
              onClick={handleDownloadPreset}
              className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition disabled:opacity-50"
            >
              Download
            </button>
          </div>
        )}

        {showIsCreated && (
          <div className="flex">
            <span className="w-1/2 py-2 rounded-lg text-center bg-violet-400 text-white font-semibold">
              Created by You
            </span>
            <button
              onClick={handleDelete}
              className="w-1/2 py-2 rounded-lg text-center bg-red-500 text-white font-semibold hover:bg-red-600 transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

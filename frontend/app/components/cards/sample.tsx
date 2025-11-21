"use client";

import { BACKEND_URL } from "@/app/constants";
import { useAuth } from "@/app/context/AuthContext";
import { useRef, useState, useEffect } from "react";
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
  authorId: string;
}

export default function SampleCard({
  sample,
  onDelete,
}: {
  sample: Sample;
  onDelete?: (id: string) => void;
}) {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const [wave, setWave] = useState<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loudness, setLoudness] = useState(0.5);
  const [pitch, setPitch] = useState(1.0);
  const [showIsSaved, setShowIsSaved] = useState(false);
  const [showIsCreated, setShowIsCreated] = useState(false);
  const { user, loading } = useAuth();

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

        // Only fetch saved/created status if user is logged in
        if (user) {
          const isSavedRes = await fetch(
            `${BACKEND_URL}/saved-items/check-saved/${user._id}/Sample/${sample._id}`,
          );
          if (isSavedRes.ok) {
            const isSaved = await isSavedRes.json();
            setShowIsSaved(isSaved);
            setShowIsCreated(sample.authorId === user._id);
          }
        }
      } catch (err) {
        console.error("WaveSurfer init error:", err);
      }
    };

    initWaveform();

    return () => {
      isCancelled = true;
      if (ws) ws.destroy();
    };
  }, [sample._id, sample.authorId, sample.fileUrl, user]);

  const handlePlayPause = () => wave?.playPause();
  const handleLoudnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setLoudness(newVolume);
    wave?.setVolume(newVolume);
  };
  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPitch = parseFloat(e.target.value);
    setPitch(newPitch);
    wave?.setPlaybackRate(newPitch, false);
  };

  const handleSave = async () => {
    if (!user) return;
    const res = await fetch(`${BACKEND_URL}/users/save-item`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        userId: user._id,
        itemType: "Sample",
        itemId: sample._id,
      }),
    });
    if (res.ok) setShowIsSaved(true);
  };

  const handleDeleteSave = async () => {
    if (!user) return;
    const res = await fetch(`${BACKEND_URL}/users/delete-saved`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user._id,
        itemType: "Sample",
        itemId: sample._id,
      }),
    });
    if (res.ok) setShowIsSaved(false);
  };

  const handleDelete = async () => {
    if (!user || sample.authorId !== user._id) return;
    const res = await fetch(`${BACKEND_URL}/samples/delete/${sample._id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (res.ok) {
      onDelete?.(sample._id);
    }
  };

  const handleDownloadSample = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/samples/download/${sample._id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to download sample");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = sample.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <tr className="hover:bg-zinc-800 transition-colors">
      {" "}
      <td className="px-4 py-3">
        <button
          onClick={handlePlayPause}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="text-cyan-400 hover:text-sky-500 transition"
        >
          {" "}
          <span className="material-symbols-outlined text-3xl">
            {isPlaying ? "pause" : "play_arrow"}{" "}
          </span>{" "}
        </button>{" "}
      </td>{" "}
      <td className="px-4 py-3 w-[250px]">
        {" "}
        <div ref={waveformRef} className="w-full"></div>{" "}
      </td>{" "}
      <td className="px-4 py-3">
        {" "}
        <input
          type="range"
          min="0.01"
          max="1"
          step="0.01"
          value={loudness}
          onChange={handleLoudnessChange}
          className="w-full accent-cyan-400"
        />{" "}
      </td>{" "}
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
        />{" "}
      </td>{" "}
      <td className="px-4 py-3">{sample.name}</td>{" "}
      <td className="px-4 py-3">{sample.key}</td>{" "}
      <td className="px-4 py-3">{sample.BPM}</td>{" "}
      <td className="px-4 py-3">{sample.genres}</td>{" "}
      <td className="px-4 py-3">{sample.instruments}</td>{" "}
      <td className="px-4 py-3">{sample.authorName}</td>{" "}
      <td className="px-4 py-3">
        {user && !showIsSaved && (
          <button
            onClick={handleSave}
            className="w-full py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-500 transition disabled:opacity-50"
          >
            Save{" "}
          </button>
        )}
        {user && showIsSaved && (
          <div>
            {" "}
            <button
              onClick={handleDeleteSave}
              className="w-full py-2 rounded-lg bg-cyan-400 text-white font-semibold hover:bg-cyan-500 transition disabled:opacity-50"
            >
              Saved{" "}
            </button>{" "}
            <button
              onClick={handleDownloadSample}
              className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition disabled:opacity-50"
            >
              Download{" "}
            </button>{" "}
          </div>
        )}
        {user && showIsCreated && (
          <div className="flex">
            {" "}
            <span className="w-1/2 py-2 rounded-lg text-center bg-violet-400 text-white font-semibold transition disabled:opacity-50">
              Created By You{" "}
            </span>{" "}
            <button
              onClick={handleDelete}
              className="w-1/2 py-2 rounded-lg text-center bg-red-500 text-white font-semibold hover:bg-red-600 transition disabled:opacity-50"
            >
              Delete{" "}
            </button>{" "}
          </div>
        )}{" "}
      </td>{" "}
    </tr>
  );
}

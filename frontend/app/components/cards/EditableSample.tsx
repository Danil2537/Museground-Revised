/* eslint-disable @typescript-eslint/no-explicit-any */
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
  authorId: string;
}

export default function EditableSampleCard({ sample }: { sample: Sample }) {
  const [editableSample, setEditableSample] = useState(sample);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const [wave, setWave] = useState<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loudness, setLoudness] = useState(0.5);
  const [pitch, setPitch] = useState(1.0);
  const [showIsSaved, setShowIsSaved] = useState(false);
  const [showIsCreated, setShowIsCreated] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  // --------- File Replace ----------
  const handleReplaceFile = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sampleId", editableSample._id);

      try {
        const res = await fetch(`${BACKEND_URL}/samples/replace-file`, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("File upload failed");
        await res.json();
      } catch (err) {
        console.error("File replace error:", err);
      }
    };
    input.click();
  };

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

  const handleDelete = async () => {
    if (!user || editableSample.authorId !== user._id) {
      alert("You can only delete your own samples.");
      return;
    }

    try {
      const res = await fetch(
        `${BACKEND_URL}/samples/delete/${editableSample._id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (!res.ok) throw new Error("Failed to delete sample.");
      //alert(`Sample "${editableSample.name}" was deleted.`);
      router.refresh();
    } catch (err) {
      console.error("Error deleting sample:", err);
      alert("Failed to delete sample.");
    }
  };

  // --------- Download Sample ----------
  const handleDownloadSample = async () => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/samples/download/${editableSample._id}`,
        {
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Failed to download sample");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = editableSample.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  // --------- WaveSurfer Init ----------
  useEffect(() => {
    if (!waveformRef.current) return;
    let ws: WaveSurfer | null = null;
    let isCancelled = false;

    const initWaveform = async () => {
      ws = WaveSurfer.create({
        container: waveformRef.current!,
        waveColor: "#00F0FF",
        progressColor: "#0070FF",
        height: 80,
      });
      await ws.load(editableSample.fileUrl);
      if (isCancelled) {
        ws.destroy();
        return;
      }

      ws.on("play", () => setIsPlaying(true));
      ws.on("pause", () => setIsPlaying(false));
      setWave(ws);

      const isSavedRes = await fetch(
        `${BACKEND_URL}/saved-items/check-saved/${user?._id}/Sample/${editableSample._id}`,
      );
      const isSaved = await isSavedRes.json();
      setShowIsSaved(isSaved);
      if (editableSample.authorId === user?._id) setShowIsCreated(true);
    };

    initWaveform();

    return () => {
      isCancelled = true;
      ws?.destroy();
    };
  }, [
    editableSample._id,
    editableSample.authorId,
    editableSample.fileUrl,
    user?._id,
  ]);

  const handlePlayPause = () => wave?.playPause();

  const handleSave = async () => {
    const saveSampleDto = {
      userId: user?._id,
      itemType: "Sample",
      itemId: editableSample._id,
    };
    const res = await fetch(`${BACKEND_URL}/users/save-item`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(saveSampleDto),
    });
    await res.json();
    setShowIsSaved(true);
  };

  const handleDeleteSave = async () => {
    if (!user) return;
    await fetch(`${BACKEND_URL}/users/delete-saved`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user._id,
        itemType: "Sample",
        itemId: editableSample._id,
      }),
    });
    setShowIsSaved(false);
  };

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setEditableSample({
      ...editableSample,
      [name]: type === "number" && value !== "" ? Number(value) : value,
    });
  };

  const handleUpdateSample = async () => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/samples/update/${editableSample._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editableSample),
        },
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to update sample: ${errorText}`);
      }

      const updatedSample = await res.json();
      //console.log(" Sample updated:", updatedSample);
      return updatedSample;
    } catch (err) {
      console.error(" Error updating sample:", err);
      throw err;
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  return (
    <tr>
      <div className="bg-zinc-900 rounded-xl p-6 mb-8 shadow-lg border border-zinc-700 text-white space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {["name", "key", "BPM", "genres", "instruments"].map((field) => (
            <div key={field} className="relative">
              <input
                type={field === "BPM" ? "number" : "text"}
                name={field}
                value={(editableSample as any)[field]}
                onChange={handleFormDataChange}
                placeholder=" "
                className="bg-zinc-800 w-full text-lg peer rounded-lg border border-gray-600 px-3 pt-5 pb-2 placeholder-transparent focus:border-cyan-400 focus:ring focus:ring-blue-200"
              />
              <label
                htmlFor={field}
                className="absolute left-3 top-1 text-cyan-400 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-300 peer-focus:top-1 peer-focus:text-cyan-400"
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handlePlayPause}
            className="text-cyan-400 hover:text-sky-500 transition text-4xl"
          >
            <span className="material-symbols-outlined">
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          </button>

          <div ref={waveformRef} className="flex-1 min-w-[200px]" />

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="flex flex-col items-center">
              <label className="text-sm text-gray-400">Volume</label>
              <input
                type="range"
                min="0.01"
                max="1"
                step="0.01"
                value={loudness}
                onChange={handleLoudnessChange}
                className="accent-cyan-400 w-32"
              />
            </div>
            <div className="flex flex-col items-center">
              <label className="text-sm text-gray-400">Pitch</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={handlePitchChange}
                className="accent-cyan-400 w-32"
              />
            </div>
          </div>
        </div>

        {/* Row 3 – Action Buttons */}
        <div className="flex flex-wrap justify-start gap-3 pt-2">
          {!showIsSaved ? (
            <button
              onClick={handleSave}
              className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500 transition"
            >
              Save
            </button>
          ) : (
            <button
              onClick={handleDeleteSave}
              className="bg-cyan-500 px-4 py-2 rounded-lg hover:bg-cyan-400 transition"
            >
              Saved
            </button>
          )}

          <button
            onClick={handleDownloadSample}
            className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition"
          >
            Download
          </button>

          {showIsCreated && (
            <>
              <span className="bg-violet-500 px-4 py-2 rounded-lg">
                Created By You
              </span>
              <button
                onClick={handleReplaceFile}
                className="bg-sky-600 px-4 py-2 rounded-lg hover:bg-sky-500 transition"
              >
                Replace File
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500 transition"
              >
                Delete
              </button>
              <button
                onClick={handleUpdateSample}
                className="bg-cyan-500 px-4 py-2 rounded-lg hover:bg-cyan-400 transition"
              >
                Update
              </button>
            </>
          )}
        </div>
      </div>
    </tr>
  );
}

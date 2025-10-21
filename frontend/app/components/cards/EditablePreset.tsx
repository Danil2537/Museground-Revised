/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { BACKEND_URL } from "@/app/constants";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

interface Preset {
  _id: string;
  name: string;
  fileUrl: string;
  soundFileUrl: string;
  vst?: string;
  genres?: string;
  types?: string;
  authorName: string;
  authorId: string;
}

export default function EditablePresetCard({ preset }: { preset: Preset }) {
  const [editablePreset, setEditablePreset] = useState(preset);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const [wave, setWave] = useState<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loudness, setLoudness] = useState(0.5);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showIsSaved, setShowIsSaved] = useState(false);
  const [showIsCreated, setShowIsCreated] = useState(false);

  const handleReplaceFile = async (type: "preset" | "sound") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type === "sound" ? "audio/*" : "*/*";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("presetId", editablePreset._id);
      formData.append(
        "fileType",
        type === "sound" ? "soundFile" : "presetFile",
      );

      try {
        const res = await fetch(`${BACKEND_URL}/presets/replace-preset-file`, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error(await res.text());
        const updated = await res.json();
        setEditablePreset(updated.preset);
        alert(`${type} file replaced successfully!`);
      } catch (err) {
        console.error("File replace error:", err);
        alert(`Failed to replace ${type} file.`);
      }
    };
    input.click();
  };

  // --------- Delete Preset ----------
  const handleDelete = async () => {
    if (!user || editablePreset.authorId !== user._id) {
      alert("You can only delete your own presets.");
      return;
    }

    try {
      const res = await fetch(
        `${BACKEND_URL}/presets/delete/${editablePreset._id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Failed to delete preset.");
      alert(`Preset "${editablePreset.name}" deleted.`);
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete preset.");
    }
  };

  // --------- Update Preset ----------
  const handleUpdatePreset = async () => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/presets/update/${editablePreset._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editablePreset),
        },
      );
      if (!res.ok) throw new Error("Failed to update preset.");
      const updated = await res.json();
      setEditablePreset(updated);
      alert("Preset updated!");
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  // --------- Play/Pause Sound ----------
  useEffect(() => {
    if (!waveformRef.current) return;
    let ws: WaveSurfer | null = null;
    let isCancelled = false;

    const initWave = async () => {
      ws = WaveSurfer.create({
        container: waveformRef.current!,
        waveColor: "#00F0FF",
        progressColor: "#0070FF",
        height: 80,
      });
      await ws.load(editablePreset.soundFileUrl);
      if (isCancelled) {
        ws.destroy();
        return;
      }
      ws.on("play", () => setIsPlaying(true));
      ws.on("pause", () => setIsPlaying(false));
      setWave(ws);

      // Saved/Created flags
      const savedRes = await fetch(
        `${BACKEND_URL}/saved-items/check-saved/${user?._id}/Preset/${editablePreset._id}`,
      );
      const isSaved = await savedRes.json();
      setShowIsSaved(isSaved);
      if (editablePreset.authorId === user?._id) setShowIsCreated(true);
    };
    initWave();

    return () => {
      isCancelled = true;
      ws?.destroy();
    };
  }, [
    editablePreset.soundFileUrl,
    user?._id,
    editablePreset._id,
    editablePreset.authorId,
  ]);

  const handlePlayPause = () => wave?.playPause();

  const handleLoudnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setLoudness(volume);
    wave?.setVolume(volume);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditablePreset({ ...editablePreset, [name]: value });
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  return (
    <div className="bg-zinc-900 rounded-xl p-6 mb-8 shadow-lg border border-zinc-700 text-white space-y-4">
      {/* Editable Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {["name", "vst", "genres", "types"].map((field) => (
          <div key={field} className="relative">
            <input
              type="text"
              name={field}
              value={(editablePreset as any)[field] || ""}
              onChange={handleFormChange}
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

      {/* Waveform + Controls */}
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
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap justify-start gap-3 pt-2">
        {!showIsSaved ? (
          <button
            onClick={async () => {
              const saveDto = {
                userId: user._id,
                itemType: "Preset",
                itemId: editablePreset._id,
              };
              await fetch(`${BACKEND_URL}/users/save-item`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(saveDto),
              });
              setShowIsSaved(true);
            }}
            className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500 transition"
          >
            Save
          </button>
        ) : (
          <button
            onClick={async () => {
              await fetch(`${BACKEND_URL}/users/delete-saved`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: user._id,
                  itemType: "Preset",
                  itemId: editablePreset._id,
                }),
              });
              setShowIsSaved(false);
            }}
            className="bg-cyan-500 px-4 py-2 rounded-lg hover:bg-cyan-400 transition"
          >
            Saved
          </button>
        )}

        {showIsCreated && (
          <>
            <span className="bg-violet-500 px-4 py-2 rounded-lg">
              Created By You
            </span>
            <button
              onClick={() => handleReplaceFile("preset")}
              className="bg-sky-600 px-4 py-2 rounded-lg hover:bg-sky-500 transition"
            >
              Replace Preset File
            </button>
            <button
              onClick={() => handleReplaceFile("sound")}
              className="bg-sky-600 px-4 py-2 rounded-lg hover:bg-sky-500 transition"
            >
              Replace Sound File
            </button>
            <button
              onClick={handleUpdatePreset}
              className="bg-cyan-500 px-4 py-2 rounded-lg hover:bg-cyan-400 transition"
            >
              Update
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500 transition"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

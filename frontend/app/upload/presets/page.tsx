/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Header from "@/app/components/header";
import { BACKEND_URL } from "@/app/constants";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UploadPresetPage() {
  const { user, loading: loadingUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loadingUser && !user) router.push("/login");
  }, [loadingUser, user, router]);

  const [formData, setFormData] = useState({
    name: "",
    vst: "",
    genres: "",
    types: "",
  });
  const [presetFile, setPresetFile] = useState<File | null>(null);
  const [soundFile, setSoundFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;

    if (name === "presetFile") setPresetFile(files[0]);
    if (name === "soundFile") setSoundFile(files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in.");
    if (!presetFile || !soundFile)
      return alert("Please select both preset and sound files.");

    try {
      setUploading(true);
      setError("");
      setUploadSuccess(false);

      const data = new FormData();
      data.append("presetFile", presetFile);
      data.append("soundFile", soundFile);
      data.append("name", formData.name);
      data.append("vst", formData.vst);
      data.append("genres", formData.genres);
      data.append("types", formData.types);
      data.append("authorId", user._id);

      const res = await fetch(`${BACKEND_URL}/presets/upload`, {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Failed to upload preset");

      const result = await res.json();
      //console.log("Upload result:", result);
      setUploadSuccess(true);
      setFormData({ name: "", vst: "", genres: "", types: "" });
      setPresetFile(null);
      setSoundFile(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error uploading preset");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Header activeTop="Upload" activeBottom="Presets" />
      <main className="bg-[#333333] py-20 px-3 min-h-screen">
        <h1 className="text-3xl font-semibold mb-8">Upload a New Preset</h1>

        <form
          onSubmit={handleSubmit}
          className="max-w-2xl space-y-6 bg-zinc-900 p-8 rounded-xl shadow-lg border border-gray-700"
        >
          {["name", "vst", "genres", "types"].map((field) => (
            <div key={field} className="relative">
              <input
                type="text"
                id={field}
                name={field}
                value={formData[field as keyof typeof formData]}
                placeholder=" "
                onChange={handleChange}
                className="bg-zinc-800 w-full text-lg peer rounded-lg border border-gray-400 px-3 pt-5 pb-2 text-white placeholder-transparent focus:border-cyan-400 focus:ring focus:ring-blue-200"
              />
              <label
                htmlFor={field}
                className="absolute left-3 top-2 text-cyan-400 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-300 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-sm peer-focus:text-sky-400"
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
            </div>
          ))}

          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-cyan-400">Preset File</label>
              <input
                type="file"
                name="presetFile"
                accept=".fxp,.preset,.zip,.txt,.json"
                onChange={handleFileChange}
                className="block w-full text-white bg-zinc-800 rounded-lg border border-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:text-white hover:file:bg-cyan-400"
              />
            </div>

            <div>
              <label className="block mb-2 text-cyan-400">Sound File</label>
              <input
                type="file"
                name="soundFile"
                accept=".mp3,.wav,.flac,.ogg"
                onChange={handleFileChange}
                className="block w-full text-white bg-zinc-800 rounded-lg border border-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:text-white hover:file:bg-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              uploading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-cyan-500 hover:bg-cyan-400"
            }`}
          >
            {uploading ? "Uploading..." : "Upload Preset"}
          </button>

          {uploadSuccess && (
            <p className="text-green-400 font-medium text-center">
              Preset uploaded successfully!
            </p>
          )}
          {error && <p className="text-red-500 text-center">{error}</p>}
        </form>
      </main>
    </>
  );
}

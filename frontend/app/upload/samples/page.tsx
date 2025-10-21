"use client";
import Header from "@/app/components/header";
import { BACKEND_URL } from "@/app/constants";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UploadSamplePage() {
  const { user, loading: loadingUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loadingUser && !user) router.push("/login");
  }, [loadingUser, user, router]);

  const [fileEnter, setFileEnter] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sampleUploadFormData, setSampleUploadFormData] = useState({
    name: "",
    BPM: "",
    instruments: "",
    genres: "",
    key: "",
  });

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSampleUploadFormData({
      ...sampleUploadFormData,
      [name]: value,
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFileEnter(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file) setSelectedFile(file);
  };

  const handleSampleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", sampleUploadFormData.name);
      formData.append("BPM", sampleUploadFormData.BPM);
      formData.append("instruments", sampleUploadFormData.instruments);
      formData.append("genres", sampleUploadFormData.genres);
      formData.append("key", sampleUploadFormData.key);
      formData.append("authorId", user?._id ?? "");

      const res = await fetch(`${BACKEND_URL}/samples/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to upload sample");

      alert("Sample uploaded successfully!");
      router.push("/explore/samples"); // redirect after upload
    } catch (err) {
      console.error("Sample upload error:", err);
      alert("Failed to upload sample.");
    }
  };

  return (
    <>
      <Header activeTop="Upload" activeBottom="Samples" />
      <main className="bg-[#333333] py-20 px-3">
        <h1 className="py-5 text-3xl">Upload New Sample</h1>
        <form
          onSubmit={handleSampleUpload}
          className="relative space-y-6 max-w-4xl mx-auto"
        >
          {[
            { label: "Title", name: "name", type: "text" },
            { label: "BPM", name: "BPM", type: "number" },
            { label: "Key", name: "key", type: "text" },
            { label: "Genres", name: "genres", type: "text" },
            { label: "Instruments", name: "instruments", type: "text" },
          ].map((field) => (
            <div key={field.name} className="relative">
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={
                  sampleUploadFormData[
                    field.name as keyof typeof sampleUploadFormData
                  ]
                }
                placeholder=" "
                onChange={handleFormDataChange}
                className="bg-zinc-800 w-full h-16 text-xl peer rounded-lg border border-gray-300 px-3 pt-5 text-shadow-white placeholder-transparent focus:border-cyan-400 focus:ring focus:ring-blue-200"
              />
              <label
                htmlFor={field.name}
                className="absolute left-3 top-1 text-cyan-400 text-xl transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-200 peer-placeholder-shown:text-xl peer-focus:top-1 peer-focus:text-xl peer-focus:text-blue-600"
              >
                {field.label}
              </label>
            </div>
          ))}

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setFileEnter(true);
            }}
            onDragLeave={() => setFileEnter(false)}
            onDrop={handleDrop}
            className={`${
              fileEnter
                ? "border-4 border-cyan-400"
                : "border-2 border-zinc-600"
            } mx-auto bg-zinc-800 text-white flex flex-col w-full h-20 justify-center items-center border-dashed rounded-md transition-colors`}
          >
            <label
              htmlFor="sample-file"
              className="h-full w-full flex flex-col justify-center items-center cursor-pointer text-sm"
            >
              {selectedFile
                ? selectedFile.name
                : "Click to upload or drag and drop"}
            </label>
            <input
              id="sample-file"
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-cyan-400 text-white font-suprapower font-semibold transition hover:text-[#343a40] hover:bg-sky-500"
          >
            Upload Sample
          </button>
        </form>
      </main>
    </>
  );
}

"use client";
import { useState } from "react";

interface UploadedFile {
  _id: string;
  name: string;
  url?: string;
  parent: string;
}

interface Folder {
  _id: string;
  name: string;
  parent?: string;
  children: Folder[];
  files: UploadedFile[];
}

export default function FileUpLoad({
  parentId,
  rootFolder,
  BACKEND_URL,
  updateFolderTree,
  addChildFile,
}: {
  parentId: string;
  rootFolder: Folder | null;
  BACKEND_URL: string;
  updateFolderTree: (updater: (folder: Folder | null) => Folder | null) => void;
  addChildFile: (
    folder: Folder | null,
    parentId: string,
    newFile: UploadedFile,
  ) => Folder | null;
}) {
  const [fileEnter, setFileEnter] = useState(false);

  // --- helper to compute nested folder path ---
  const getFullFolderPath = (
    folder: Folder | null,
    targetId: string,
    path: string[] = [],
  ): string[] | null => {
    if (!folder) return null;
    if (folder._id === targetId) return [...path, folder.name];
    for (const child of folder.children) {
      const found = getFullFolderPath(child, targetId, [...path, folder.name]);
      if (found) return found;
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    const pathParts = getFullFolderPath(rootFolder, parentId);
    if (!pathParts) {
      console.error("Folder path not found for parentId:", parentId);
      return;
    }

    const folderPath = `packs/${pathParts.join("/")}`;
    const fullKey = `${folderPath}/${file.name}`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", fullKey);
    formData.append("type", "pack");
    formData.append("parent", parentId);

    try {
      const res = await fetch(`${BACKEND_URL}/packs/add-file`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload file");
      const newFile = await res.json();
      updateFolderTree((prev) => addChildFile(prev, parentId, newFile));
    } catch (err) {
      console.error("File upload error:", err);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (const file of files) {
        await uploadFile(file);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFileEnter(false);

    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      await uploadFile(file);
    }
  };

  return (
    <div className="container px-4 max-w-6xl py-4 justify-center">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setFileEnter(true);
        }}
        onDragLeave={() => setFileEnter(false)}
        onDrop={handleDrop}
        className={`${
          fileEnter ? "border-4 border-cyan-400" : "border-2 border-zinc-600"
        } mx-auto bg-zinc-800 text-white flex flex-col w-full h-16 justify-center items-center border-dashed rounded-md transition-colors`}
      >
        <label
          htmlFor={`file-${parentId}`}
          className="h-full w-full flex flex-col justify-center items-center cursor-pointer text-sm"
        >
          Click to upload or drag and drop
        </label>
        <input
          id={`file-${parentId}`}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
}

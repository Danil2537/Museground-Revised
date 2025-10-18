/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { BACKEND_URL } from "@/app/constants";
import Header from "@/app/components/header";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/app/components/accordion";
import { useRouter } from "next/navigation";
import WaveSurfer from "wavesurfer.js";
import FileUpLoad from "@/app/components/fileUpload";

interface Folder {
  _id: string;
  name: string;
  parent?: string;
  children: Folder[];
  files: UploadedFile[];
}

interface UploadedFile {
  _id: string;
  name: string;
  url?: string;
  parent: string;
}

interface Pack {
  _id: string;
  name: string;
  rootFolder: string;
}

export default function UploadPackPage() {
  const { user, loading: loadingUser } = useAuth();
  const router = useRouter();
  const [packName, setPackName] = useState("");
  const [createdPack, setCreatedPack] = useState<Pack | null>(null);
  const [rootFolder, setRootFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDeletePack = async () => {
    if (!createdPack || !confirm(`Delete pack "${createdPack.name}"?`)) return;

    try {
      const res = await fetch(`${BACKEND_URL}/packs/delete-pack`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: createdPack._id }),
      });
      if (!res.ok) throw new Error("Failed to delete pack");
      setCreatedPack(null);
      setRootFolder(null);
      setPackName("");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error deleting pack");
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm("Delete this folder and all its contents?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/packs/delete-folder`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });
      if (!res.ok) throw new Error("Failed to delete folder");

      updateFolderTree((prev) => removeFolder(prev, folderId));
    } catch (err) {
      console.error("Error deleting folder:", err);
    }
  };

  const handleDeleteFile = async (fileId: string, parentId: string) => {
    if (!confirm("Delete this file?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/packs/delete-file`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });
      if (!res.ok) throw new Error("Failed to delete file");

      updateFolderTree((prev) => removeFile(prev, parentId, fileId));
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  };

  // Utility functions to remove items from state tree
  const removeFolder = (
    folder: Folder | null,
    folderId: string,
  ): Folder | null => {
    if (!folder) return null;
    if (folder._id === folderId) return null;
    const updatedChildren = folder.children
      .map((child) => removeFolder(child, folderId))
      .filter((child): child is Folder => child !== null);
    return { ...folder, children: updatedChildren };
  };

  const removeFile = (
    folder: Folder | null,
    parentId: string,
    fileId: string,
  ): Folder | null => {
    if (!folder) return null;
    if (folder._id === parentId) {
      return { ...folder, files: folder.files.filter((f) => f._id !== fileId) };
    }
    const updatedChildren = folder.children
      .map((child) => removeFile(child, parentId, fileId))
      .filter((child): child is Folder => child !== null);
    return { ...folder, children: updatedChildren };
  };

  useEffect(() => {
    if (!loadingUser && !user) router.push("/login");
  }, [loadingUser, user, router]);

  const handleCreatePack = async () => {
    if (!packName.trim()) {
      setError("Please enter a pack name.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/packs/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: packName, authorId: user?._id }),
      });
      if (!res.ok) throw new Error("Failed to create pack");
      const data = await res.json();
      setCreatedPack(data);
      setRootFolder({
        _id: data.rootFolder,
        name: packName,
        children: [],
        files: [],
      });
    } catch (err: any) {
      setError(err.message || "Error creating pack");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFolder = async (parentId: string) => {
    const name = prompt("Enter folder name:");
    if (!name) return;

    try {
      const res = await fetch(`${BACKEND_URL}/packs/add-folder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parent: parentId }),
      });
      if (!res.ok) throw new Error("Failed to create folder");
      const newFolder = await res.json();

      updateFolderTree((prev) =>
        addChildFolder(prev, parentId, {
          ...newFolder,
          children: [],
          files: [],
        }),
      );
    } catch (err) {
      console.error("Error adding folder:", err);
    }
  };

  const handleAddFile = async (parentId: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";

    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const getFullFolderPath = (
        folder: Folder | null,
        targetId: string,
        path: string[] = [],
      ): string[] | null => {
        if (!folder) return null;
        if (folder._id === targetId) return [...path, folder.name];
        for (const child of folder.children) {
          const found = getFullFolderPath(child, targetId, [
            ...path,
            folder.name,
          ]);
          if (found) return found;
        }
        return null;
      };

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

    input.click();
  };

  const updateFolderTree = (
    updater: (folder: Folder | null) => Folder | null,
  ) => setRootFolder((prev) => updater(prev));

  const addChildFolder = (
    folder: Folder | null,
    parentId: string,
    newFolder: Folder,
  ): Folder | null => {
    if (!folder) return null;
    if (folder._id === parentId)
      return { ...folder, children: [...folder.children, newFolder] };
    const updatedChildren = folder.children
      .map((child) => addChildFolder(child, parentId, newFolder))
      .filter((child): child is Folder => child !== null);
    return { ...folder, children: updatedChildren };
  };

  const addChildFile = (
    folder: Folder | null,
    parentId: string,
    newFile: UploadedFile,
  ): Folder | null => {
    if (!folder) return null;
    if (folder._id === parentId)
      return { ...folder, files: [...folder.files, newFile] };
    const updatedChildren = folder.children
      .map((child) => addChildFile(child, parentId, newFile))
      .filter((child): child is Folder => child !== null);
    return { ...folder, children: updatedChildren };
  };

  return (
    <>
      <Header activeTop="Upload" activeBottom="Packs" />

      <main className="bg-[#333333] py-20 px-3 text-gray-100">
        <h1 className="text-3xl mb-6">Upload New Pack</h1>

        {!createdPack ? (
          <div className="space-y-4 max-w-lg">
            <button
              onClick={handleDeletePack}
              className="mt-4 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
            >
              Delete Pack
            </button>
            <input
              type="text"
              value={packName}
              onChange={(e) => setPackName(e.target.value)}
              placeholder="Pack name"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-lg focus:ring focus:ring-cyan-400"
            />
            <button
              onClick={handleCreatePack}
              disabled={loading}
              className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-semibold py-2 rounded-lg transition"
            >
              {loading ? "Creating..." : "Create Pack"}
            </button>
            {error && <p className="text-red-500">{error}</p>}
          </div>
        ) : (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-3">{createdPack.name}</h2>
            {rootFolder && (
              <Accordion type="multiple" className="space-y-2">
                <FolderSection
                  folder={rootFolder}
                  rootFolder={rootFolder}
                  onAddFolder={handleAddFolder}
                  onAddFile={handleAddFile}
                  onDeleteFolder={handleDeleteFolder}
                  onDeleteFile={handleDeleteFile}
                  updateFolderTree={updateFolderTree}
                  addChildFile={addChildFile}
                />
              </Accordion>
            )}
          </div>
        )}
      </main>
    </>
  );
}

function FolderSection({
  folder,
  rootFolder,
  onAddFolder,
  onAddFile,
  onDeleteFolder,
  onDeleteFile,
  updateFolderTree,
  addChildFile,
}: {
  folder: Folder;
  rootFolder: Folder;
  onAddFolder: (id: string) => void;
  onAddFile: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteFile: (fileId: string, parentId: string) => void;
  updateFolderTree: (updater: (folder: Folder | null) => Folder | null) => void;
  addChildFile: (
    folder: Folder | null,
    parentId: string,
    newFile: UploadedFile,
  ) => Folder | null;
}) {
  return (
    <AccordionItem value={folder._id}>
      <AccordionTrigger value={folder._id} className="text-cyan-400">
        <div className="flex justify-between w-full items-center">
          <span>{folder.name}</span>
          <div className="space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddFolder(folder._id);
              }}
              className="px-2 py-1 text-xs bg-zinc-700 rounded hover:bg-zinc-600"
            >
              Add Folder
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddFile(folder._id);
              }}
              className="px-2 py-1 text-xs bg-zinc-700 rounded hover:bg-zinc-600"
            >
              Add File
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFolder(folder._id);
              }}
              className="px-2 py-1 text-xs bg-red-600 rounded hover:bg-red-700 text-white"
            >
              Delete Folder
            </button>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent value={folder._id}>
        <FileUpLoad
          parentId={folder._id}
          rootFolder={rootFolder}
          BACKEND_URL={BACKEND_URL}
          updateFolderTree={updateFolderTree}
          addChildFile={addChildFile}
        />

        <div className="ml-4 space-y-3">
          {folder.files.map((file) => (
            <WaveformFile
              key={file._id}
              file={file}
              onDeleteFile={onDeleteFile}
            />
          ))}

          {folder.children.length > 0 && (
            <Accordion type="multiple" className="space-y-2">
              {folder.children.map((child) => (
                <FolderSection
                  key={child._id}
                  folder={child}
                  rootFolder={rootFolder}
                  onAddFolder={onAddFolder}
                  onAddFile={onAddFile}
                  onDeleteFolder={onDeleteFolder}
                  onDeleteFile={onDeleteFile}
                  updateFolderTree={updateFolderTree}
                  addChildFile={addChildFile}
                />
              ))}
            </Accordion>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function WaveformFile({
  file,
  onDeleteFile,
}: {
  file: UploadedFile;
  onDeleteFile: (fileId: string, parentId: string) => void;
}) {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const [wave, setWave] = useState<WaveSurfer | null>(null);

  useEffect(() => {
    if (!waveformRef.current) return;
    let ws: WaveSurfer | null = null;
    let cancelled = false;

    const init = async () => {
      try {
        ws = WaveSurfer.create({
          container: waveformRef.current!,
          waveColor: "#00F0FF",
          progressColor: "#0070FF",
          height: 64,
          barWidth: 2,
          cursorWidth: 0,
        });

        await ws.load(file.url ?? "failed to get file url for waveform");
        if (cancelled) {
          ws.destroy();
          return;
        }

        setWave(ws);
      } catch (err) {
        console.error("WaveSurfer init error:", err);
      }
    };

    init();
    return () => {
      cancelled = true;
      ws?.destroy();
    };
  }, [file.url]);

  const handleClick = () => {
    if (wave) {
      wave.stop(); // always play from start
      wave.play();
    }
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-3 cursor-pointer hover:bg-zinc-700 transition">
      <span className="text-sm text-gray-300 truncate block mb-2">
        {file.name.split("/").pop()}
      </span>
      <div
        ref={waveformRef}
        onClick={handleClick}
        className="h-16 rounded-md overflow-hidden"
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteFile(file._id, file.parent);
        }}
        className="px-2 py-1 text-xs bg-red-600 rounded hover:bg-red-700 text-white"
      >
        Delete
      </button>
    </div>
  );
}

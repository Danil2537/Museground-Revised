/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { BACKEND_URL } from "@/app/constants";
import { Accordion } from "@/app/components/accordion";
import FolderSection from "@/app/components/FolderSection";

export interface Folder {
  _id: string;
  name: string;
  parent?: string;
  children: Folder[];
  files: UploadedFile[];
}

export interface UploadedFile {
  _id: string;
  name: string;
  url?: string;
  parent: string;
}

export interface Pack {
  _id: string;
  name: string;
  rootFolder: string;
}

interface EditablePackProps {
  pack: Pack;
  initialRoot: Folder;
  onDeletePack?: (packId: string) => void;
}

export default function EditablePack({
  pack,
  initialRoot,
  onDeletePack,
}: EditablePackProps) {
  const [rootFolder, setRootFolder] = useState<Folder | null>(initialRoot);

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
    if (folder._id === parentId)
      return { ...folder, files: folder.files.filter((f) => f._id !== fileId) };
    const updatedChildren = folder.children
      .map((child) => removeFile(child, parentId, fileId))
      .filter((child): child is Folder => child !== null);
    return { ...folder, children: updatedChildren };
  };

  // ---- API ACTIONS ----

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

  // ---- RENDER ----
  if (!rootFolder) return <p>Loading folder structure...</p>;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-3">{pack.name}</h2>
      {onDeletePack && (
        <button
          onClick={() => onDeletePack(pack._id)}
          className="px-3 py-1 text-xs bg-red-600 rounded hover:bg-red-700 text-white"
        >
          Delete Pack
        </button>
      )}
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
    </div>
  );
}

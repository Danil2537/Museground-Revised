/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/header";
import { useAuth } from "../context/AuthContext";
import { BACKEND_URL } from "../constants";
import { get, set } from "idb-keyval";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [folderHandle, setFolderHandle] =
    useState<FileSystemDirectoryHandle | null>(null);
  const [folderName, setFolderName] = useState<string>("");

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Load stored folder handle from IndexedDB
  useEffect(() => {
    const loadFolderHandle = async () => {
      try {
        const savedHandle = await get("downloadFolderHandle");
        if (savedHandle) {
          const permission = await savedHandle.queryPermission({
            mode: "readwrite",
          });
          if (permission === "granted") {
            setFolderHandle(savedHandle);
            setFolderName(savedHandle.name);
          }
        }
      } catch (err) {
        console.error("Error restoring folder handle:", err);
      }
    };
    loadFolderHandle();
  }, []);

  const handleChooseFolder = async () => {
    try {
      const handle = await (window as any).showDirectoryPicker();
      const permission = await handle.requestPermission({ mode: "readwrite" });
      if (permission === "granted") {
        await set("downloadFolderHandle", handle);
        setFolderHandle(handle);
        setFolderName(handle.name);
      }
    } catch (err) {
      console.error("Folder selection canceled or failed:", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  return (
    <>
      <Header activeTop="Profile" />
      <div className="pt-20 px-4 text-gray-200 space-y-4">
        <h1 className="text-xl font-semibold">Profile</h1>

        <div>
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>

        <div className="mt-6 space-y-2">
          <h2 className="text-lg font-medium">Download Folder</h2>

          {folderHandle ? (
            <p>
              Current folder: <strong>{folderName}</strong>
            </p>
          ) : (
            <p className="text-zinc-400">No folder chosen yet.</p>
          )}

          <button
            onClick={handleChooseFolder}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-md"
          >
            {folderHandle ? "Change Folder" : "Choose Folder"}
          </button>
        </div>

        <button
          onClick={async () => {
            await fetch(`${BACKEND_URL}/auth/logout`, {
              method: "POST",
              credentials: "include",
            });
            router.push("/login");
          }}
          className="mt-6 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md"
        >
          Logout
        </button>
      </div>
    </>
  );
}

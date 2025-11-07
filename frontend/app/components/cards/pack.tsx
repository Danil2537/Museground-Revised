/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { BACKEND_URL } from "@/app/constants";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/app/components/accordion";

interface FileItem {
  _id: string;
  name: string;
  url: string;
  parent: string;
}

interface Pack {
  _id: string;
  name: string;
  authorId: string;
  authorName?: string;
  imageUrl?: string;
  rootFolder: string;
}

interface PackCardProps {
  pack: Pack;
  onFilterClick?: (field: string, value: string) => void;
}

export default function PackCard({ pack, onFilterClick }: PackCardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [folderTree, setFolderTree] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showIsSaved, setShowIsSaved] = useState(false);
  const [showIsCreated, setShowIsCreated] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  // Fetch folders/files on mount
  useEffect(() => {
    const fetchFileStructure = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/packs/file-urls/${pack._id}`, {
          credentials: "include",
        });
        const data = await res.json();

        const folderMap = new Map<string, any>();
        data.fodlers?.forEach((f: any) =>
          folderMap.set(f._id, { ...f, files: [], children: [] }),
        );

        data.fodlers?.forEach((f: any) => {
          if (f.parent && folderMap.has(f.parent))
            folderMap.get(f.parent).children.push(folderMap.get(f._id));
        });

        data.files?.forEach((fileArr: FileItem[]) => {
          fileArr.forEach((file) => {
            if (file.parent && folderMap.has(file.parent))
              folderMap.get(file.parent).files.push(file);
          });
        });

        const root = Array.from(folderMap.values()).find(
          (f) => f.parent === pack.rootFolder || f._id === pack.rootFolder,
        );

        setFolderTree(root ?? null);

        const isSavedRes = await fetch(
          `${BACKEND_URL}/saved-items/check-saved/${user?._id}/Pack/${pack._id}`,
        );
        const isSaved = await isSavedRes.json();
        setShowIsSaved(isSaved);
        if (pack.authorId == user?._id) {
          setShowIsCreated(true);
        }
      } catch (err) {
        console.error("Error fetching pack file structure:", err);
      }
    };

    fetchFileStructure();
  }, [pack._id, pack.authorId, pack.rootFolder, user?._id]);

  const handleSavePack = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/users/save-item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          itemType: "Pack",
          itemId: pack._id,
        }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to save pack");

      //alert("Pack saved successfully!");
      setShowIsSaved(true);
    } catch (err) {
      console.error("Save pack error:", err);
      alert("Failed to save pack.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPack = async () => {
    if (!folderTree) return;
    setDownloading(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/packs/download-folder/${folderTree._id}`,
        {
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Failed to download pack");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${pack.name}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download pack.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteSave = async () => {
    if (!user) return;
    const res = await fetch(`${BACKEND_URL}/users/delete-saved`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user._id,
        itemType: "Pack",
        itemId: pack._id,
      }),
    });
    if (res.ok) {
      //alert("Un-saved succesfully!");
      setShowIsSaved(false);
    }
  };
  const handleDeletePack = async () => {
    if (!confirm("Delete this pack and all its contents?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/packs/delete-pack`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: pack._id }),
      });
      setShowIsCreated(false);
      if (!res.ok) throw new Error("Failed to delete pack");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  return (
    <div className="bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 hover:border-cyan-400 transition-colors p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-100 truncate">
          {pack.name}
        </h2>
        <button
          onClick={() =>
            onFilterClick?.("author", pack.authorName ?? pack.authorId)
          }
          className="text-cyan-400 hover:underline"
        >
          @{pack.authorName ?? pack.authorId}
        </button>
      </div>

      {folderTree ? (
        <Accordion type="multiple" className="mt-3 space-y-2">
          <FolderAccordion folder={folderTree} />
        </Accordion>
      ) : (
        <p className="text-gray-500 text-sm">No folders or files found.</p>
      )}

      <div className="flex flex-col gap-2 mt-3">
        {!showIsSaved && (
          <button
            onClick={handleSavePack}
            disabled={saving}
            className="w-full py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-500 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Pack"}
          </button>
        )}
        {showIsSaved && (
          <button
            onClick={handleDeleteSave}
            className="w-full py-2 rounded-lg text-center  bg-cyan-400 text-white font-semibold hover:bg-cyan-500 transition disabled:opacity-50"
          >
            Saved
          </button>
        )}
        {showIsCreated && (
          <div className="flex">
            <span className="w-1/2 py-2 rounded-lg text-center  bg-violet-400 text-white font-semibold  transition disabled:opacity-50">
              Created By You
            </span>
            <button
              onClick={handleDeletePack}
              className="w-1/2 py-2 rounded-lg text-center bg-red-500 text-white font-semibold hover:bg-red-600 transition disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        )}
        <button
          onClick={handleDownloadPack}
          disabled={downloading}
          className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition disabled:opacity-50"
        >
          {downloading ? "Downloading..." : "Download Pack"}
        </button>
      </div>
    </div>
  );
}

// Recursive folder renderer
function FolderAccordion({ folder }: { folder: any }) {
  return (
    <AccordionItem
      value={folder._id}
      className="border border-zinc-800 rounded-lg"
    >
      <AccordionTrigger
        value={folder._id}
        className="text-gray-100 hover:text-cyan-400"
      >
        {folder.name}
      </AccordionTrigger>
      <AccordionContent value={folder._id}>
        <div className="space-y-3 ml-4 max-h-[300px] overflow-y-auto pr-2">
          {folder.files.map((file: any) => (
            <FileWave key={file._id} file={file} />
          ))}

          {folder.children.length > 0 && (
            <Accordion type="multiple" className="space-y-2">
              {folder.children.map((child: any) => (
                <FolderAccordion key={child._id} folder={child} />
              ))}
            </Accordion>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function FileWave({ file }: { file: FileItem }) {
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

        await ws.load(file.url);
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
    <div
      className="bg-zinc-800 rounded-lg p-3 cursor-pointer hover:bg-zinc-700 transition"
      onClick={handleClick}
    >
      <span className="text-sm text-gray-300 truncate block mb-2">
        {file.name.split("/").pop()}
      </span>
      <div ref={waveformRef} className="h-16 rounded-md overflow-hidden" />
    </div>
  );
}

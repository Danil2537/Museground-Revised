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

interface FolderItem {
  _id: string;
  name: string;
  parent?: string;
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

        // Map backend folders/files into tree structure
        const folderMap = new Map<string, any>();
        data.fodlers?.forEach((f: FolderItem) =>
          folderMap.set(f._id, { ...f, files: [], children: [] }),
        );

        // Build folder hierarchy
        data.fodlers?.forEach((f: FolderItem) => {
          if (f.parent && folderMap.has(f.parent))
            folderMap.get(f.parent).children.push(folderMap.get(f._id));
        });

        // Attach files
        data.files?.forEach((fileArr: FileItem[]) => {
          fileArr.forEach((file) => {
            if (file.parent && folderMap.has(file.parent))
              folderMap.get(file.parent).files.push(file);
          });
        });

        // Find root
        const root = Array.from(folderMap.values()).find(
          (f) => f.parent === pack.rootFolder || f._id === pack.rootFolder,
        );

        setFolderTree(root ?? null);
      } catch (err) {
        console.error("Error fetching pack file structure:", err);
      }
    };

    fetchFileStructure();
  }, [pack._id, pack.rootFolder]);

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
        <div className="space-y-3 ml-4">
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

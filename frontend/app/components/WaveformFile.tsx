import { useRef, useState, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import { BACKEND_URL } from "../constants";
import { get } from "idb-keyval";

interface UploadedFile {
  _id: string;
  name: string;
  url?: string;
  parent: string;
}

export default function WaveformFile({
  file,
  onDeleteFile,
}: {
  file: UploadedFile;
  onDeleteFile: (fileId: string, parentId: string) => void;
}) {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const [wave, setWave] = useState<WaveSurfer | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Load waveform
  useEffect(() => {
    if (!waveformRef.current || !file.url) return;
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
        await ws.load(file.url ?? "");
        if (cancelled) ws.destroy();
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

  // Preload blob for drag-out and folder download
  useEffect(() => {
    const preload = async () => {
      if (!file.url) return;
      try {
        const response = await fetch(file.url);
        const blob = await response.blob();
        const blobURL = URL.createObjectURL(blob);
        setBlobUrl(blobURL);
      } catch (err) {
        console.error("Failed to preload file blob:", err);
      }
    };
    preload();
  }, [file.url]);

  const handleClick = () => {
    if (wave) {
      wave.stop();
      wave.play();
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!blobUrl || !file.name) return;
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("DownloadURL", `audio:${file.name}:${blobUrl}`);
  };

  const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      // Fetch file from backend
      const res = await fetch(
        `${BACKEND_URL}/packs/download-file/${file._id}`,
        {
          method: "GET",
        },
      );
      if (!res.ok) throw new Error("Failed to download file");

      const blob = await res.blob();
      const filename = file.name.split("/").pop() || "file";

      // Try to get saved folder handle
      const folderHandle: FileSystemDirectoryHandle | null | undefined =
        await get("downloadFolderHandle");

      if (folderHandle) {
        // Save file to persistent folder
        const fileHandle = await folderHandle.getFileHandle(filename, {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        //console.log(`Saved ${filename} to persistent folder`);
      } else {
        // Fallback: browser download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  return (
    <div
      className="bg-zinc-800 rounded-lg p-3 hover:bg-zinc-700 transition"
      draggable
      onDragStart={handleDragStart}
    >
      <span
        className="text-sm text-gray-300 truncate block mb-2 cursor-pointer"
        onClick={handleClick}
      >
        {file.name.split("/").pop()}
      </span>
      <div
        ref={waveformRef}
        onClick={handleClick}
        className="h-16 rounded-md overflow-hidden cursor-pointer mb-2"
      />
      <div className="flex space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteFile(file._id, file.parent);
          }}
          className="px-2 py-1 text-xs bg-red-600 rounded hover:bg-red-700 text-white"
        >
          Delete
        </button>
        <button
          onClick={handleDownload}
          className="px-2 py-1 text-xs bg-green-600 rounded hover:bg-green-700 text-white"
        >
          Download
        </button>
      </div>
    </div>
  );
}

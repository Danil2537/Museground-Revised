/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import EditablePack, {
  Folder,
  Pack,
} from "@/app/components/cards/EditablePack";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { BACKEND_URL } from "@/app/constants";
import Header from "@/app/components/header";
import { useRouter } from "next/navigation";

export default function UploadPackPage() {
  const { user, loading: loadingUser } = useAuth();
  const router = useRouter();
  const [packName, setPackName] = useState("");
  const [createdPack, setCreatedPack] = useState<Pack | null>(null);
  const [rootFolder, setRootFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <>
      <Header activeTop="Upload" activeBottom="Packs" />
      <main className="bg-[#333333] py-20 px-3 text-gray-100">
        <h1 className="text-3xl mb-6">Upload New Pack</h1>

        {!createdPack ? (
          <div className="space-y-4 max-w-lg">
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
          rootFolder && (
            <EditablePack pack={createdPack} initialRoot={rootFolder} />
          )
        )}
      </main>
    </>
  );
}

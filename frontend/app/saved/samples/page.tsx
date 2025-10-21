"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import SampleCard from "@/app/components/cards/sample";
import Header from "@/app/components/header";
import { BACKEND_URL } from "@/app/constants";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SavedSamplesPage() {
  const [savedSamples, setSavedSamples] = useState([]);
  const { user, loading: loadingUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loadingUser && !user) {
      router.push("/login");
      return;
    }

    const getSavedSamples = async () => {
      if (!user?._id) return;
      try {
        const url = `${BACKEND_URL}/saved-items/get-saved/${user._id}/Sample`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch saved samples");

        const savedSamplesData = await res.json();
        setSavedSamples(savedSamplesData || []);
      } catch (err) {
        console.error(err);
      }
    };

    if (user) getSavedSamples();
  }, [loadingUser, user, router]);

  return (
    <>
      <Header activeTop="Saved" activeBottom="Samples" />
      <main className="bg-[#333333] py-20 px-3 min-h-screen">
        <h1 className="py-5 text-3xl">Saved Samples</h1>

        {savedSamples.length > 0 ? (
          <div className="mt-10 overflow-x-auto rounded-xl border border-gray-700 bg-zinc-900 shadow-lg">
            <table className="min-w-full text-gray-200">
              <thead className="bg-zinc-800 text-cyan-400">
                <tr>
                  <th className="px-4 py-3">Play</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Waveform</th>
                  <th className="px-4 py-3">Volume</th>
                  <th className="px-4 py-3">Pitch</th>
                  <th className="px-4 py-3">Key</th>
                  <th className="px-4 py-3">BPM</th>
                  <th className="px-4 py-3">Genres</th>
                  <th className="px-4 py-3">Instruments</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedSamples.map((sample: any) => (
                  <SampleCard key={sample._id} sample={sample} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-6 text-gray-400">No saved samples yet.</p>
        )}
      </main>
    </>
  );
}

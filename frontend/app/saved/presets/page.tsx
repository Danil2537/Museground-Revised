"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import PresetCard from "@/app/components/cards/preset";
import Header from "@/app/components/header";
import { BACKEND_URL } from "@/app/constants";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SavedPresetsPage() {
  const [savedPresets, setSavedPresets] = useState([]);
  const { user, loading: loadingUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loadingUser && !user) {
      router.push("/login");
      return;
    }

    const getSavedPresets = async () => {
      if (!user?._id) return;
      try {
        const url = `${BACKEND_URL}/saved-items/get-saved/${user._id}/Preset`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch saved presets");

        const savedPresetsData = await res.json();
        setSavedPresets(savedPresetsData || []);
      } catch (err) {
        console.error(err);
      }
    };

    if (user) getSavedPresets();
  }, [loadingUser, user, router]);

  return (
    <>
      <Header activeTop="Saved" activeBottom="Presets" />
      <main className="bg-[#333333] py-20 px-3 min-h-screen">
        <h1 className="py-5 text-3xl">Saved Presets</h1>

        {savedPresets.length > 0 ? (
          <div className="mt-10 overflow-x-auto rounded-xl border border-gray-700 bg-zinc-900 shadow-lg">
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedPresets.map((preset: any) => (
                <PresetCard key={preset._id} preset={preset} />
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-6 text-gray-400">No saved presets yet.</p>
        )}
      </main>
    </>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { BACKEND_URL } from "@/app/constants";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header";
import EditablePresetCard from "@/app/components/cards/EditablePreset";

export default function CreatedPresetsPage() {
  const { user, loading: loadingUser } = useAuth();
  const router = useRouter();
  const [presets, setPresets] = useState<any[]>([]);

  useEffect(() => {
    if (!loadingUser && !user) router.push("/login");
  }, [loadingUser, user, router]);

  useEffect(() => {
    const loadPresets = async () => {
      if (!user) return;
      try {
        const res = await fetch(
          `${BACKEND_URL}/presets/created-by-user/${user._id}`,
        );
        if (!res.ok) throw new Error("Failed to fetch presets");
        const data = await res.json();
        setPresets(data);
      } catch (err) {
        console.error("Error loading presets:", err);
        setPresets([]);
      }
    };

    if (!loadingUser && user) loadPresets();
  }, [loadingUser, user]);

  return (
    <>
      <Header activeTop="Created" activeBottom="Presets" />
      <main className="bg-[#333333] py-20 px-3 text-white">
        <h1 className="py-5 text-3xl">Presets You Created</h1>
        {presets.length === 0 ? (
          <p>No presets found.</p>
        ) : (
          <ul className="w-full text-left text-gray-200">
            {presets.map((preset) => (
              <EditablePresetCard key={preset._id} preset={preset} />
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

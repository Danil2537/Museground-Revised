/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { BACKEND_URL } from "@/app/constants";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header";
import EditableSampleCard from "@/app/components/cards/EditableSample";

export default function CreatedSamplesPage() {
  const { user, loading: loadingUser } = useAuth();
  const router = useRouter();
  const [samples, setSamples] = useState<any[]>([]);

  useEffect(() => {
    if (!loadingUser && !user) router.push("/login");
  }, [loadingUser, user, router]);

  const loadSamples = async () => {
    if (!user) return;
    try {
      const res = await fetch(
        `${BACKEND_URL}/samples/created-by-user/${user._id}`,
      );
      if (!res.ok) throw new Error("Failed to fetch samples");
      const data = await res.json();
      setSamples(data);
    } catch (err) {
      console.error("Error loading samples:", err);
      setSamples([]);
    }
  };

  useEffect(() => {
    if (!loadingUser && user) loadSamples();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingUser, user]);

  return (
    <>
      <Header activeTop="Created" activeBottom="Samples" />
      <main className="bg-[#333333] py-20 px-3 text-white">
        <h1 className="py-5 text-3xl">Samples You Created</h1>
        {samples.length === 0 ? (
          <p>No samples found.</p>
        ) : (
          <ul className="w-full text-left text-gray-200">
            {samples.map((sample) => (
              <EditableSampleCard key={sample._id} sample={sample} />
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import PackCard from "@/app/components/cards/pack";
import Header from "@/app/components/header";
import { BACKEND_URL } from "@/app/constants";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SavedPacksPage() {
  const [savedPacks, setSavedPacks] = useState([]);
  const { user, loading: loadingUser } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loadingUser && !user) router.push("/login");
    if (user) {
      const getSavedPacks = async () => {
        if (!user?._id) return;
        try {
          const url = `${BACKEND_URL}/saved-items/get-saved/${user._id}/Pack`;
          const res = await fetch(url);
          const savedPacksData = await res.json();
          alert(JSON.stringify(savedPacksData));
          if (!res.ok) throw new Error("Failed to fetch saved packs");
          setSavedPacks(savedPacksData || []);
        } catch (err) {
          console.error(err);
        }
      };
      getSavedPacks();
    }
  }, [loadingUser, user, router]);
  return (
    <>
      <Header activeTop="Saved" activeBottom="Packs" />
      {savedPacks.length > 0 && (
        <div className="mt-10 overflow-x-auto rounded-xl border border-gray-700 bg-zinc-900 shadow-lg">
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPacks.map((pack: any) => (
              <PackCard key={pack._id} pack={pack} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

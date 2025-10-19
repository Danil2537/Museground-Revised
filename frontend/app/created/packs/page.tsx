/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import EditablePack from "@/app/components/EditablePack";
import Header from "@/app/components/header";
import { BACKEND_URL } from "@/app/constants";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreatedPacksPage() {
  const { user, loading: loadingUser } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loadingUser && !user) router.push("/login");
  }, [loadingUser, user, router]);

  const [createdPacks, setCreatedPacks] = useState<unknown[]>([]);
  const findCreatedPacks = async () => {
    if (!user) return;

    try {
      const res = await fetch(
        `${BACKEND_URL}/packs/user-created-packs-full/${user._id}`,
      );
      const data = await res.json();
      setCreatedPacks(data);
    } catch (err) {
      console.error(err);
      setCreatedPacks([]);
    }
  };
  useEffect(() => {
    if (!loadingUser && user) {
      findCreatedPacks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingUser, user]);

  return (
    <>
      <Header activeTop="Created" activeBottom="Packs" />
      <main className="bg-[#333333] py-20 px-3">
        <h1 className="py-5 text-3xl">Packs that you Created</h1>
        {createdPacks.length > 0 && (
          <div className="mt-10 overflow-x-auto rounded-xl border border-gray-700 bg-zinc-900 shadow-lg">
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {createdPacks.map((pack: any) => (
                <EditablePack
                  key={pack._id}
                  pack={pack}
                  initialRoot={pack.rootFolder}
                  onDeletePack={async (packId: string) => {
                    if (!confirm("Delete this pack and all its contents?"))
                      return;
                    try {
                      const res = await fetch(
                        `${BACKEND_URL}/packs/delete-pack`,
                        {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ packId }),
                        },
                      );
                      if (!res.ok) throw new Error("Failed to delete pack");
                      setCreatedPacks((prev) =>
                        prev.filter((p: any) => p._id !== packId),
                      );
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

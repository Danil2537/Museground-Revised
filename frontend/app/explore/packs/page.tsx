/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import PackCard from "@/app/components/cards/pack";
import Header from "@/app/components/header";
import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/app/constants";

export default function ExplorePacksPage() {
  const [packFilterFormData, setPackFilterFormData] = useState({
    name: "",
    author: "",
  });

  const [results, setResults] = useState<unknown[]>([]);
  const [error, setError] = useState("");
  //const [initialLoad, setInitialLoad] = useState(true);

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    setPackFilterFormData({
      ...packFilterFormData,
      [name]: type === "number" && value !== "" ? Number(value) : value,
    });
  };

  const handleFilterQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    //(e: FormEvent)
    //e.preventDefault(); // Prevent page reload
    //alert(JSON.stringify(packFilterFormData));
    // Only include non-empty or meaningful fields
    const filteredData: Record<string, string> = {};
    Object.entries(packFilterFormData).forEach(([key, value]) => {
      if (
        (typeof value === "string" && value.trim() !== "") ||
        (typeof value === "number" && !isNaN(value) && value !== 0)
      ) {
        filteredData[key] = value.toString();
      }
    });

    const queryString = new URLSearchParams(filteredData).toString();
    const url = `${BACKEND_URL}/packs/find/query?${queryString}`;
    //alert(url);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch packs");
      const data = await res.json();
      //alert(JSON.stringify(data));

      setResults(Array.isArray(data) ? data : (data.filterResult ?? []));
    } catch (err) {
      console.error(err);
      setError("Error fetching filtered packs");
    }
  };
  useEffect(() => {
    //if (initialLoad) {
    handleFilterQuery();
    //setInitialLoad(false);
    //}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Header activeTop="Explore" activeBottom="Packs" />
      <main className="bg-[#333333] py-20 px-3">
        <h1 className="py-5 text-3xl">Find Packs</h1>
        <form onSubmit={handleFilterQuery} className="relative space-y-6">
          <div key="name" className="relative">
            <input
              type="text"
              id="name"
              name="name"
              value={packFilterFormData.name}
              placeholder=" "
              onChange={handleFormDataChange}
              className="bg-zinc-800 w-full text-xl size-18
      peer rounded-lg border border-gray-300 px-3 pt-5  text-shadow-white
      placeholder-transparent focus:border-cyan-400 focus:ring focus:ring-blue-200"
            />
            <label
              htmlFor="name"
              className="absolute left-3 top-2 text-cyan-400 text-xl transition-all
      peer-placeholder-shown:top-5.5   peer-placeholder-shown:text-gray-200
      peer-placeholder-shown:text-xl peer-focus:top-1 peer-focus:text-xl
      peer-focus:text-sky-500"
            >
              Title
            </label>
          </div>

          <div key="author" className="relative">
            <input
              type="text"
              id="author"
              name="author"
              value={packFilterFormData.author}
              placeholder=" "
              onChange={handleFormDataChange}
              className="bg-zinc-800 w-full text-xl size-18
      peer rounded-lg border border-gray-300 px-3 pt-5  text-shadow-white
      placeholder-transparent focus:border-cyan-400 focus:ring focus:ring-blue-200"
            />
            <label
              htmlFor="author"
              className="absolute left-3 top-2 text-cyan-400 text-xl transition-all
      peer-placeholder-shown:top-5.5   peer-placeholder-shown:text-gray-200
      peer-placeholder-shown:text-xl peer-focus:top-1 peer-focus:text-xl
      peer-focus:text-sky-500"
            >
              Author
            </label>
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-cyan-400 text-white font-suprapower font-semibold transition hover:text-[#343a40] hover:bg-sky-500"
          >
            Search
          </button>
        </form>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        {results.length > 0 && (
          <div className="mt-10 overflow-x-auto rounded-xl border border-gray-700 bg-zinc-900 shadow-lg">
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((pack: any) => (
                <PackCard key={pack._id} pack={pack} />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

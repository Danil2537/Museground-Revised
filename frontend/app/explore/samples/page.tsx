/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import SampleCard from "@/app/components/cards/sample";
import Header from "@/app/components/header";
import { useState, FormEvent } from "react";
import { BACKEND_URL } from "@/app/constants";

export default function ExploreSamplesPage() {
  const [sampleFilterFormData, setSampleFilterFormData] = useState({
    name: "",
    author: "",
    minBPM: "",
    maxBPM: "",
    instruments: "",
    genres: "",
    key: "",
  });

  const [results, setResults] = useState<unknown[]>([]);
  const [error, setError] = useState("");

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    setSampleFilterFormData({
      ...sampleFilterFormData,
      [name]: type === "number" && value !== "" ? Number(value) : value,
    });
  };

  const handleFilterQuery = async (e: FormEvent) => {
    e.preventDefault(); // Prevent page reload
    alert(JSON.stringify(sampleFilterFormData));
    // Only include non-empty or meaningful fields
    const filteredData: Record<string, string> = {};
    Object.entries(sampleFilterFormData).forEach(([key, value]) => {
      if (
        (typeof value === "string" && value.trim() !== "") ||
        (typeof value === "number" && !isNaN(value) && value !== 0)
      ) {
        filteredData[key] = value.toString();
      }
    });

    const queryString = new URLSearchParams(filteredData).toString();
    const url = `${BACKEND_URL}/samples/filter/query?${queryString}`;
    alert(url);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch samples");
      const data = await res.json();
      alert(JSON.stringify(data));

      setResults(Array.isArray(data) ? data : (data.filterResult ?? []));
    } catch (err) {
      console.error(err);
      setError("Error fetching filtered samples");
    }
  };

  return (
    <>
      <Header activeTop="Explore" activeBottom="Samples" />
      <main className="bg-[#333333] py-20 px-3">
        <h1 className="py-5 text-3xl">Find Samples</h1>
        <form onSubmit={handleFilterQuery} className="relative space-y-6">
          <div key="name" className="relative">
            <input
              type="text"
              id="name"
              name="name"
              value={sampleFilterFormData.name}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { label: "Author", name: "author", type: "text" },
              { label: "Min BPM", name: "minBPM", type: "number" },
              { label: "Max BPM", name: "maxBPM", type: "number" },
              { label: "Instruments", name: "instruments", type: "text" },
              { label: "Genres", name: "genres", type: "text" },
              { label: "Key", name: "key", type: "text" },
            ].map((field) => (
              <div key={field.name} className="relative">
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={
                    sampleFilterFormData[
                      field.name as keyof typeof sampleFilterFormData
                    ]
                  }
                  placeholder=""
                  onChange={handleFormDataChange}
                  className="bg-zinc-800 w-full text-xl size-18
      peer rounded-lg border border-gray-300 px-3 pt-5  text-shadow-white
      placeholder-transparent focus:border-cyan-400 focus:ring focus:ring-blue-200"
                />
                <label
                  htmlFor={field.name}
                  className="absolute left-3 top-2 text-cyan-400 text-xl transition-all
      peer-placeholder-shown:top-5.5   peer-placeholder-shown:text-gray-200
      peer-placeholder-shown:text-xl peer-focus:top-1 peer-focus:text-xl
      peer-focus:text-blue-600"
                >
                  {field.label}
                </label>
              </div>
            ))}
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
            <table className="w-full text-left text-gray-200">
              <thead className="bg-zinc-800 text-cyan-400 uppercase text-sm tracking-wide">
                <tr>
                  <th className="px-4 py-3">Play / Pause</th>
                  <th className="px-4 py-3">Waveform</th>
                  <th className="px-4 py-3">Volume</th>
                  <th className="px-4 py-3">Pitch</th>
                  <th className="px-4 py-3">Key</th>
                  <th className="px-4 py-3">BPM</th>
                  <th className="px-4 py-3">Genres</th>
                  <th className="px-4 py-3">Instruments</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {results.map((sample: any) => (
                  <SampleCard key={sample._id} sample={sample} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}

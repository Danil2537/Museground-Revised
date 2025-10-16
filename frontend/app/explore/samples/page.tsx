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
    minBPM: 0,
    maxBPM: 0,
    instruments: "",
    genres: "",
    key: "",
  });

  const [results, setResults] = useState<unknown[]>([]);
  const [error, setError] = useState("");

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setSampleFilterFormData({
      ...sampleFilterFormData,
      [e.target.name]: value,
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

      // Backend returns { filterResult: [...], author: "..." }
      // So store only the sample array in `results`
      setResults(Array.isArray(data) ? data : (data.filterResult ?? []));
    } catch (err) {
      console.error(err);
      setError("Error fetching filtered samples");
    }
  };

  return (
    <>
      <Header activeTop="Explore" activeBottom="Samples" />
      <main className="pt-24 px-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Filter Samples</h1>
        <form onSubmit={handleFilterQuery} className="space-y-4">
          {[
            { label: "Title", name: "name", type: "text" },
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
                placeholder=" "
                onChange={handleFormDataChange}
                className="peer w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 placeholder-transparent focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              <label
                htmlFor={field.name}
                className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-600"
              >
                {field.label}
              </label>
            </div>
          ))}
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Search
          </button>
        </form>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        {results.length > 0 && (
          <div className="mt-6 space-y-4">
            <table>
              <thead>
                <tr>
                  <td>play/pause</td>
                  <td>soundwave</td>
                  <td>pitch up/down</td>
                  <td>key</td>
                  <td>BPM</td>
                  <td>genres</td>
                  <td>instruments</td>
                  <td>author</td>
                  <td>save</td>
                </tr>
              </thead>
              <tbody>
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

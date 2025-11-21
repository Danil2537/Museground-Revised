/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import SampleCard from "@/app/components/cards/sample";
import Header from "@/app/components/header";
import { useState, useEffect, useMemo } from "react";
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
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  //const [initialLoad, setInitialLoad] = useState(true);

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    setSampleFilterFormData({
      ...sampleFilterFormData,
      [name]: type === "number" && value !== "" ? Number(value) : value,
    });
  };

  //const sortedResults =
  //   setResults(
  //     sortConfig
  //       ? [...results].sort((a: any, b: any) => {
  //           if (!sortConfig) return 0;

  //           const { key, direction } = sortConfig;
  //           const aValue = a[key];
  //           const bValue = b[key];

  //           // Handle missing values safely
  //           if (aValue == null) return 1;
  //           if (bValue == null) return -1;

  //           // Handle numeric sort
  //           if (typeof aValue === "number" && typeof bValue === "number") {
  //             return direction === "asc" ? aValue - bValue : bValue - aValue;
  //           }

  //           // Fallback to string comparison
  //           const aStr = String(aValue).toLowerCase();
  //           const bStr = String(bValue).toLowerCase();

  //           if (aStr < bStr) return direction === "asc" ? -1 : 1;
  //           if (aStr > bStr) return direction === "asc" ? 1 : -1;
  //           return 0;
  //         })
  //       : results,
  //   );

  const sortedResults = useMemo(() => {
    if (!sortConfig) return results;

    const { key, direction } = sortConfig;
    return [...results].sort((a: any, b: any) => {
      const dir = direction === "asc" ? 1 : -1;
      return a[key] > b[key] ? dir : -dir;
    });
  }, [results, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        // toggle asc/desc
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const handleFilterQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    //(e: FormEvent)
    //e.preventDefault(); // Prevent page reload
    //alert(JSON.stringify(sampleFilterFormData));
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
    //alert(url);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch samples");
      const data = await res.json();
      //alert(JSON.stringify(data));

      setResults(Array.isArray(data) ? data : (data.filterResult ?? []));
    } catch (err) {
      console.error(err);
      setError("Error fetching filtered samples");
    }
  };
  const handleDeleteSampleFromList = (id: string) => {
    setResults((prev) => prev.filter((sample: any) => sample._id !== id));
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
                  className="absolute left-3 top-2 text-cyan-400 border-[#3b82f6] text-xl transition-all
      peer-placeholder-shown:top-5.5 peer-placeholder-shown:text-gray-200
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
                  {[
                    { label: "Title", key: "name" },
                    { label: "Key", key: "key" },
                    { label: "BPM", key: "BPM" },
                    { label: "Genres", key: "genres" },
                    { label: "Instruments", key: "instruments" },
                    { label: "Author", key: "authorName" },
                  ].map(({ label, key }) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      className="px-4 py-3 cursor-pointer select-none hover:text-white"
                    >
                      {label}
                      {sortConfig?.key === key && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </th>
                  ))}
                  <th className="px-4 py-3">Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sortedResults.map((sample: any) => (
                  <SampleCard
                    key={sample._id}
                    sample={sample}
                    onDelete={handleDeleteSampleFromList}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}

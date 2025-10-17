/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import PresetCard from "@/app/components/cards/preset";
import Header from "@/app/components/header";
import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/app/constants";

export default function ExplorePresetsPage() {
  const [presetFilterFormData, setPresetFilterFormData] = useState({
    name: "",
    author: "",
    fileUrl: "",
    soundFileUrl: "",
    vst: "",
    genres: "",
    types: "",
    fileId: "",
    soundFileId: "",
  });

  const [results, setResults] = useState<unknown[]>([]);
  const [error, setError] = useState("");
  //const [initialLoad, setInitialLoad] = useState(true);

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    setPresetFilterFormData({
      ...presetFilterFormData,
      [name]: type === "number" && value !== "" ? Number(value) : value,
    });
  };

  const handleFilterQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    //(e: FormEvent)
    //e.preventDefault(); // Prevent page reload
    alert(JSON.stringify(presetFilterFormData));
    // Only include non-empty or meaningful fields
    const filteredData: Record<string, string> = {};
    Object.entries(presetFilterFormData).forEach(([key, value]) => {
      if (
        (typeof value === "string" && value.trim() !== "") ||
        (typeof value === "number" && !isNaN(value) && value !== 0)
      ) {
        filteredData[key] = value.toString();
      }
    });

    const queryString = new URLSearchParams(filteredData).toString();
    const url = `${BACKEND_URL}/presets/filter/query?${queryString}`;
    alert(url);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch presets");
      const data = await res.json();
      alert(JSON.stringify(data));

      setResults(Array.isArray(data) ? data : (data.filterResult ?? []));
    } catch (err) {
      console.error(err);
      setError("Error fetching filtered presets");
    }
  };

  const handleFilterClick = (field: string, value: string) => {
    setPresetFilterFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Run query after React state updates
    // setTimeout(() => {
    //     handleFilterQuery();
    // }, 0);
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
      <Header activeTop="Explore" activeBottom="Presets" />
      <main className="bg-[#333333] py-20 px-3">
        <h1 className="py-5 text-3xl">Find Presets</h1>
        <form onSubmit={handleFilterQuery} className="relative space-y-6">
          <div key="name" className="relative">
            <input
              type="text"
              id="name"
              name="name"
              value={presetFilterFormData.name}
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

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-6">
            {[
              { label: "Author", name: "author", type: "text" },
              { label: "VST Plugin", name: "vst", type: "text" },
              { label: "Genres", name: "genres", type: "text" },
              { label: "Types", name: "types", type: "text" },
            ].map((field) => (
              <div key={field.name} className="relative">
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={
                    presetFilterFormData[
                      field.name as keyof typeof presetFilterFormData
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
            <div className="w-full text-left text-gray-200">
              <div className="divide-y divide-gray-700 grid grid-cols-3 gap-6">
                {results.map((preset: any) => (
                  <PresetCard
                    key={preset._id}
                    preset={preset}
                    onFilterClick={handleFilterClick}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

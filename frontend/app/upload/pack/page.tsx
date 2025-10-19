// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useState, useEffect } from "react";
// import { useAuth } from "@/app/context/AuthContext";
// import { BACKEND_URL } from "@/app/constants";
// import Header from "@/app/components/header";
// import { Accordion } from "@/app/components/accordion";
// import { useRouter } from "next/navigation";
// import FolderSection from "@/app/components/FolderSection";

// interface Folder {
//   _id: string;
//   name: string;
//   parent?: string;
//   children: Folder[];
//   files: UploadedFile[];
// }

// interface UploadedFile {
//   _id: string;
//   name: string;
//   url?: string;
//   parent: string;
// }

// interface Pack {
//   _id: string;
//   name: string;
//   rootFolder: string;
// }

// export default function UploadPackPage() {
//   const { user, loading: loadingUser } = useAuth();
//   const router = useRouter();
//   const [packName, setPackName] = useState("");
//   const [createdPack, setCreatedPack] = useState<Pack | null>(null);
//   const [rootFolder, setRootFolder] = useState<Folder | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleDeletePack = async () => {
//     if (!createdPack || !confirm(`Delete pack "${createdPack.name}"?`)) return;

//     try {
//       const res = await fetch(`${BACKEND_URL}/packs/delete-pack`, {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ packId: createdPack._id }),
//       });
//       if (!res.ok) throw new Error("Failed to delete pack");
//       setCreatedPack(null);
//       setRootFolder(null);
//       setPackName("");
//     } catch (err: any) {
//       console.error(err);
//       alert(err.message || "Error deleting pack");
//     }
//   };

//   const handleDeleteFolder = async (folderId: string) => {
//     if (!confirm("Delete this folder and all its contents?")) return;

//     try {
//       const res = await fetch(`${BACKEND_URL}/packs/delete-folder`, {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ folderId }),
//       });
//       if (!res.ok) throw new Error("Failed to delete folder");

//       updateFolderTree((prev) => removeFolder(prev, folderId));
//     } catch (err) {
//       console.error("Error deleting folder:", err);
//     }
//   };

//   const handleDeleteFile = async (fileId: string, parentId: string) => {
//     if (!confirm("Delete this file?")) return;

//     try {
//       const res = await fetch(`${BACKEND_URL}/packs/delete-file`, {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ fileId }),
//       });
//       if (!res.ok) throw new Error("Failed to delete file");

//       updateFolderTree((prev) => removeFile(prev, parentId, fileId));
//     } catch (err) {
//       console.error("Error deleting file:", err);
//     }
//   };

//   // Utility functions to remove items from state tree
//   const removeFolder = (
//     folder: Folder | null,
//     folderId: string,
//   ): Folder | null => {
//     if (!folder) return null;
//     if (folder._id === folderId) return null;
//     const updatedChildren = folder.children
//       .map((child) => removeFolder(child, folderId))
//       .filter((child): child is Folder => child !== null);
//     return { ...folder, children: updatedChildren };
//   };

//   const removeFile = (
//     folder: Folder | null,
//     parentId: string,
//     fileId: string,
//   ): Folder | null => {
//     if (!folder) return null;
//     if (folder._id === parentId) {
//       return { ...folder, files: folder.files.filter((f) => f._id !== fileId) };
//     }
//     const updatedChildren = folder.children
//       .map((child) => removeFile(child, parentId, fileId))
//       .filter((child): child is Folder => child !== null);
//     return { ...folder, children: updatedChildren };
//   };

//   useEffect(() => {
//     if (!loadingUser && !user) router.push("/login");
//   }, [loadingUser, user, router]);

//   const handleCreatePack = async () => {
//     if (!packName.trim()) {
//       setError("Please enter a pack name.");
//       return;
//     }
//     setError("");
//     setLoading(true);
//     try {
//       const res = await fetch(`${BACKEND_URL}/packs/create`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name: packName, authorId: user?._id }),
//       });
//       if (!res.ok) throw new Error("Failed to create pack");
//       const data = await res.json();
//       setCreatedPack(data);
//       setRootFolder({
//         _id: data.rootFolder,
//         name: packName,
//         children: [],
//         files: [],
//       });
//     } catch (err: any) {
//       setError(err.message || "Error creating pack");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddFolder = async (parentId: string) => {
//     const name = prompt("Enter folder name:");
//     if (!name) return;

//     try {
//       const res = await fetch(`${BACKEND_URL}/packs/add-folder`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name, parent: parentId }),
//       });
//       if (!res.ok) throw new Error("Failed to create folder");
//       const newFolder = await res.json();

//       updateFolderTree((prev) =>
//         addChildFolder(prev, parentId, {
//           ...newFolder,
//           children: [],
//           files: [],
//         }),
//       );
//     } catch (err) {
//       console.error("Error adding folder:", err);
//     }
//   };

//   const handleAddFile = async (parentId: string) => {
//     const input = document.createElement("input");
//     input.type = "file";
//     input.accept = "audio/*";

//     input.onchange = async (e: any) => {
//       const file = e.target.files?.[0];
//       if (!file) return;

//       const getFullFolderPath = (
//         folder: Folder | null,
//         targetId: string,
//         path: string[] = [],
//       ): string[] | null => {
//         if (!folder) return null;
//         if (folder._id === targetId) return [...path, folder.name];
//         for (const child of folder.children) {
//           const found = getFullFolderPath(child, targetId, [
//             ...path,
//             folder.name,
//           ]);
//           if (found) return found;
//         }
//         return null;
//       };

//       const pathParts = getFullFolderPath(rootFolder, parentId);
//       if (!pathParts) {
//         console.error("Folder path not found for parentId:", parentId);
//         return;
//       }

//       const folderPath = `packs/${pathParts.join("/")}`;
//       const fullKey = `${folderPath}/${file.name}`;

//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("key", fullKey);
//       formData.append("type", "pack");
//       formData.append("parent", parentId);

//       try {
//         const res = await fetch(`${BACKEND_URL}/packs/add-file`, {
//           method: "POST",
//           body: formData,
//         });
//         if (!res.ok) throw new Error("Failed to upload file");
//         const newFile = await res.json();

//         updateFolderTree((prev) => addChildFile(prev, parentId, newFile));
//       } catch (err) {
//         console.error("File upload error:", err);
//       }
//     };

//     input.click();
//   };

//   const updateFolderTree = (
//     updater: (folder: Folder | null) => Folder | null,
//   ) => setRootFolder((prev) => updater(prev));

//   const addChildFolder = (
//     folder: Folder | null,
//     parentId: string,
//     newFolder: Folder,
//   ): Folder | null => {
//     if (!folder) return null;
//     if (folder._id === parentId)
//       return { ...folder, children: [...folder.children, newFolder] };
//     const updatedChildren = folder.children
//       .map((child) => addChildFolder(child, parentId, newFolder))
//       .filter((child): child is Folder => child !== null);
//     return { ...folder, children: updatedChildren };
//   };

//   const addChildFile = (
//     folder: Folder | null,
//     parentId: string,
//     newFile: UploadedFile,
//   ): Folder | null => {
//     if (!folder) return null;
//     if (folder._id === parentId)
//       return { ...folder, files: [...folder.files, newFile] };
//     const updatedChildren = folder.children
//       .map((child) => addChildFile(child, parentId, newFile))
//       .filter((child): child is Folder => child !== null);
//     return { ...folder, children: updatedChildren };
//   };

//   return (
//     <>
//       <Header activeTop="Upload" activeBottom="Packs" />

//       <main className="bg-[#333333] py-20 px-3 text-gray-100">
//         <h1 className="text-3xl mb-6">Upload New Pack</h1>

//         {!createdPack ? (
//           <div className="space-y-4 max-w-lg">
//             <button
//               onClick={handleDeletePack}
//               className="mt-4 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
//             >
//               Delete Pack
//             </button>
//             <input
//               type="text"
//               value={packName}
//               onChange={(e) => setPackName(e.target.value)}
//               placeholder="Pack name"
//               className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-lg focus:ring focus:ring-cyan-400"
//             />
//             <button
//               onClick={handleCreatePack}
//               disabled={loading}
//               className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-semibold py-2 rounded-lg transition"
//             >
//               {loading ? "Creating..." : "Create Pack"}
//             </button>
//             {error && <p className="text-red-500">{error}</p>}
//           </div>
//         ) : (
//           <div className="mt-8">
//             <h2 className="text-2xl font-semibold mb-3">{createdPack.name}</h2>
//             {rootFolder && (
//               <Accordion type="multiple" className="space-y-2">
//                 <FolderSection
//                   folder={rootFolder}
//                   rootFolder={rootFolder}
//                   onAddFolder={handleAddFolder}
//                   onAddFile={handleAddFile}
//                   onDeleteFolder={handleDeleteFolder}
//                   onDeleteFile={handleDeleteFile}
//                   updateFolderTree={updateFolderTree}
//                   addChildFile={addChildFile}
//                 />
//               </Accordion>
//             )}
//           </div>
//         )}
//       </main>
//     </>
//   );
// }

"use client";
import EditablePack, { Folder, Pack } from "@/app/components/EditablePack";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { BACKEND_URL } from "@/app/constants";
import Header from "@/app/components/header";
import { useRouter } from "next/navigation";

export default function UploadPackPage() {
  const { user, loading: loadingUser } = useAuth();
  const router = useRouter();
  const [packName, setPackName] = useState("");
  const [createdPack, setCreatedPack] = useState<Pack | null>(null);
  const [rootFolder, setRootFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loadingUser && !user) router.push("/login");
  }, [loadingUser, user, router]);

  const handleCreatePack = async () => {
    if (!packName.trim()) {
      setError("Please enter a pack name.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/packs/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: packName, authorId: user?._id }),
      });
      if (!res.ok) throw new Error("Failed to create pack");
      const data = await res.json();
      setCreatedPack(data);
      setRootFolder({
        _id: data.rootFolder,
        name: packName,
        children: [],
        files: [],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Error creating pack");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header activeTop="Upload" activeBottom="Packs" />
      <main className="bg-[#333333] py-20 px-3 text-gray-100">
        <h1 className="text-3xl mb-6">Upload New Pack</h1>

        {!createdPack ? (
          <div className="space-y-4 max-w-lg">
            <input
              type="text"
              value={packName}
              onChange={(e) => setPackName(e.target.value)}
              placeholder="Pack name"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-lg focus:ring focus:ring-cyan-400"
            />
            <button
              onClick={handleCreatePack}
              disabled={loading}
              className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-semibold py-2 rounded-lg transition"
            >
              {loading ? "Creating..." : "Create Pack"}
            </button>
            {error && <p className="text-red-500">{error}</p>}
          </div>
        ) : (
          rootFolder && (
            <EditablePack pack={createdPack} initialRoot={rootFolder} />
          )
        )}
      </main>
    </>
  );
}

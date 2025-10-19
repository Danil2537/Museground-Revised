import { BACKEND_URL } from "../constants";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Accordion,
} from "./accordion";
import FileUpLoad from "./fileUpload";
import WaveformFile from "./WaveformFile";

interface UploadedFile {
  _id: string;
  name: string;
  url?: string;
  parent: string;
}

interface Folder {
  _id: string;
  name: string;
  parent?: string;
  children: Folder[];
  files: UploadedFile[];
}

export default function FolderSection({
  folder,
  rootFolder,
  onAddFolder,
  onAddFile,
  onDeleteFolder,
  onDeleteFile,
  updateFolderTree,
  addChildFile,
}: {
  folder: Folder;
  rootFolder: Folder;
  onAddFolder: (id: string) => void;
  onAddFile: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteFile: (fileId: string, parentId: string) => void;
  updateFolderTree: (updater: (folder: Folder | null) => Folder | null) => void;
  addChildFile: (
    folder: Folder | null,
    parentId: string,
    newFile: UploadedFile,
  ) => Folder | null;
}) {
  return (
    <AccordionItem value={folder._id}>
      <AccordionTrigger value={folder._id} className="text-cyan-400">
        <div className="flex justify-between w-full items-center">
          <span>{folder.name}</span>
          <div className="space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddFolder(folder._id);
              }}
              className="px-2 py-1 text-xs bg-zinc-700 rounded hover:bg-zinc-600"
            >
              Add Folder
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddFile(folder._id);
              }}
              className="px-2 py-1 text-xs bg-zinc-700 rounded hover:bg-zinc-600"
            >
              Add File
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFolder(folder._id);
              }}
              className="px-2 py-1 text-xs bg-red-600 rounded hover:bg-red-700 text-white"
            >
              Delete Folder
            </button>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent value={folder._id}>
        <FileUpLoad
          parentId={folder._id}
          rootFolder={rootFolder}
          BACKEND_URL={BACKEND_URL}
          updateFolderTree={updateFolderTree}
          addChildFile={addChildFile}
        />

        <div className="ml-4 space-y-3 max-h-[800px] overflow-y-auto pr-2">
          {folder.files.map((file) => (
            <WaveformFile
              key={file._id}
              file={file}
              onDeleteFile={onDeleteFile}
            />
          ))}

          {folder.children.length > 0 && (
            <Accordion type="multiple" className="space-y-2">
              {folder.children.map((child) => (
                <FolderSection
                  key={child._id}
                  folder={child}
                  rootFolder={rootFolder}
                  onAddFolder={onAddFolder}
                  onAddFile={onAddFile}
                  onDeleteFolder={onDeleteFolder}
                  onDeleteFile={onDeleteFile}
                  updateFolderTree={updateFolderTree}
                  addChildFile={addChildFile}
                />
              ))}
            </Accordion>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

import { useRef, useState } from "react";
import { VscCloudUpload } from "react-icons/vsc";

type DropzoneProps = {
  accept?: string;
  label?: string;
  onFile: (file: File) => void;
};

export const Dropzone = ({ accept, label, onFile }: DropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (files?.[0]) onFile(files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`
        flex flex-col items-center justify-center gap-3 w-full py-10 px-6
        border border-dashed rounded-lg cursor-pointer
        transition-colors select-none
        ${dragging ? "border-[#444] bg-[#0f0f0f]" : "border-border bg-surface hover:border-[#333] hover:bg-[#0d0d0d]"}
      `}
    >
      <VscCloudUpload size={24} className="text-text-muted" />
      {label && <p className="text-sm text-text-muted text-center">{label}</p>}
      <p className="text-xs text-[#555]">click or drag & drop</p>

      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
};

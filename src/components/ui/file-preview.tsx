import { useEffect, useState } from "react";
import { getPreviewType, createObjectUrl } from "../../libs/preview";
import { VscFile } from "react-icons/vsc";

type FilePreviewProps = {
  buffer: ArrayBuffer;
  mime: string;
  name: string;
};

export const FilePreview = ({ buffer, mime, name }: FilePreviewProps) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = createObjectUrl(buffer, mime);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [buffer, mime]);

  if (!url) return null;

  const type = getPreviewType(mime);

  if (type === "image") {
    return <img src={url} alt={name} className="max-w-full max-h-105 rounded-md object-contain border border-border" />;
  }
  if (type === "video") {
    return <video src={url} controls className="max-w-full max-h-105 rounded-md border border-border" />;
  }
  if (type === "audio") {
    return <audio src={url} controls className="w-full" />;
  }
  if (type === "pdf") {
    return <iframe src={url} title={name} className="w-full h-125 rounded-md border border-border" />;
  }

  // non-previewable file
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-md">
      <VscFile size={20} className="text-text-muted shrink-0" />
      <span className="text-sm text-text truncate">{name}</span>
    </div>
  );
};

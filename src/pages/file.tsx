import { useState, useCallback } from "react";
import { toast } from "sonner";
import { VscLockSmall, VscUnlock, VscCloudDownload, VscClose } from "react-icons/vsc";
import { encryptFile, decryptFile } from "../libs/file-crypto";
import { getPreviewType } from "../libs/preview";
import { unixNow } from "../libs/download";
import { PasswordInput } from "../components/ui/password-input";
import { Dropzone } from "../components/ui/dropzone";
import { FilePreview } from "../components/ui/file-preview";
import { Header } from "../components/ui/header";
import { useIncomingFile } from "../hooks/useIncomingFile";

type Mode = "encrypt" | "decrypt";

type FileResult = {
  buffer: ArrayBuffer;
  mime: string;
  name: string;
};

type FileState = {
  file: File;
  result?: FileResult;
};

function downloadBuffer(buffer: ArrayBuffer, filename: string, mime: string) {
  const blob = new Blob([buffer], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const FilePage = () => {
  const [mode, setMode] = useState<Mode>("encrypt");
  const [password, setPassword] = useState("");
  const [fileState, setFileState] = useState<FileState | null>(null);
  const [loading, setLoading] = useState(false);

  const resetFile = () => setFileState(null);

  const handleFile = useCallback((file: File) => {
    setFileState({ file });
  }, []);

  // handle incoming file from another app via PWA
  const handleIncomingFile = useCallback((file: File, sharedMode: Mode) => {
    setMode(sharedMode);
    setFileState({ file });
    setPassword("");
  }, []);

  useIncomingFile({ onFile: handleIncomingFile });

  const switchMode = (m: Mode) => {
    setMode(m);
    resetFile();
    setPassword("");
  };

  const handleEncrypt = async () => {
    if (!fileState || !password) {
      if (!password) toast.error("Password is required");
      return;
    }
    setLoading(true);
    try {
      const encrypted = await encryptFile(fileState.file, password);
      const result = {
        buffer: encrypted,
        mime: "application/octet-stream",
        name: `${unixNow()}-${fileState.file.name}.enc`,
      };
      setFileState((prev) => prev && { ...prev, result });
      toast.success("File encrypted");

      return result;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Encryption failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEncryptAndDownload = async () => {
    const result = await handleEncrypt();
    if (result) handleDownloadResult(result);
  };

  const handleDecrypt = async () => {
    if (!fileState || !password) {
      if (!password) toast.error("Password is required");
      return;
    }
    setLoading(true);
    try {
      const buffer = await fileState.file.arrayBuffer();
      const result = await decryptFile(buffer, password);
      if (!result.success) throw result.error;

      const { data, header } = result.data;
      setFileState(
        (prev) =>
          prev && {
            ...prev,
            result: { buffer: data, mime: header.mime, name: header.name },
          },
      );
      toast.success("File decrypted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Decryption failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResult = (result?: FileResult) => {
    if (!result && !fileState?.result) return;
    const { buffer, mime, name } = result || fileState!.result!;
    downloadBuffer(buffer, name, mime);
  };

  return (
    <div className="min-h-dvh bg-bg text-text flex flex-col">
      <Header />

      {/* encrypt / decrypt toggle */}
      <div className="border-b border-border px-6 flex items-center gap-1">
        {(["encrypt", "decrypt"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`
              flex items-center gap-1.5 px-3 py-3 text-sm border-b-2 transition-colors capitalize
              ${mode === m ? "border-text text-text" : "border-transparent text-text-muted hover:text-text"}
            `}
          >
            {m === "encrypt" ? <VscLockSmall size={14} /> : <VscUnlock size={14} />}
            {m}
          </button>
        ))}
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 md:py-16">
        <div className="w-full max-w-xl flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{mode === "encrypt" ? "Encrypt File" : "Decrypt File"}</h1>
            <p className="mt-1.5 text-sm text-text-muted">AES-256-GCM · client-side only · nothing leaves your browser</p>
          </div>

          {/* dropzone or file chip */}
          {!fileState ? (
            <Dropzone
              onFile={handleFile}
              label={mode === "encrypt" ? "Upload any file to encrypt" : "Upload a .enc file to decrypt"}
              accept={mode === "decrypt" ? ".enc" : undefined}
            />
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-4 py-2.5 bg-surface border border-border rounded-md">
                <div className="flex flex-col min-w-0">
                  <span className="text-sm text-text truncate">{fileState.file.name}</span>
                  <span className="text-xs text-text-muted">
                    {(fileState.file.size / 1024).toFixed(1)} KB
                    {fileState.file.type ? ` · ${fileState.file.type}` : ""}
                  </span>
                </div>
                <button onClick={resetFile} className="ml-3 text-text-muted hover:text-text transition-colors shrink-0" aria-label="Remove file">
                  <VscClose size={15} />
                </button>
              </div>

              {/* preview original file if it's an image/video/audio (encrypt mode) */}
              {mode === "encrypt" && <OriginalPreview file={fileState.file} />}
            </div>
          )}

          <PasswordInput id="file-password" label="Password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <div className="flex justify-between gap-2">
            <button
              onClick={mode === "encrypt" ? handleEncrypt : handleDecrypt}
              disabled={!fileState || loading}
              className="w-full py-2.5 rounded-md text-sm font-medium bg-text text-bg hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? (mode === "encrypt" ? "Encrypting..." : "Decrypting...") : mode === "encrypt" ? "Encrypt" : "Decrypt"}
            </button>
            {mode === "encrypt" && (
              <button
                onClick={handleEncryptAndDownload}
                disabled={!fileState || loading}
                className="w-full py-2.5 rounded-md border border-accent text-sm font-medium text-text bg-bg hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
              >
                {loading ? "Encrypting..." : "Encrypt & Download"}
              </button>
            )}
          </div>

          {/* result section */}
          {fileState?.result && (
            <div className="flex flex-col gap-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted uppercase tracking-widest">{mode === "encrypt" ? "Encrypted" : "Decrypted"}</span>
                <button
                  onClick={() => handleDownloadResult()}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-text-muted hover:text-text hover:bg-border transition-colors"
                >
                  <VscCloudDownload size={13} />
                  {fileState.result.name}
                </button>
              </div>

              {/* only show preview on decrypt — encrypt output is just a binary blob */}
              {mode === "decrypt" && <FilePreview buffer={fileState.result.buffer} mime={fileState.result.mime} name={fileState.result.name} />}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border px-6 py-4 text-center">
        <span className="text-xs text-text-muted">chardy safe · all processing is done locally</span>
      </footer>
    </div>
  );
};

// separate component so object URL lifecycle is tied to this component
const OriginalPreview = ({ file }: { file: File }) => {
  const type = getPreviewType(file.type);
  if (!type || type === "pdf") return null;

  const url = URL.createObjectURL(file);

  if (type === "image") {
    return <img src={url} alt={file.name} onLoad={() => URL.revokeObjectURL(url)} className="max-w-full max-h-75 rounded-md object-contain border border-border" />;
  }
  if (type === "video") {
    return <video src={url} controls className="max-w-full rounded-md border border-border" />;
  }
  if (type === "audio") {
    return <audio src={url} controls className="w-full" />;
  }
  return null;
};

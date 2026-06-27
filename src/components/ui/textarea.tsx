import { useState } from "react";
import { VscCopy, VscCheck, VscCloudDownload } from "react-icons/vsc";
import { downloadTxt, unixNow } from "../../libs/download";

type TextareaProps = React.ComponentProps<"textarea"> & {
  label?: string;
  /** "plain" | "cipher" — used for the download filename */
  kind?: "plain" | "cipher";
};

export const Textarea = ({ label, id, kind, ...props }: TextareaProps) => {
  const [copied, setCopied] = useState(false);

  const content = String(props.value ?? "");

  const handleCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    if (!content) return;
    const filename = `${unixNow()}${kind ? `-${kind}` : ""}.txt`;
    downloadTxt(content, filename);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* label row */}
      <div className="flex items-center justify-between">
        {label && (
          <label htmlFor={id} className="text-xs font-medium text-text-muted uppercase tracking-widest">
            {label}
          </label>
        )}

        {/* action buttons — only show when there's content */}
        <div className={`flex items-center gap-1 transition-opacity ${content ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <button
            type="button"
            onClick={handleCopy}
            title="Copy to clipboard"
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-text-muted hover:text-text hover:bg-border transition-colors"
          >
            {copied ? <VscCheck size={13} className="text-emerald-400" /> : <VscCopy size={13} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            title="Download as .txt"
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-text-muted hover:text-text hover:bg-border transition-colors"
          >
            <VscCloudDownload size={13} />
            <span>Download</span>
          </button>
        </div>
      </div>

      <textarea
        id={id}
        rows={12}
        className="w-full bg-surface border border-border rounded-md p-3 text-text text-sm font-mono resize-none focus:outline-none focus:border-[#333] placeholder:text-[#444] transition-colors"
        {...props}
      />
    </div>
  );
};

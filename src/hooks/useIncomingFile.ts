import { useEffect } from "react";

type useIncomingFileProps = {
  onFile: (file: File, mode: "encrypt" | "decrypt") => void;
};

declare global {
  interface Window {
    launchQueue?: {
      setConsumer: (consumer: (launchParams: LaunchParams) => void) => void;
    };
  }

  interface LaunchParams {
    files: FileSystemFileHandle[];
  }
}

function detectMode(filename: string): "encrypt" | "decrypt" {
  return filename.endsWith(".enc") ? "decrypt" : "encrypt";
}

/**
 * handle File Handler API and Web Share Target API in PWA
 */
export function useIncomingFile({ onFile }: useIncomingFileProps) {
  // --- desktop: File Handler API via launchQueue ---
  useEffect(() => {
    if (!("launchQueue" in window) || !window.launchQueue) return;

    window.launchQueue.setConsumer(async (launchParams) => {
      if (!launchParams.files.length) return;
      try {
        const fileHandle = launchParams.files[0];
        const file = await fileHandle.getFile();
        onFile(file, detectMode(file.name));
      } catch {
        // couldn't read file, ignore
      }
    });
  }, [onFile]);

  // --- mobile: Share Target API via SW cache ---
  useEffect(() => {
    if (location.pathname !== "/file") return;

    const params = new URLSearchParams(location.search);
    if (!params.has("incoming-file")) return;

    const fetchSharedFile = async () => {
      try {
        const cache = await caches.open("files");
        const res = await cache.match("incoming-file");
        if (!res) return;

        const { name, type, data } = await res.json();
        const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
        const file = new File([bytes], name, { type });

        onFile(file, detectMode(file.name));

        // cleanup
        await cache.delete("incoming-file");
        history.replaceState(null, "", "/file");
      } catch {
        // not a share target request, ignore
      }
    };

    fetchSharedFile();
  }, [onFile]);
}

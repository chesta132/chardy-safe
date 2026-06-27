import { useEffect } from "react";

type UseShareTargetProps = {
  onFile: (file: File, mode: "encrypt" | "decrypt") => void;
};

/**
 * Handles files shared to the app via the Web Share Target API.
 * When another app shares a file to us, the browser POSTs a multipart/form-data
 * request to /file. The service worker intercepts this, stashes the body,
 * and redirects to /file?share-target so we can fetch it client-side.
 */
export function useShareTarget({ onFile }: UseShareTargetProps) {
  useEffect(() => {
    if (location.pathname !== "/file") return;

    const params = new URLSearchParams(location.search);
    if (!params.has("share-target")) return;

    const fetchSharedFile = async () => {
      try {
        const cache = await caches.open("share-target");
        const res = await cache.match("shared-file");
        if (!res) return;

        const formData = await res.formData();
        const file = formData.get("file") as File | null;
        if (!file) return;

        // auto-detect: .enc → decrypt, everything else → encrypt
        const mode = file.name.endsWith(".enc") ? "decrypt" : "encrypt";
        onFile(file, mode);

        // cleanup + remove share-target param from URL
        await cache.delete("shared-file");
        history.replaceState(null, "", "/file");
      } catch {
        // not a share target request, ignore
      }
    };

    fetchSharedFile();
  }, [onFile]);
}

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#0a0a0a",
          border: "1px solid #1a1a1a",
          color: "#ececec",
          fontSize: "13px",
        },
      }}
    />
  );
}

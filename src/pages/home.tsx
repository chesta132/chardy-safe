import { useState } from "react";
import { decryptData, encryptData } from "../libs/crypto";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { timeInMs } from "../libs/manipulate/number";
import { Textarea } from "../components/ui/textarea";
import { PasswordInput } from "../components/ui/password-input";
import { Header } from "../components/ui/header";

const INPUT_DEBOUNCE = timeInMs({ second: 1 });

export const Home = () => {
  const [form, setForm] = useState({
    encrypted: "",
    password: "",
    decrypted: "",
  });

  // track which side was last edited so password change knows which to re-process
  const [latestChange, setLatestChange] = useState<"encrypted" | "decrypted">("decrypted");

  const handleDecrypt = useDebouncedCallback(async (data: string, password: string) => {
    const result = await decryptData(data, password);
    if (!result.success) {
      toast.error(result.error.message);
      return;
    }
    setForm((prev) => ({ ...prev, decrypted: result.data }));
  }, INPUT_DEBOUNCE);

  const handleEncrypt = useDebouncedCallback(async (data: string, password: string) => {
    const encrypted = await encryptData(data, password);
    setForm((prev) => ({ ...prev, encrypted }));
  }, INPUT_DEBOUNCE);

  const handleEncryptedChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.trim();
    setForm((prev) => ({ ...prev, encrypted: value }));
    setLatestChange("encrypted");
    if (value) handleDecrypt(value, form.password);
  };

  const handleDecryptedChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, decrypted: value }));
    setLatestChange("decrypted");
    handleEncrypt(value, form.password);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, password: value }));

    if (latestChange === "decrypted") handleEncrypt(form.decrypted, value);
    else handleDecrypt(form.encrypted, value);
  };

  return (
    <div className="min-h-dvh bg-bg text-text flex flex-col">
      <Header />

      {/* main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 md:py-16">
        <div className="w-full max-w-5xl flex flex-col gap-8">
          {/* title */}
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-text">Encrypt & Decrypt</h1>
            <p className="mt-1.5 text-sm text-text-muted">AES-256-GCM · client-side only · nothing leaves your browser</p>
          </div>

          {/* password field — center, narrower */}
          <div className="flex justify-center">
            <div className="w-full max-w-xs">
              <PasswordInput id="password" label="Password" placeholder="Enter your password" value={form.password} onChange={handlePasswordChange} />
            </div>
          </div>

          {/* two textareas side by side on md+ */}
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => e.preventDefault()}>
            <Textarea
              id="decrypted"
              name="decrypted"
              label="Plaintext"
              kind="plain"
              placeholder="Type something to encrypt..."
              value={form.decrypted}
              onChange={handleDecryptedChange}
            />
            <Textarea
              id="encrypted"
              name="encrypted"
              label="Ciphertext"
              kind="cipher"
              placeholder="Paste encrypted text to decrypt..."
              value={form.encrypted}
              onChange={handleEncryptedChange}
            />
          </form>
        </div>
      </main>

      {/* footer */}
      <footer className="border-t border-border px-6 py-4 text-center">
        <span className="text-xs text-text-muted">chardy safe · all processing is done locally</span>
      </footer>
    </div>
  );
};

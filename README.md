# chardy safe

Client-side AES-256-GCM encryption for text and files. Nothing leaves your browser.

## Stack

- **React 19** + **TypeScript**
- **Vite 8** + **Tailwind CSS v4**
- **react-router v8**, **sonner**, **use-debounce**, **react-icons**

## Getting Started

```bash
pnpm install
pnpm dev
```

## Pages

### `/` — Text

Encrypt and decrypt text in real time. Both sides update automatically as you type (debounced 1s). Password change re-processes whichever side was last edited.

### `/file` — File

Encrypt or decrypt any file.

- **Encrypt** — upload any file → enter password → downloads a `.enc` binary
- **Decrypt** — upload a `.enc` file → enter password → preview or download the original

Images, videos, and audio are previewed inline after decryption. No need to download first.

## How Encryption Works

### Text (`/`)

Uses the same AES-256-GCM flow as files, but output is serialized as a plain string:

```
iv;salt;ciphertext   ← all base64, semicolon-delimited
```

Backwards compatible with the old JSON format (`{ iv, salt, ciphertext }`).

### Files (`/file`)

Raw bytes are encrypted directly — no base64 conversion. The `.enc` output is a binary file with this layout:

```
[4 bytes: header length (uint32 BE)]
[header JSON: { name, mime }]
[16 bytes: salt]
[12 bytes: iv]
[ciphertext]
```

The header preserves the original filename and MIME type, so decryption can restore the file correctly and preview it in-browser.

### Key Derivation

Both text and file encryption use **PBKDF2** (100,000 iterations, SHA-256) to derive a 256-bit AES-GCM key from the password + a random 16-byte salt.

## Project Structure

```
src/
├── pages/
│   ├── home.tsx          # text encrypt/decrypt
│   └── file.tsx          # file encrypt/decrypt
├── libs/
│   ├── crypto.ts         # text encrypt/decrypt
│   ├── file-crypto.ts    # file encrypt/decrypt + .enc format
│   ├── buffer.ts         # ArrayBuffer ↔ string/base64 helpers
│   ├── format.ts         # text format serialization
│   ├── preview.ts        # MIME → preview type + object URL helper
│   ├── download.ts       # file download trigger + unix timestamp
│   └── manipulate/
│       ├── string.ts
│       ├── number.ts
│       └── object.ts
└── components/ui/
    ├── header.tsx         # shared nav
    ├── textarea.tsx       # textarea with copy + download actions
    ├── password-input.tsx # password field with show/hide toggle
    ├── dropzone.tsx       # drag & drop file input
    ├── file-preview.tsx   # image / video / audio / pdf / fallback preview
    └── toaster.tsx        # sonner toaster styled to match theme
```

import { useState } from "react";
import { VscEye, VscEyeClosed } from "react-icons/vsc";

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type"> & {
  label?: string;
};

export const PasswordInput = ({ label, id, ...props }: PasswordInputProps) => {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-muted uppercase tracking-widest">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          className="w-full bg-surface border border-border rounded-md px-3 py-2.5 pr-10 text-text text-sm focus:outline-none focus:border-[#333] placeholder:text-[#444] transition-colors"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <VscEyeClosed size={16} /> : <VscEye size={16} />}
        </button>
      </div>
    </div>
  );
};

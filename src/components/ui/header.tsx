import { NavLink } from "react-router";
import { VscLock, VscFile } from "react-icons/vsc";

const navItems = [
  { to: "/", label: "Text", icon: <VscLock size={14} /> },
  { to: "/file", label: "File", icon: <VscFile size={14} /> },
];

export const Header = () => {
  return (
    <header className="border-b border-border px-6 py-0 flex items-center gap-1">
      <span className="text-sm font-medium tracking-tight mr-4 py-4">chardy safe</span>

      {navItems.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) => `
            flex items-center gap-1.5 px-3 py-4 text-sm border-b-2 transition-colors
            ${isActive ? "border-text text-text" : "border-transparent text-text-muted hover:text-text"}
          `}
        >
          {icon}
          {label}
        </NavLink>
      ))}
    </header>
  );
};

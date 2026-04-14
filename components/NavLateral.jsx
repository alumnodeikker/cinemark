"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
      <circle cx="11" cy="11" r="7" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
      <path
        d="M4 11.5 12 5l8 6.5V20h-5v-5h-6v5H4z"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
      <rect x="4" y="4" width="7" height="7" strokeWidth="2" />
      <rect x="13" y="4" width="7" height="7" strokeWidth="2" />
      <rect x="4" y="13" width="7" height="7" strokeWidth="2" />
      <rect x="13" y="13" width="7" height="7" strokeWidth="2" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
      <path
        d="m12 20-1.2-1C6.2 15 3 12.2 3 8.8 3 6.2 5.1 4 7.7 4c1.5 0 3 .8 3.8 2 .8-1.2 2.3-2 3.8-2C17.9 4 20 6.2 20 8.8c0 3.4-3.2 6.2-7.8 10.2z"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ITEMS = [
  { href: "/buscar", label: "Buscar", icon: SearchIcon },
  { href: "/", label: "Inicio", icon: HomeIcon },
  { href: "/populares", label: "Populares", icon: GridIcon },
  { href: "/mis_fav", label: "Mi Lista", icon: HeartIcon },
];

export default function NavLateral() {
  const pathname = usePathname();

  return (
    <aside className="nfx-sidebar">
      <div className="nfx-logo">C</div>
      <nav className="nfx-sidebar-nav">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const activo =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href)) ||
            (item.href === "/" && pathname.startsWith("/peli/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              className={`nfx-icon-link ${activo ? "is-active" : ""}`}
            >
              <Icon />
              <span className="nfx-icon-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

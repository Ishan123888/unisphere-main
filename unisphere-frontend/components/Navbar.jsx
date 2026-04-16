"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/portfolio", label: "My Portfolio" },
    { href: "/student-sessions", label: "Training Sessions" },
    { href: "/admin", label: "Admin Desk" },
  ];

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="nav-brand-icon">🎓</div>
        UniSphere
      </div>
      <div className="nav-links">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? "active" : ""}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

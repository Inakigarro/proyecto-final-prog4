"use client";

import { useState } from "react";
import "./navbar.css";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
interface EnlacesNav {
  etiqueta: string;
  ruta: string;
}

const enlacesNav: EnlacesNav[] = [
  { etiqueta: "Inicio", ruta: "/" },
  { etiqueta: "Promociones", ruta: "/promociones" },
  { etiqueta: "Quiénes somos", ruta: "/test-connection" },
];

const Navbar = () => {
  const rutaActual = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <header className="app-navbar">
      <div className="navbar-logo">TechPoint</div>

      <form
        className="navbar-search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = query.trim();
          if (!trimmed) return;
          router.push(`/search-result?query=${encodeURIComponent(trimmed)}`);
        }}
      >
        <input
          type="search"
          placeholder="Buscar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar productos"
        />
      </form>

      <div className="navbar-actions">
        <ul className="navbar-list">
          {enlacesNav.map(({ etiqueta, ruta }) => {
            const estaActivo = rutaActual === ruta;
            return (
              <li key={ruta} className="navbar-item">
                <Link
                  href={ruta}
                  className={`navbar-link${estaActivo ? " activo" : ""}`}
                  aria-current={estaActivo ? "page" : undefined}
                >
                  {etiqueta}
                </Link>
              </li>
            );
          })}
        </ul>

        <button type="button" className="icon-button" aria-label="Login">
          <span className="login-icon">🔒</span>
        </button>
        <button type="button" className="icon-button" aria-label="Carrito">
          <span className="login-icon">🛒</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;

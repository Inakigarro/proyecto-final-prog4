"use client";

import React from "react";
import "./navbar.css";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

  return (
    <header className="app-navbar">
      <div className="navbar-logo">TechPoint</div>

      <div className="navbar-search">
        <input type="text" placeholder="Buscar..." />
      </div>

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

"use client";

import { useState } from "react";
import "./navbar.css";
import Link from "next/link";
import CartIcon from "../cart/CartIcon";
import LoginGateModal from "../cart/LoginGateModal";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";

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
  const [loginAbierto, setLoginAbierto] = useState(false);

  const { state, logout } = useAuth();
  const { isAutenticado, isCargando, usuario } = state;

  return (
    <>
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

          {/* Área de sesión: vacía durante carga, login o usuario según estado */}
          {!isCargando && (
            isAutenticado && usuario ? (
              <div className="navbar-usuario">
                <span className="navbar-usuario-nombre">
                  {usuario.nombre}
                </span>
                <button
                  type="button"
                  className="navbar-logout"
                  onClick={logout}
                  aria-label="Cerrar sesión"
                >
                  Salir
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="icon-button"
                aria-label="Iniciar sesión"
                onClick={() => setLoginAbierto(true)}
              >
                <span className="login-icon">🔒</span>
              </button>
            )
          )}

          <CartIcon />
        </div>
      </header>

      <LoginGateModal
        abierto={loginAbierto}
        onCerrar={() => setLoginAbierto(false)}
      />
    </>
  );
};

export default Navbar;

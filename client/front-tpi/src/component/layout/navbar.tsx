"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./navbar.css";
import CartIcon from "../cart/CartIcon";
import { useAuth } from "@/context/AuthContext";
import BarraBusqueda from "./BarraBusqueda";
import CategoriasMenu from "./CategoriasMenu";
import MenuMovilDrawer, { type EnlacePrincipal } from "./MenuMovilDrawer";
import { useCategorias } from "./hooks/useCategorias";

const enlacesPrincipales: EnlacePrincipal[] = [
  { etiqueta: "Promociones", ruta: "/promociones" },
  { etiqueta: "Quiénes somos", ruta: "/quienes-somos" },
];

const Navbar = () => {
  const rutaActual = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { state, logout, tieneRol } = useAuth();
  const { isAutenticado, isCargando, usuario } = state;

  const { categorias } = useCategorias();

  // Cerrar el menú al hacer click fuera
  useEffect(() => {
    if (!menuAbierto) return;
    const handleClickFuera = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, [menuAbierto]);

  return (
    <header className="app-navbar">
      <MenuMovilDrawer categorias={categorias} enlaces={enlacesPrincipales} />

      <Link href="/" className="navbar-logo">TechPoint</Link>

      <CategoriasMenu categorias={categorias} />

      <BarraBusqueda />

      <div className="navbar-actions">
        <ul className="navbar-list">
          {enlacesPrincipales.map(({ etiqueta, ruta }) => {
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

        {/* Área de sesión: vacía durante carga, login o menú de usuario según estado */}
        {!isCargando && (
          isAutenticado && usuario ? (
            <div className="navbar-usuario" ref={menuRef}>
              <button
                type="button"
                className="navbar-usuario-boton"
                onClick={() => setMenuAbierto((v) => !v)}
                aria-expanded={menuAbierto}
                aria-haspopup="menu"
              >
                <span className="navbar-usuario-nombre">{usuario.nombre}</span>
                <span className="navbar-usuario-chevron" aria-hidden="true">▾</span>
              </button>

              {menuAbierto && (
                <div className="navbar-usuario-menu" role="menu">
                  <Link
                    href="/perfil"
                    className="navbar-menu-item"
                    role="menuitem"
                    onClick={() => setMenuAbierto(false)}
                  >
                    Mi perfil
                  </Link>
                  <Link
                    href="/perfil?tab=direcciones"
                    className="navbar-menu-item"
                    role="menuitem"
                    onClick={() => setMenuAbierto(false)}
                  >
                    Mis direcciones
                  </Link>
                  <Link
                    href="/mis-ordenes"
                    className="navbar-menu-item"
                    role="menuitem"
                    onClick={() => setMenuAbierto(false)}
                  >
                    Mis compras
                  </Link>
                  {tieneRol('dueno') && (
                    <Link
                      href="/dashboard"
                      className="navbar-menu-item"
                      role="menuitem"
                      onClick={() => setMenuAbierto(false)}
                    >
                      Panel de gestión
                    </Link>
                  )}
                  <button
                    type="button"
                    className="navbar-menu-item navbar-menu-item--peligro"
                    role="menuitem"
                    onClick={() => { setMenuAbierto(false); logout(); }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="icon-button"
              aria-label="Iniciar sesión"
            >
              <span className="login-icon">🔒</span>
            </Link>
          )
        )}

        <CartIcon />
      </div>
    </header>
  );
};

export default Navbar;

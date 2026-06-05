"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./navbar.css";
import CartIcon from "../cart/CartIcon";
import LoginGateModal from "../cart/LoginGateModal";
import { useAuth } from "@/context/AuthContext";
import BarraBusqueda from "./BarraBusqueda";
import CategoriasMenu from "./CategoriasMenu";
import MenuMovilDrawer, { type EnlacePrincipal } from "./MenuMovilDrawer";
import { useCategorias } from "./useCategorias";

const enlacesPrincipales: EnlacePrincipal[] = [
  { etiqueta: "Promociones", ruta: "/promociones" },
  { etiqueta: "Quiénes somos", ruta: "/test-connection" },
];

const Navbar = () => {
  const rutaActual = usePathname();
  const [loginAbierto, setLoginAbierto] = useState(false);

  const { state, logout } = useAuth();
  const { isAutenticado, isCargando, usuario } = state;

  const { categorias } = useCategorias();

  return (
    <>
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

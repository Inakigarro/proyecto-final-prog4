"use client";

import React from "react";
import "./navbar.css";

const Navbar = () => {
  return (
    <header className="app-navbar">
      <div className="navbar-logo">TechPoint</div>

      <div className="navbar-actions">
        <button type="button">Inicio</button>
        <button type="button">Promociones</button>
        <button type="button">Quiénes somos</button>
        <div className="navbar-search">
          <input type="text" placeholder="Buscar..." />
        </div>
        <button type="button" className="login-button" aria-label="Login">
          <span className="login-icon">🔒</span>
        </button>
        <button type="button" className="login-button" aria-label="Login">
          <span className="login-icon">🛒</span>
        </button>

      </div>
    </header>
  );
};

export default Navbar;

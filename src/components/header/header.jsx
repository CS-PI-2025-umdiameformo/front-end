import React from "react";
import "./header.css";
import logo from "../../img/logo.png"; // corrigido o path (geralmente img fica em src/img ou src/assets/img)

const Header = ({ nome }) => {
  return (
    <div className="header">
      <div className="header-content">
        <img src={logo} alt="Logo Organize Agenda" className="logo" />
        <h1>{nome}</h1>
      </div>
    </div>
  );
};

export default Header;

// Adicionar páginas nessa UL só colocar o nome da classe "/loginUsuario" por exemplo.
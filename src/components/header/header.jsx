import React from "react";
import "./header.css";
import logo from "../../img/logo.png";

const Header = ({ nome }) => {
  return (
    <div className="header">
      <div className="header-content">
        <div className="header-left">
          <img src={logo} alt="Logo Organize Agenda" className="logo" />
          <h1>{nome}</h1>
        </div>
        <nav className="header-nav">
          <ul>
            <li><a href="/home">Início</a></li>
            <li><a href="/agendamento">Agenda</a></li>
            <li><a href="/servicos">Serviços</a></li>
            <li><a href="/clientes">Clientes</a></li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Header;
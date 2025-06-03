import React from "react";
import "./header.css";

const Header = ({ nome }) => {
  return (
    <div className="header">
      <h1>{nome}</h1>
    </div>
  );
};

export default Header;

// Adicionar paginas nessa UL só colocar o nome da classe "/loginUsuario" por exemplo.


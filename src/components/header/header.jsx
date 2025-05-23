import React from "react";
import "./header.css";

const Header = (params) => {
  const { nome, idade } = params;
  return (
    <ul>
      <li><a href="/loginUsuario">Login.</a></li>
      <li><a href="/agendamento">Agendemento.</a></li>

    </ul>           
  );
};
export default Header;

// Adicionar paginas nessa UL só colocar o nome da classe "/loginUsuario" por exemplo.


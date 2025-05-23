import React, { useState } from "react";
import "./loginUsuario.css";

function LoginUsuario() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const envioLogin = (event) => {
    
    event.preventDefault();
    alert(`Login realizado com sucesso ${email} ${senha}`);
  }  

    return (
      <form onSubmit={envioLogin}>
        <input
          type="email"
          placeholder="Digite seu email"
          onChange={(event) => {
            setEmail(event.target.value);
          }}
        />
        <input
          type="password"
          placeholder="Digite sua senha"
          onChange={(event) => {
            setSenha(event.target.value);
          }}
        />
        <button type="submit">Enviar</button>
    </form>
  )
}
export default LoginUsuario;

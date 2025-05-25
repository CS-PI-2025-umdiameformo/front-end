import React, { useState } from "react";
import "./loginUsuario.css";

function LoginUsuario() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [naoSouRobo, setNaoSouRobo] = useState(false);

  const envioLogin = (event) => {
    event.preventDefault();
    if (!email || !senha) {
      alert("Por favor, preencha o e-mail e a senha.");
      return;
    }
    if (!naoSouRobo) {
      alert("Por favor, confirme que você não é um robô.");
      return;
    }
    alert("Login realizado com sucesso!");
  };

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
      <label style={{ display: "block", margin: "10px 0" }}>
        <input
          type="checkbox"
          checked={naoSouRobo}
          onChange={() => setNaoSouRobo(!naoSouRobo)}
        />
        Não sou um robô
      </label>
      <button type="submit">Enviar</button>
      <button
        type="button"
        style={{ marginLeft: "10px" }}
        onClick={() => alert("Função de recuperação de senha ainda não implementada.")}
      >
        Esqueci a senha
      </button>
      <button
        type="button"
        style={{ marginLeft: "10px" }}
        onClick={() => alert("Função de cadastro ainda não implementada.")}
      >
        Cadastre-se
      </button>
    </form>
  );
}
export default LoginUsuario;

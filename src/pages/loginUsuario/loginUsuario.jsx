import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./loginUsuario.css";

function LoginUsuario() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [naoSouRobo, setNaoSouRobo] = useState(false);
  const navigate = useNavigate(); 

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

    // Simula um login bem-sucedido
    alert("Login realizado com sucesso!");
    navigate("/agendamento"); // Redireciona para a página de agendamento
  };

  return (
    <form className="formulario" onSubmit={envioLogin}>
      <input
        type="email"
        placeholder="Digite seu email"
        onChange={(event) => setEmail(event.target.value)}
      />
      <input
        type="password"
        placeholder="Digite sua senha"
        onChange={(event) => setSenha(event.target.value)}
      />
      <label>
        <input
          type="checkbox"
          checked={naoSouRobo}
          onChange={() => setNaoSouRobo(!naoSouRobo)}
        />
        Não sou um robô
      </label>
      <div className="formulario-botoes">
        <button type="submit">Login</button>
        <button
          type="button"
          onClick={() =>
            alert("Função de recuperação de senha ainda não implementada.")
          }
        >
          Esqueci a senha
        </button>
        <button
          type="button"
          onClick={() => navigate("/cadastroUsuario")} 
        >
          Cadastre-se
        </button>
      </div>
    </form>
  );
}

export default LoginUsuario;

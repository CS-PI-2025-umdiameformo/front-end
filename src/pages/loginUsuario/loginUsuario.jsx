import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./loginUsuario.css";
import { LocalStorageUDMF } from "../../utils/LocalStorageUDMF";

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

    const localStorage = new LocalStorageUDMF();
    localStorage.set("usuario", { email, nome: email.split('@')[0] });
    navigate("/agendamento");
  };

  return (
    <form className="form-login" onSubmit={envioLogin}>
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
      <div className="form-login-buttons">
        <button type="submit">Login</button>
        <button
          type="button"
          onClick={() => navigate("/recuperar-senha")}
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

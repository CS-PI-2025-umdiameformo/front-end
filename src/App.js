import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Header from "./components/header/header";
import Calculadora from "./pages/calculadora/calculadora";
import Footer from "./components/footer/footer";
import CadastroUsuario from "./pages/cadastroUsuario/cadastroUsuario";
import LoginUsuario from "./pages/loginUsuario/loginUsuario";
import Agendamento from "./pages/agendamento/agendamento";
import RecuperacaoSenha from "./pages/recuperacaoSenha/recuperacaoSenha";
import { LocalStorageUDMF } from "./utils/LocalStorageUDMF";

function App() {
  const [headerNome, setHeaderNome] = useState("Organize Agenda");
  
  useEffect(() => {
    const localStorage = new LocalStorageUDMF();
    const usuario = localStorage.get("usuario");
    if (usuario) {
      setHeaderNome(`Bem-vindo, ${usuario.nome}`);
    }
  }, []);
  
  return (
    <>
      <Header nome={headerNome} />
      <BrowserRouter>
        <Routes>
          <Route path="/" Component={LoginUsuario} />
          <Route path="/agendamento" element={<Agendamento />} />
          <Route path="/calculadora" Component={Calculadora} />
          <Route path="/cadastroUsuario" Component={CadastroUsuario} />
          <Route path="/recuperar-senha" Component={RecuperacaoSenha} /> 
        </Routes>
      </BrowserRouter>
      <Footer />
    </>
  );
}

export default App;

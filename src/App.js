import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import Header from "./components/header/header";
import Calculadora from "./pages/calculadora/calculadora";
import Home from "./pages/home/home";
import Footer from "./components/footer/footer";
import CadastroUsuario from "./pages/cadastroUsuario/cadastroUsuario";
import LoginUsuario from "./pages/loginUsuario/loginUsuario";
import Agendamento from "./pages/agendamento/agendamento";
import RecuperacaoSenha from "./pages/recuperacaoSenha/recuperacaoSenha";
import GerenciarServicos from "./pages/gerenciarServicos/gerenciarServicos";
import GerenciarClientes from "./pages/gerenciarClientes/gerenciarClientes";
import { PrimeReactProvider } from 'primereact/api';
import { inicializarDadosTeste } from "./utils/testDataManager";

function App() {
  useEffect(() => {
    inicializarDadosTeste();
  }, []);

  return (
    <PrimeReactProvider value={{
      ripple: true,
      inputStyle: 'outlined',
      buttonStyle: 'outlined',
      hideOverlaysOnDocumentScrolling: false
    }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginUsuario />} />
          <Route path="/recuperar-senha" element={<RecuperacaoSenha />} />
          <Route path="/cadastroUsuario" element={<CadastroUsuario />} />
          
          {/* Rotas com Header */}
          <Route path="/home" element={<><Header nome="Organize Agenda" /><Home /></>} />
          <Route path="/calculadora" element={<><Header nome="Organize Agenda" /><Calculadora /></>} />
          <Route path="/agendamento" element={<><Header nome="Organize Agenda" /><Agendamento /></>} />
          <Route path="/servicos" element={<><Header nome="Organize Agenda" /><GerenciarServicos /></>} />
          <Route path="/clientes" element={<><Header nome="Organize Agenda" /><GerenciarClientes /></>} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </PrimeReactProvider>
  );
}

export default App;

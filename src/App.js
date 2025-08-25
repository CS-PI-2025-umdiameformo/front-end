import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import "./styles/temas.css";
import Header from "./components/header/header";
import Calculadora from "./pages/calculadora/calculadora";
import Home from "./pages/home/home";
import Footer from "./components/footer/footer";
import CadastroUsuario from "./pages/cadastroUsuario/cadastroUsuario";
import LoginUsuario from "./pages/loginUsuario/loginUsuario";
import Agendamento from "./pages/agendamento/agendamento";
import RecuperacaoSenha from "./pages/recuperacaoSenha/recuperacaoSenha";
import AlternadorTema from "./components/alternadorTema/alternadorTema"; // Do HEAD
import { ProvedorTema } from "./context/ContextoTema"; // Do HEAD
import Perfil from "./pages/perfil/perfil"; // Do 8594d30

function App() {
  return (
    <ProvedorTema> {/* Do HEAD, envolvendo o BrowserRouter */}
      <BrowserRouter>
        <Header nome="Organize Agenda" />
        <AlternadorTema /> {/* Do HEAD */}
        <Routes>
          <Route path="/login" Component={LoginUsuario} />
          <Route path="/" Component={Home} />
          <Route path="/calculadora" Component={Calculadora} />
          <Route path="/cadastroUsuario" Component={CadastroUsuario} />
          <Route path="/agendamento" element={<Agendamento />} />
          <Route path="/loginUsuario" Component={LoginUsuario} />
          <Route path="/recuperar-senha" Component={RecuperacaoSenha} />
          <Route path="/perfil" Component={Perfil} /> {/* Do 8594d30 */}
        </Routes>
        <Footer />
      </BrowserRouter>
    </ProvedorTema>
  );
}

export default App;
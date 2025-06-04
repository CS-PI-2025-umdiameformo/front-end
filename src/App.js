import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Header from "./components/header/header";
import Calculadora from "./pages/calculadora/calculadora";
import Home from "./pages/home/home";
import Footer from "./components/footer/footer";
import CadastroUsuario from "./pages/cadastroUsuario/cadastroUsuario";
import LoginUsuario from "./pages/loginUsuario/loginUsuario";
import Agendamento from "./pages/agendamento/agendamento";

function App() {
  return (
    <>
      <Header nome="Organize Agenda" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" Component={LoginUsuario} />
          <Route path="/" Component={Home} />
          <Route path="/calculadora" Component={Calculadora} />
          <Route path="/cadastroUsuario" Component={CadastroUsuario} />
          <Route path="/agendamento" element={<Agendamento />} />
          <Route path="/loginUsuario" Component={LoginUsuario} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </>
  );
}

export default App;

import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Header from "./components/header/header";
import Calculadora from "./pages/calculadora/calculadora";
import Home from "./pages/home/home";
import Footer from "./components/footer/footer";
import CadastroUsuario from "./pages/cadastroUsuario/cadastroUsuario";

function App() {
  return (
    <>
      <Header nome="Orgnaize Agenda" />
      <BrowserRouter>
        <Routes>
          <Route path="/" Component={Home} />
          <Route path="/calculadora" Component={Calculadora} />
          <Route path="/cadastroUsuario" Component={CadastroUsuario} />
        </Routes>
      </BrowserRouter>
      {/* <Calculadora /> */}
      <Footer />
    </>
  );
}

export default App;

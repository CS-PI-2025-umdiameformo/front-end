import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Header from "./components/header/header";
import Calculadora from "./pages/calculadora/calculadora";
import Home from "./pages/home/home";
import Footer from "./components/footer/footer";
import LoginUsuario from "./pages/loginUsuario/loginUsuario";

function App() {
  return (
    <>
      <Header nome="Tomita" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" Component={LoginUsuario} />
          <Route path="/" Component={Home} />
          <Route path="/calculadora" Component={Calculadora} />
          <Route path="/loginUsuario" Component={LoginUsuario} />
        </Routes>
      </BrowserRouter>
      {/* <Calculadora /> */}
      <Footer />
    </>
  );
}

export default App;

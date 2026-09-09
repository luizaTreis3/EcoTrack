import { useState } from "react";
import Login from "./Login";
import Cadastro from "./Cadastro";
import RecuperarAcesso from "./RecuperarAcesso";
import RedefinirSenha from "./RedefinirSenha";
import CriarRelato from "./CriarRelato";
import Home from "./Home";
import MeuPerfil from "./MeuPerfil";
import Desafios from "./Desafios";
import Infos from "./Infos";
import PerfilConfiguracao from "./PerfilConfiguracao";
import RegistrarReciclagem from "./RegistrarReciclagem";

export default function App() {
  const [screen, setScreen] = useState("Login");

  // Guarda os dados do usuário que está logado
  const [usuario, setUsuario] = useState(null);

  if (screen === "Login") {
    return (
      <Login
        setScreen={setScreen}
        setUsuario={setUsuario}
      />
    );
  }

  if (screen === "Cadastro") {
    return <Cadastro setScreen={setScreen} />;
  }

  if (screen === "RecuperarAcesso") {
    return <RecuperarAcesso setScreen={setScreen} />;
  }

  if (screen === "RedefinirSenha") {
    return <RedefinirSenha setScreen={setScreen} />;
  }

  if (screen === "CriarRelato") {
    return (
      <CriarRelato
        setScreen={setScreen}
        usuario={usuario}
      />
    );
  }

  if (screen === "RegistrarReciclagem") {
    return <RegistrarReciclagem setScreen={setScreen} />;
  }

  if (screen === "Home") {
    return <Home setScreen={setScreen} />;
  }

  if (screen === "MeuPerfil") {
    return <MeuPerfil setScreen={setScreen} />;
  }

  if (screen === "Desafios") {
    return <Desafios setScreen={setScreen} />;
  }

  if (screen === "Infos") {
    return <Infos setScreen={setScreen} />;
  }

  if (screen.startsWith("Perfil:")) {
    return (
      <PerfilConfiguracao
        type={screen.slice(7)}
        setScreen={setScreen}
      />
    );
  }

  return <Login setScreen={setScreen} setUsuario={setUsuario} />;
}
import { useState } from "react";
import AppNavigator from "../src/navigation/AppNavigator";

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

  return (
    <>
      {/* Firebase verifica se existe um usuário autenticado */}
      <AppNavigator
          setUsuario={setUsuario}
      />

      {screen === "Login" && (
        <Login
          setScreen={setScreen}
          setUsuario={setUsuario}
        />
      )}

      {screen === "Cadastro" && (
        <Cadastro setScreen={setScreen} />
      )}

      {screen === "RecuperarAcesso" && (
        <RecuperarAcesso setScreen={setScreen} />
      )}

      {screen === "RedefinirSenha" && (
        <RedefinirSenha setScreen={setScreen} />
      )}

      {screen === "CriarRelato" && (
        <CriarRelato
          setScreen={setScreen}
          usuario={usuario}
        />
      )}

      {screen === "RegistrarReciclagem" && (
        <RegistrarReciclagem setScreen={setScreen} />
      )}

      {screen === "Home" && (
        <Home setScreen={setScreen} />
      )}

      {screen === "MeuPerfil" && (
        <MeuPerfil setScreen={setScreen} />
      )}

      {screen === "Desafios" && (
        <Desafios setScreen={setScreen} />
      )}

      {screen === "Infos" && (
        <Infos setScreen={setScreen} />
      )}

      {screen.startsWith("Perfil:") && (
        <PerfilConfiguracao
          type={screen.slice(7)}
          setScreen={setScreen}
        />
      )}
    </>
  );
}
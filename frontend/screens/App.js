import { useEffect, useState } from "react";
import AppNavigator from "../src/navigation/AppNavigator";
import { API_URL } from "../src/services/api";

import Login from "./Login";
import Cadastro from "./Cadastro";
import RecuperarAcesso from "./RecuperarAcesso";
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
  const [dadosUsuario, setDadosUsuario] = useState(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(false);
  const [erroPerfil, setErroPerfil] = useState("");
  const [tentativaPerfil, setTentativaPerfil] = useState(0);

  useEffect(() => {
    let ativo = true;

    if (!usuario?.uid) {
      setDadosUsuario(null);
      setCarregandoPerfil(false);
      setErroPerfil("");
      return () => {
        ativo = false;
      };
    }

    async function carregarDadosUsuario() {
      setDadosUsuario(null);
      setErroPerfil("");
      setCarregandoPerfil(true);

      try {
        const response = await fetch(
          `${API_URL}/usuarios/firebase/${encodeURIComponent(usuario.uid)}`
        );
        const data = await response.json();

        if (response.status === 404) {
          if (ativo) {
            setErroPerfil(
              "Sua conta existe no Firebase, mas ainda não há um cadastro correspondente no EcoTrack."
            );
          }
          return;
        }

        if (!response.ok) {
          throw new Error(data.mensagem || "Não foi possível carregar seus dados.");
        }

        if (!data.usuario) {
          throw new Error("Os dados do usuário não foram encontrados.");
        }

        if (ativo) {
          setDadosUsuario(data.usuario);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error);
        if (ativo) {
          setErroPerfil(error.message || "Não foi possível carregar seus dados.");
        }
      } finally {
        if (ativo) {
          setCarregandoPerfil(false);
        }
      }
    }

    carregarDadosUsuario();

    return () => {
      ativo = false;
    };
  }, [usuario?.uid, tentativaPerfil]);

  function recarregarPerfil() {
    setTentativaPerfil((tentativaAtual) => tentativaAtual + 1);
  }

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

      {screen === "CriarRelato" && (
        <CriarRelato
          setScreen={setScreen}
          usuario={usuario}
          dadosUsuario={dadosUsuario}
        />
      )}

      {screen === "RegistrarReciclagem" && (
        <RegistrarReciclagem setScreen={setScreen} />
      )}

      {screen === "Home" && (
        <Home setScreen={setScreen} />
      )}

      {screen === "MeuPerfil" && (
        <MeuPerfil
          setScreen={setScreen}
          usuario={usuario}
          dadosUsuario={dadosUsuario}
          carregandoPerfil={carregandoPerfil}
          erroPerfil={erroPerfil}
          onRetry={recarregarPerfil}
        />
      )}

      {screen === "Desafios" && (
        <Desafios setScreen={setScreen} />
      )}

      {screen === "Infos" && (
        <Infos
          setScreen={setScreen}
          dadosUsuario={dadosUsuario}
          carregandoPerfil={carregandoPerfil}
          erroPerfil={erroPerfil}
        />
      )}

      {screen.startsWith("Perfil:") && (
        <PerfilConfiguracao
          type={screen.slice(7)}
          setScreen={setScreen}
          usuario={usuario}
          dadosUsuario={dadosUsuario}
          setDadosUsuario={setDadosUsuario}
          carregandoPerfil={carregandoPerfil}
          erroPerfil={erroPerfil}
          onRetry={recarregarPerfil}
        />
      )}
    </>
  );
}
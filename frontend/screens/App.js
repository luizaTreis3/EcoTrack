import { useEffect, useState } from "react";
import AppNavigator from "../src/navigation/AppNavigator";
import { API_URL } from "../src/services/api";
import {
  observePushNotification,
  registerPushToken,
} from "../src/services/pushNotifications";

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
import Notificacoes from "./Notificacoes";

export default function App() {
  const [screen, setScreen] = useState("Login");

  // Guarda os dados do usuário que está logado
  const [usuario, setUsuario] = useState(null);
  const [dadosUsuario, setDadosUsuario] = useState(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(false);
  const [erroPerfil, setErroPerfil] = useState("");
  const [tentativaPerfil, setTentativaPerfil] = useState(0);

  useEffect(() => observePushNotification(() => setScreen("Notificacoes")), []);

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

  useEffect(() => {
    const idUsuario = dadosUsuario?.id_usuario;
    if (!idUsuario || Number(dadosUsuario.deseja_notificacoes) !== 1) {
      return undefined;
    }

    let ativo = true;
    registerPushToken(idUsuario)
      .then((resultado) => {
        if (ativo && resultado.status === "eas-not-configured") {
          console.info("Push remoto pendente: configure o projeto EAS para habilitá-lo.");
        }
        if (ativo && resultado.status === "permission-denied") {
          console.info("Notificações push não autorizadas nas configurações do dispositivo.");
        }
      })
      .catch((error) => {
        console.error("Erro ao registrar notificações push:", error);
      });

    return () => {
      ativo = false;
    };
  }, [dadosUsuario?.id_usuario, dadosUsuario?.deseja_notificacoes]);

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
          carregandoPerfil={carregandoPerfil}
          erroPerfil={erroPerfil}
          onRetry={recarregarPerfil}
        />
      )}

      {screen === "RegistrarReciclagem" && (
        <RegistrarReciclagem
          setScreen={setScreen}
          dadosUsuario={dadosUsuario}
        />
      )}

      {screen === "Home" && (
        <Home
          setScreen={setScreen}
          dadosUsuario={dadosUsuario}
          carregandoPerfil={carregandoPerfil}
          erroPerfil={erroPerfil}
          onRetry={recarregarPerfil}
        />
      )}

      {screen === "MeuPerfil" && (
        <MeuPerfil
          setScreen={setScreen}
          usuario={usuario}
          dadosUsuario={dadosUsuario}
          setDadosUsuario={setDadosUsuario}
          carregandoPerfil={carregandoPerfil}
          erroPerfil={erroPerfil}
          onRetry={recarregarPerfil}
        />
      )}

      {screen === "Desafios" && (
        <Desafios setScreen={setScreen} dadosUsuario={dadosUsuario} />
      )}

      {screen === "Infos" && (
        <Infos
          setScreen={setScreen}
          dadosUsuario={dadosUsuario}
          carregandoPerfil={carregandoPerfil}
          erroPerfil={erroPerfil}
        />
      )}

      {screen === "Notificacoes" && (
        <Notificacoes
          setScreen={setScreen}
          dadosUsuario={dadosUsuario}
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
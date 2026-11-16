import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TabBar from "./TabBar";
import { API_URL } from "../src/services/api";

export default function Notificacoes({ setScreen, dadosUsuario }) {
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarNotificacoes() {
      if (!dadosUsuario?.id_usuario) {
        setNotificacoes([]);
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setErro("");

      try {
        const response = await fetch(
          `${API_URL}/notificacoes/${encodeURIComponent(dadosUsuario.id_usuario)}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.mensagem || "Não foi possível carregar as notificações.");
        }

        if (ativo) {
          setNotificacoes(Array.isArray(data.notificacoes) ? data.notificacoes : []);
        }
      } catch (error) {
        console.error("Erro ao carregar notificações:", error);
        if (ativo) {
          setErro(error.message || "Não foi possível carregar as notificações.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarNotificacoes();
    const intervalo = dadosUsuario?.id_usuario
      ? setInterval(carregarNotificacoes, 30000)
      : null;

    return () => {
      ativo = false;
      if (intervalo) {
        clearInterval(intervalo);
      }
    };
  }, [dadosUsuario?.id_usuario]);

  async function marcarComoLida(idNotificacao) {
    try {
      const response = await fetch(
        `${API_URL}/usuarios/${encodeURIComponent(dadosUsuario.id_usuario)}`
          + `/notificacoes/${encodeURIComponent(idNotificacao)}/ler`,
        { method: "PUT" }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || "Não foi possível atualizar a notificação.");
      }

      setNotificacoes((anteriores) =>
        anteriores.map((item) =>
          item.id_notificacao === idNotificacao ? { ...item, lida: 1 } : item
        )
      );
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      setErro(error.message || "Não foi possível atualizar a notificação.");
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => setScreen("Home")} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color="#22c55e" />
        </Pressable>
        <Text style={styles.title}>Notificações</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {carregando ? (
          <Text style={styles.message}>Carregando notificações...</Text>
        ) : erro ? (
          <Text style={styles.error}>{erro}</Text>
        ) : notificacoes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="notifications-off-outline" size={28} color="#22c55e" />
            <Text style={styles.emptyTitle}>Nenhuma notificação ainda</Text>
            <Text style={styles.message}>
              Atualizações dos seus relatos e dos pontos que você acompanha aparecerão aqui.
            </Text>
          </View>
        ) : (
          notificacoes.map((item) => {
            const lida = Number(item.lida) === 1;
            const data = item.data_notificacao
              ? new Date(item.data_notificacao).toLocaleString("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })
              : "";

            return (
              <View
                key={item.id_notificacao}
                style={[styles.card, !lida && styles.unreadCard]}
              >
                <View style={styles.iconWrap}>
                  <Ionicons
                    name={lida ? "notifications-outline" : "notifications"}
                    size={20}
                    color="#22c55e"
                  />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.titulo}</Text>
                  <Text style={styles.cardMessage}>{item.mensagem}</Text>
                  <Text style={styles.date}>{data}</Text>
                  {!lida && (
                    <Pressable
                      onPress={() => marcarComoLida(item.id_notificacao)}
                      style={styles.readButton}
                    >
                      <Text style={styles.readButtonText}>Marcar como lida</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <TabBar active="" setScreen={setScreen} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161515",
  },
  header: {
    paddingTop: 65,
    paddingBottom: 18,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#e5e5e5",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSpacer: {
    width: 26,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 115,
  },
  card: {
    flexDirection: "row",
    padding: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1d1d1d",
  },
  unreadCard: {
    borderColor: "#166534",
    backgroundColor: "#172019",
  },
  iconWrap: {
    width: 36,
    height: 36,
    marginRight: 12,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f2e1a",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: "#e5e5e5",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
  },
  cardMessage: {
    color: "#c5c5c5",
    fontSize: 13,
    lineHeight: 19,
  },
  date: {
    color: "#8a8a8a",
    fontSize: 11,
    marginTop: 8,
  },
  readButton: {
    alignSelf: "flex-start",
    marginTop: 10,
  },
  readButtonText: {
    color: "#22c55e",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyCard: {
    alignItems: "center",
    padding: 24,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 14,
    backgroundColor: "#1d1d1d",
  },
  emptyTitle: {
    color: "#e5e5e5",
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 6,
  },
  message: {
    color: "#999",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
  },
  error: {
    color: "#fca5a5",
    fontSize: 13,
    lineHeight: 19,
  },
});

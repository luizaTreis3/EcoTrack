import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TabBar from "./TabBar";
import { API_URL } from "../src/services/api";
import { getImageUrl } from "../src/services/imageStorage";
import { scheduleTestNotification } from "../src/services/localNotifications";
import EcopontosMap from "./EcopontosMap";

const categoriasEcoponto = [
  { nome: "Todas", icon: "reload-outline", cor: "#22c55e", termos: [] },
  { nome: "Papel", icon: "document-text-outline", cor: "#3b82f6", termos: ["papel", "materiais recicláveis"] },
  { nome: "Plástico", icon: "flask-outline", cor: "#ef4444", termos: ["plástico", "materiais recicláveis"] },
  { nome: "Vidro", icon: "wine-outline", cor: "#166534", termos: ["vidro", "materiais recicláveis"] },
  { nome: "Metal", icon: "hardware-chip-outline", cor: "#facc15", termos: ["metal", "ferro", "sucata", "materiais recicláveis"] },
  { nome: "Entulho", icon: "construct-outline", cor: "#f97316", termos: ["entulho", "caliça", "cerâmica", "terra"] },
  { nome: "Móveis", icon: "bed-outline", cor: "#a78bfa", termos: ["móveis", "colchões"] },
  { nome: "Madeira", icon: "hammer-outline", cor: "#b45309", termos: ["madeiras"] },
  { nome: "Galhos e podas", icon: "leaf-outline", cor: "#22c55e", termos: ["galhos", "jardinagem"] },
  { nome: "Pneus", icon: "ellipse-outline", cor: "#94a3b8", termos: ["pneus"] },
  { nome: "Eletrodomésticos", icon: "tv-outline", cor: "#38bdf8", termos: ["eletrodomésticos"] },
  { nome: "Resíduos domésticos", icon: "home-outline", cor: "#fb923c", termos: ["resíduos domésticos"] },
  { nome: "Recicláveis", icon: "repeat-outline", cor: "#34d399", termos: ["materiais recicláveis"] },
];

function pontoAceitaCategoria(ponto, categoria) {
  if (categoria === "Todas") {
    return true;
  }

  const termos = categoriasEcoponto.find((item) => item.nome === categoria)?.termos || [];
  const residuosAceitos = String(ponto.tipo_residuo || "").toLowerCase();

  return termos.some((termo) => residuosAceitos.includes(termo));
}

export default function Infos({ setScreen, dadosUsuario, carregandoPerfil, erroPerfil,
}) {
  const [categoriaEcopontoAtiva, setCategoriaEcopontoAtiva] = useState("Todas");
  const [mapaExpandido, setMapaExpandido] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [relatos, setRelatos] = useState([]);
  const [relatoSelecionado, setRelatoSelecionado] = useState(null);
  const [carregandoRelatos, setCarregandoRelatos] = useState(false);
  const [erroRelatos, setErroRelatos] = useState("");
  const [pontosColeta, setPontosColeta] = useState([]);
  const [carregandoPontos, setCarregandoPontos] = useState(false);
  const [erroPontos, setErroPontos] = useState("");
  const [erroAcompanhamento, setErroAcompanhamento] = useState("");
  const [buscaPonto, setBuscaPonto] = useState("");
  const [pontoAtualizando, setPontoAtualizando] = useState(null);
  const [testandoNotificacao, setTestandoNotificacao] = useState(false);
  const [bairroColeta, setBairroColeta] = useState("");
  const [bairroDigitado, setBairroDigitado] = useState("");
  const [salvandoBairro, setSalvandoBairro] = useState(false);
  const [agendasColeta, setAgendasColeta] = useState([]);
  const [carregandoAgenda, setCarregandoAgenda] = useState(false);
  const [erroAgenda, setErroAgenda] = useState("");

  useEffect(() => {
    const bairroSalvo = dadosUsuario?.bairro_coleta || "";
    setBairroColeta(bairroSalvo);
    setBairroDigitado(bairroSalvo);
  }, [dadosUsuario?.id_usuario, dadosUsuario?.bairro_coleta]);

  useEffect(() => {
    let ativo = true;

    async function carregarAgenda() {
      if (!bairroColeta) {
        setAgendasColeta([]);
        setErroAgenda("");
        return;
      }

      setCarregandoAgenda(true);
      setErroAgenda("");

      try {
        const response = await fetch(
          `${API_URL}/coleta-seletiva?bairro=${encodeURIComponent(bairroColeta)}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.mensagem || "Não foi possível carregar o cronograma.");
        }

        if (ativo) {
          setAgendasColeta(Array.isArray(data.agendas) ? data.agendas : []);
        }
      } catch (error) {
        console.error("Erro ao carregar cronograma da coleta:", error);
        if (ativo) {
          setErroAgenda(error.message || "Não foi possível carregar o cronograma.");
        }
      } finally {
        if (ativo) {
          setCarregandoAgenda(false);
        }
      }
    }

    carregarAgenda();

    return () => {
      ativo = false;
    };
  }, [bairroColeta]);

  async function testarNotificacaoLocal() {
    setTestandoNotificacao(true);

    try {
      await scheduleTestNotification();
    } catch (error) {
      console.error("Erro ao testar notificação local:", error);
      Alert.alert(
        "Não foi possível enviar a notificação",
        error.message || "Verifique a permissão de notificações e tente novamente."
      );
    } finally {
      setTestandoNotificacao(false);
    }
  }

  useEffect(() => {
    let ativo = true;
    const idUsuario = dadosUsuario?.id_usuario;

    if (!idUsuario) {
      setRelatos([]);
      setErroRelatos("");
      setCarregandoRelatos(false);
      return () => {
        ativo = false;
      };
    }

    async function carregarRelatos() {
      setCarregandoRelatos(true);
      setErroRelatos("");

      try {
        const response = await fetch(
          `${API_URL}/usuarios/${encodeURIComponent(idUsuario)}/relatos`
        );
        const contentType = response.headers.get("content-type") || "";

        if (!contentType.toLowerCase().includes("application/json")) {
          const mensagem = response.status === 404
            ? "A rota de relatos não foi encontrada no backend. Reinicie o servidor do backend e tente novamente."
            : "O backend retornou uma resposta inesperada ao carregar seus relatos.";
          throw new Error(mensagem);
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.mensagem || "Não foi possível carregar seus relatos.");
        }

        if (ativo) {
          setRelatos(Array.isArray(data.relatos) ? data.relatos : []);
        }
      } catch (error) {
        console.error("Erro ao carregar relatos do usuário:", error);
        if (ativo) {
          setErroRelatos(error.message || "Não foi possível carregar seus relatos.");
        }
      } finally {
        if (ativo) {
          setCarregandoRelatos(false);
        }
      }
    }

    carregarRelatos();

    return () => {
      ativo = false;
    };
  }, [dadosUsuario?.id_usuario]);

  useEffect(() => {
    let ativo = true;
    const idUsuario = dadosUsuario?.id_usuario;

    async function carregarPontosColeta() {
      setCarregandoPontos(true);
      setErroPontos("");

      try {
        const query = idUsuario
          ? `?id_usuario=${encodeURIComponent(idUsuario)}`
          : "";
        const response = await fetch(`${API_URL}/pontos-coleta${query}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.mensagem || "Não foi possível carregar os pontos de entrega.");
        }

        if (ativo) {
          setPontosColeta(Array.isArray(data.pontos) ? data.pontos : []);
        }
      } catch (error) {
        console.error("Erro ao carregar pontos de coleta:", error);
        if (ativo) {
          setErroPontos(error.message || "Não foi possível carregar os pontos de entrega.");
        }
      } finally {
        if (ativo) {
          setCarregandoPontos(false);
        }
      }
    }

    carregarPontosColeta();

    return () => {
      ativo = false;
    };
  }, [dadosUsuario?.id_usuario]);

  async function atualizarBairroColeta(bairro) {
    const idUsuario = dadosUsuario?.id_usuario;
    if (!idUsuario) {
      Alert.alert("Atenção", "Entre na sua conta para acompanhar a coleta do bairro.");
      return;
    }

    setSalvandoBairro(true);
    setErroAgenda("");

    try {
      const response = await fetch(
        `${API_URL}/usuarios/${encodeURIComponent(idUsuario)}/bairro-coleta`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bairro_coleta: bairro }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || "Não foi possível atualizar o acompanhamento da coleta.");
      }

      const bairroSalvo = data.bairro_coleta || "";
      setBairroColeta(bairroSalvo);
      setBairroDigitado(bairroSalvo);
      if (!bairroSalvo) {
        setAgendasColeta([]);
      }
    } catch (error) {
      console.error("Erro ao atualizar acompanhamento da coleta:", error);
      setErroAgenda(error.message || "Não foi possível atualizar o acompanhamento da coleta.");
    } finally {
      setSalvandoBairro(false);
    }
  }

  async function salvarBairroColeta() {
    const bairro = bairroDigitado.trim();

    if (!bairro) {
      setErroAgenda("Informe o bairro da sua residência.");
      return;
    }
    if (bairro.length > 100) {
      setErroAgenda("O bairro deve ter no máximo 100 caracteres.");
      return;
    }

    await atualizarBairroColeta(bairro);
  }

  async function pararAcompanharColeta() {
    await atualizarBairroColeta("");
  }

  async function alterarAcompanhamento(ponto) {
    const idUsuario = dadosUsuario?.id_usuario;
    if (!idUsuario) {
      Alert.alert("Atenção", "Entre na sua conta para acompanhar pontos de entrega.");
      return;
    }

    setPontoAtualizando(ponto.id_ponto);
    setErroAcompanhamento("");

    try {
      const response = await fetch(
        `${API_URL}/usuarios/${encodeURIComponent(idUsuario)}`
          + `/pontos-coleta/${encodeURIComponent(ponto.id_ponto)}/acompanhamento`,
        { method: ponto.acompanhando ? "DELETE" : "PUT" }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || "Não foi possível atualizar o acompanhamento.");
      }

      setPontosColeta((anteriores) =>
        anteriores.map((item) =>
          String(item.id_ponto) === String(ponto.id_ponto)
            ? { ...item, acompanhando: !ponto.acompanhando }
            : item
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar acompanhamento do ponto:", error);
      setErroAcompanhamento(error.message || "Não foi possível atualizar o acompanhamento.");
    } finally {
      setPontoAtualizando(null);
    }
  }

  async function abrirEmailEcoponto(email) {
    try {
      await Linking.openURL(`mailto:${email}`);
    } catch (error) {
      console.error("Erro ao abrir o e-mail do Ecoponto:", error);
      Alert.alert("Erro", "Não foi possível abrir o aplicativo de e-mail.");
    }
  }

  const menuItems = [
    { label: "Início", screen: "Home", icon: "home-outline" },
    { label: "Infos", screen: "Infos", icon: "newspaper-outline" },
    { label: "Desafios", screen: "Desafios", icon: "trophy-outline" },
    { label: "Relato", screen: "CriarRelato", icon: "create-outline" },
    { label: "Notificações", screen: "Notificacoes", icon: "notifications-outline" },
    { label: "Perfil", screen: "MeuPerfil", icon: "person-outline" },
  ];

  const pontosDaCategoria = pontosColeta.filter((ponto) =>
    pontoAceitaCategoria(ponto, categoriaEcopontoAtiva)
  );

  const pontosFiltrados = pontosDaCategoria.filter((ponto) =>
    `${ponto.nome} ${ponto.endereco} ${ponto.tipo_residuo}`
      .toLowerCase()
      .includes(buscaPonto.trim().toLowerCase())
  );
  const jaAcompanhaBairroDigitado = Boolean(bairroColeta)
    && bairroDigitado.trim().toLowerCase() === bairroColeta.trim().toLowerCase();

  return (
    <View style={styles.container}>
      {menuOpen && (
        <Pressable style={styles.menuOverlay} onPress={() => setMenuOpen(false)}>
          <View style={styles.menuSheet}>
            {menuItems.map((item) => (
              <Pressable
                key={item.label}
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  setScreen(item.screen);
                }}
              >
                <Ionicons name={item.icon} size={18} color="#22c55e" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      )}

      <View style={styles.header}>
        <Pressable onPress={() => setScreen("Home")}>
          <Ionicons name="chevron-back" size={26} color="#22c55e" />
        </Pressable>

        <Text style={{ fontWeight: "bold", fontSize: 20, color: "#e5e5e5" }}>
          Infos
        </Text>

        <Pressable onPress={() => setMenuOpen((prev) => !prev)} hitSlop={12} style={styles.menuButton}>
          <Ionicons name="menu" size={26} color="#22c55e" />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Tudo o que você precisa para cuidar da cidade
        </Text>

        <View style={styles.notificationTestCard}>
          <View style={styles.notificationTestText}>
            <Text style={styles.notificationTestTitle}>Testar notificações</Text>
            <Text style={styles.mapDescription}>
              Envia uma notificação local de teste para este dispositivo.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enviar notificação local de teste"
            disabled={testandoNotificacao}
            onPress={testarNotificacaoLocal}
            style={[
              styles.notificationTestButton,
              testandoNotificacao && styles.notificationTestButtonDisabled,
            ]}
          >
            <Ionicons name="notifications-outline" size={18} color="#0b0b0b" />
            <Text style={styles.notificationTestButtonText}>
              {testandoNotificacao ? "Enviando..." : "Testar"}
            </Text>
          </Pressable>
        </View>

        {/* Card do mapa */}
        <View style={styles.mapCard}>
          <View style={styles.mapVisual}>
            {carregandoPontos ? (
              <View style={styles.mapLoading}>
                <Text style={styles.mapLoadingText}>Carregando os Ecopontos...</Text>
              </View>
            ) : erroPontos ? (
              <View style={styles.mapLoading}>
                <Text style={styles.mapLoadingText}>Não foi possível carregar o mapa.</Text>
              </View>
            ) : (
              <EcopontosMap pontos={pontosDaCategoria} expanded={mapaExpandido} />
            )}
          </View>

          <Text style={styles.mapLabel}>Mapa interativo</Text>
          <Text style={styles.mapTitle}>Ecopontos de São Leopoldo</Text>
          <Text style={styles.mapDescription}>
            Localize os três Ecopontos oficiais da cidade.
          </Text>

          <Pressable
            style={styles.mapButton}
            onPress={() => setMapaExpandido((expandido) => !expandido)}
            accessibilityRole="button"
            accessibilityState={{ expanded: mapaExpandido }}
            accessibilityLabel={mapaExpandido ? "Recolher mapa" : "Expandir mapa e ver todos os Ecopontos"}
          >
            <Text style={styles.mapButtonText}>
              {mapaExpandido ? "Ver menos" : "Ver todos"}
            </Text>
            <Ionicons
              name={mapaExpandido ? "chevron-up" : "chevron-forward"}
              size={16}
              color="#000"
            />
          </Pressable>
        </View>

        {/* Meus relatos */}
        <Text style={[styles.sectionTitle, styles.meusRelatosTitle]}>
          Meus relatos
        </Text>

        {carregandoPerfil || carregandoRelatos ? (
          <Text style={styles.relatoEmpty}>Carregando seus relatos...</Text>
        ) : erroPerfil ? (
          <Text style={styles.relatoError}>{erroPerfil}</Text>
        ) : erroRelatos ? (
          <Text style={styles.relatoError}>{erroRelatos}</Text>
        ) : relatos.length === 0 ? (
          <View style={styles.relatoEmptyCard}>
            <Text style={styles.relatoEmpty}>
              Você ainda não criou nenhum relato.
            </Text>
            <Pressable
              style={styles.criarRelatoButton}
              onPress={() => setScreen("CriarRelato")}
            >
              <Text style={styles.criarRelatoButtonText}>Criar relato</Text>
            </Pressable>
          </View>
        ) : relatos.map((item) => {
          const dataRelato = item.data_criacao
            ? new Date(item.data_criacao).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              })
            : "";
          const statusRelato = {
            Pendente: {
              icon: "time",
              iconColor: "#facc15",
              backgroundColor: "#2e270f",
              color: "#facc15",
            },
            "Em análise": {
              icon: "search",
              iconColor: "#3b82f6",
              backgroundColor: "#0f1f2e",
              color: "#3b82f6",
            },
            Resolvido: {
              icon: "checkmark-circle",
              iconColor: "#22c55e",
              backgroundColor: "#0f2e1a",
              color: "#22c55e",
            },
          }[item.status] || {
            icon: "time",
            iconColor: "#facc15",
            backgroundColor: "#2e270f",
            color: "#facc15",
          };

          return (
          <Pressable
            key={item.id_relato}
            style={styles.relatoCard}
            onPress={() => setRelatoSelecionado(item)}
            accessibilityRole="button"
            accessibilityLabel={`Ver detalhes do relato: ${item.titulo}`}
          >
            {item.imagem ? (
              <RelatoImage caminho={item.imagem} />
            ) : (
              <Ionicons
                name={statusRelato.icon}
                size={22}
                color={statusRelato.iconColor}
                style={{ marginRight: 12 }}
              />
            )}

            <View style={styles.relatoInfo}>
              <Text style={styles.relatoTitle}>{item.titulo}</Text>

              <View style={styles.relatoLine}>
                <Ionicons name="location-outline" size={12} color="#8a8a8a" />
                <Text style={styles.relatoText}>
                  {item.endereco} · {item.bairro}
                </Text>
              </View>

              <View style={styles.relatoLine}>
                <Ionicons name="time-outline" size={12} color="#8a8a8a" />
                <Text style={styles.relatoText}>{dataRelato}</Text>
              </View>
            </View>

            <View style={styles.relatoRight}>
              <View style={[styles.statusBadge, { backgroundColor: statusRelato.backgroundColor }]}>
                <Text style={[styles.statusText, { color: statusRelato.color }]}>
                  {item.status || "Pendente"}
                </Text>
              </View>
              <Text style={styles.verRelatoText}>Ver relato</Text>
              <Ionicons name="chevron-forward" size={16} color="#8a8a8a" style={{ marginTop: 8 }} />
            </View>
          </Pressable>
          );
        })}

        <Text style={styles.sectionTitle}>Acompanhar coleta seletiva por bairro</Text>
        <Text style={styles.mapDescription}>
          Acompanhe seu bairro para consultar os dias e turnos da coleta e receber lembretes.
        </Text>

        <View style={styles.bairroColetaRow}>
          <TextInput
            value={bairroDigitado}
            onChangeText={setBairroDigitado}
            placeholder="Ex.: Campestre, Centro ou Feitoria"
            placeholderTextColor="#8a8a8a"
            style={styles.bairroColetaInput}
            accessibilityLabel="Bairro da coleta seletiva"
            maxLength={100}
            editable={!salvandoBairro}
          />
          <Pressable
            onPress={salvarBairroColeta}
            disabled={
              salvandoBairro
              || jaAcompanhaBairroDigitado
            }
            style={[
              styles.bairroColetaButton,
              salvandoBairro && styles.bairroColetaButtonDisabled,
              jaAcompanhaBairroDigitado && styles.bairroColetaButtonActive,
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              jaAcompanhaBairroDigitado
                ? `Acompanhando coleta em ${bairroColeta}`
                : bairroColeta
                  ? "Atualizar bairro acompanhado"
                  : "Acompanhar coleta neste bairro"
            }
          >
            <Text
              style={[
                styles.bairroColetaButtonText,
                jaAcompanhaBairroDigitado && styles.bairroColetaButtonTextActive,
              ]}
            >
              {salvandoBairro
                ? "Salvando..."
                : jaAcompanhaBairroDigitado
                  ? "Acompanhando"
                  : bairroColeta
                    ? "Atualizar"
                  : "Acompanhar"}
            </Text>
          </Pressable>
        </View>

        {bairroColeta ? (
          <View style={styles.collectionFollowRow}>
            <View style={styles.collectionFollowStatus}>
              <Ionicons name="notifications" size={16} color="#22c55e" />
              <Text style={styles.collectionFollowText}>
                Acompanhando a coleta em {bairroColeta}
              </Text>
            </View>
            <Pressable
              onPress={pararAcompanharColeta}
              disabled={salvandoBairro}
              accessibilityRole="button"
              accessibilityLabel={`Parar de acompanhar a coleta em ${bairroColeta}`}
              style={styles.collectionStopButton}
            >
              <Text style={styles.collectionStopText}>
                {salvandoBairro ? "Salvando..." : "Parar"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable
          style={[styles.sourceLink, styles.coletaSourceLink]}
          onPress={() =>
            Linking.openURL("https://www.saoleopoldo.rs.gov.br/conteudo/4303/1/1722?titulo=COLETA+SELETIVA")
              .catch((error) => {
                console.error("Erro ao abrir a fonte municipal da coleta:", error);
                Alert.alert("Erro", "Não foi possível abrir a página da Prefeitura.");
              })
          }
        >
          <Ionicons name="open-outline" size={15} color="#22c55e" />
          <Text style={styles.sourceLinkText}>Fonte municipal da coleta seletiva</Text>
        </Pressable>

        {erroAgenda ? (
          <Text style={styles.relatoError}>{erroAgenda}</Text>
        ) : null}
        {carregandoAgenda ? (
          <Text style={styles.relatoEmpty}>Buscando os dias de coleta...</Text>
        ) : bairroColeta && !erroAgenda && agendasColeta.length === 0 ? (
          <Text style={styles.relatoEmpty}>
            Não encontramos esse bairro no cronograma. Confira a grafia ou consulte a fonte municipal.
          </Text>
        ) : (
          agendasColeta.map((agenda) => (
            <View key={agenda.id_agenda} style={styles.agendaCard}>
              <View style={styles.agendaHeader}>
                <View style={styles.agendaIcon}>
                  <Ionicons name="calendar-outline" size={18} color="#22c55e" />
                </View>
                <View style={styles.agendaHeaderText}>
                  <Text style={styles.agendaDay}>
                    {["", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][agenda.dia_semana]}
                    {" · "}{agenda.turno}
                  </Text>
                  <Text style={styles.agendaCooperativa}>{agenda.cooperativa}</Text>
                </View>
                <Text style={styles.agendaHours}>
                  {agenda.turno === "Manhã" ? "07h–12h" : "13h–18h"}
                </Text>
              </View>
              <Text style={styles.agendaAreas}>{agenda.areas_coleta}</Text>
            </View>
          ))
        )}

        {bairroColeta ? (
          <Text style={styles.collectionReminderNote}>
            {Number(dadosUsuario?.deseja_notificacoes) === 1
              ? "Com as notificações do perfil ativadas, você receberá um lembrete no turno da coleta do seu bairro."
              : "Ative as notificações em Perfil > Notificações para receber um lembrete no turno da coleta."}
          </Text>
        ) : null}

        <Text style={[styles.sectionTitle, styles.ecopontoTitle]}>Ecopontos de São Leopoldo</Text>
        <Text style={styles.mapDescription}>
          Acompanhe um ponto para receber avisos quando as informações dele forem atualizadas.
        </Text>

        <Pressable
          style={styles.sourceLink}
          onPress={() =>
            Linking.openURL("https://www.saoleopoldo.rs.gov.br/conteudo/1722/1?titulo=SERVI%C3%87OS+URBANOS")
              .catch((error) => {
                console.error("Erro ao abrir a fonte municipal dos Ecopontos:", error);
                Alert.alert("Erro", "Não foi possível abrir a página da Prefeitura.");
              })
          }
        >
          <Ionicons name="open-outline" size={15} color="#22c55e" />
          <Text style={styles.sourceLinkText}>Consultar informações oficiais</Text>
        </Pressable>

        <View style={styles.scheduleNotice}>
          <Text style={styles.scheduleNoticeText}>
            Os materiais aceitos variam por Ecoponto. Confira a lista de cada unidade antes de levar os resíduos.
          </Text>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Filtrar por categoria</Text>
          <Pressable
            style={styles.sortRow}
            onPress={() => setCategoriaEcopontoAtiva("Todas")}
            accessibilityRole="button"
            accessibilityLabel="Mostrar Ecopontos de todas as categorias"
          >
            <Text style={styles.sortText}>Ver todas</Text>
            <Ionicons name="chevron-forward" size={14} color="#22c55e" />
          </Pressable>
        </View>
        <Text style={styles.mapDescription}>
          Escolha um material para ver os Ecopontos que o recebem.
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          directionalLockEnabled
          style={{ marginBottom: 16 }}
        >
          {categoriasEcoponto.map((categoria) => {
            const quantidade = pontosColeta.filter((ponto) =>
              pontoAceitaCategoria(ponto, categoria.nome)
            ).length;
            const ativa = categoriaEcopontoAtiva === categoria.nome;

            return (
              <Pressable
                key={categoria.nome}
                onPress={() => setCategoriaEcopontoAtiva(categoria.nome)}
                style={[
                  styles.categoryChip,
                  ativa && styles.categoryChipActive,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: ativa }}
                accessibilityLabel={`${categoria.nome}: ${quantidade} Ecopontos`}
              >
                <Ionicons
                  name={categoria.icon}
                  size={22}
                  color={categoria.cor}
                />
                <Text
                  style={[
                    styles.categoryText,
                    ativa && styles.categoryTextActive,
                  ]}
                >
                  {categoria.nome}
                </Text>
                <Text style={styles.categoryQtd}>{quantidade}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#8a8a8a" style={{ marginRight: 8 }} />
            <TextInput
              value={buscaPonto}
              onChangeText={setBuscaPonto}
              placeholder="Buscar Ecoponto ou bairro..."
              placeholderTextColor="#8a8a8a"
              style={styles.searchInput}
            />
          </View>
        </View>

        {erroAcompanhamento ? (
          <Text style={styles.relatoError}>{erroAcompanhamento}</Text>
        ) : null}
        {carregandoPontos ? (
          <Text style={styles.relatoEmpty}>Carregando pontos de entrega...</Text>
        ) : erroPontos ? (
          <Text style={styles.relatoError}>{erroPontos}</Text>
        ) : pontosFiltrados.length === 0 ? (
          <Text style={styles.relatoEmpty}>
            Nenhum Ecoponto encontrado para essa categoria ou busca. Toque em “Ver todas” para remover o filtro.
          </Text>
        ) : (
          pontosFiltrados.map((ponto) => (
            <View key={ponto.id_ponto} style={styles.pontoCard}>
              <View style={styles.pontoIcon}>
                <Ionicons name="location" size={20} color="#22c55e" />
              </View>
              <View style={styles.pontoInfo}>
                <Text style={styles.pontoNome}>{ponto.nome}</Text>
                <Text style={styles.pontoDescricao}>{ponto.endereco}</Text>
                {String(ponto.tipo_residuo || "")
                  .split(";")
                  .map((residuo) => residuo.trim())
                  .filter(Boolean)
                  .map((residuo, index) => (
                    <Text key={`${ponto.id_ponto}-residuo-${index}`} style={styles.pontoDescricao}>
                      {residuo}
                    </Text>
                  ))}
                {ponto.horario_funcionamento ? (
                  <Text style={styles.pontoHorario}>{ponto.horario_funcionamento}</Text>
                ) : null}
                {ponto.telefone ? (
                  <Text style={styles.pontoDescricao}>Contato: {ponto.telefone}</Text>
                ) : null}
                {ponto.email ? (
                  <Pressable
                    onPress={() => abrirEmailEcoponto(ponto.email)}
                    accessibilityRole="link"
                    accessibilityLabel={`Enviar e-mail para ${ponto.email}`}
                  >
                    <Text style={styles.pontoEmail}>E-mail: {ponto.email}</Text>
                  </Pressable>
                ) : null}
                {ponto.descricao ? (
                  <Text style={styles.pontoDescricao}>{ponto.descricao}</Text>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  disabled={pontoAtualizando !== null}
                  onPress={() => alterarAcompanhamento(ponto)}
                  style={[
                    styles.followButton,
                    ponto.acompanhando && styles.followButtonActive,
                  ]}
                >
                  <Ionicons
                    name={ponto.acompanhando ? "notifications" : "notifications-outline"}
                    size={16}
                    color={ponto.acompanhando ? "#0b0b0b" : "#22c55e"}
                  />
                  <Text
                    style={[
                      styles.followButtonText,
                      ponto.acompanhando && styles.followButtonTextActive,
                    ]}
                  >
                    {pontoAtualizando === ponto.id_ponto
                      ? "Salvando..."
                      : ponto.acompanhando
                        ? "Acompanhando"
                        : "Acompanhar ponto"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <TabBar active="Infos" setScreen={setScreen} />
      <Modal
        visible={Boolean(relatoSelecionado)}
        transparent
        animationType="fade"
        onRequestClose={() => setRelatoSelecionado(null)}
      >
        <View style={styles.relatoModalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setRelatoSelecionado(null)}
            accessibilityRole="button"
            accessibilityLabel="Fechar detalhes do relato"
          />
          <View style={styles.relatoModalCard}>
            <View style={styles.relatoModalHeader}>
              <Text style={styles.relatoModalTitle}>Detalhes do relato</Text>
              <Pressable
                onPress={() => setRelatoSelecionado(null)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Fechar detalhes"
              >
                <Ionicons name="close" size={24} color="#e5e5e5" />
              </Pressable>
            </View>
            {relatoSelecionado ? (
              <ScrollView
                contentContainerStyle={styles.relatoModalContent}
                showsVerticalScrollIndicator={false}
              >
                {relatoSelecionado.imagem ? (
                  <RelatoImage
                    caminho={relatoSelecionado.imagem}
                    style={styles.relatoDetailImage}
                  />
                ) : null}
                <Text style={styles.relatoDetailName}>
                  {relatoSelecionado.titulo}
                </Text>
                <View style={styles.relatoDetailField}>
                  <Text style={styles.relatoDetailLabel}>Status</Text>
                  <Text style={styles.relatoDetailValue}>
                    {relatoSelecionado.status || "Pendente"}
                  </Text>
                </View>
                <View style={styles.relatoDetailField}>
                  <Text style={styles.relatoDetailLabel}>Categoria</Text>
                  <Text style={styles.relatoDetailValue}>
                    {relatoSelecionado.categoria || "Não informada"}
                  </Text>
                </View>
                <View style={styles.relatoDetailField}>
                  <Text style={styles.relatoDetailLabel}>Endereço</Text>
                  <Text style={styles.relatoDetailValue}>
                    {[relatoSelecionado.endereco, relatoSelecionado.bairro]
                      .filter(Boolean)
                      .join(" · ") || "Não informado"}
                  </Text>
                </View>
                <View style={styles.relatoDetailField}>
                  <Text style={styles.relatoDetailLabel}>Data</Text>
                  <Text style={styles.relatoDetailValue}>
                    {relatoSelecionado.data_criacao
                      ? new Date(relatoSelecionado.data_criacao).toLocaleString("pt-BR")
                      : "Não informada"}
                  </Text>
                </View>
                <View style={styles.relatoDetailField}>
                  <Text style={styles.relatoDetailLabel}>Descrição</Text>
                  <Text style={styles.relatoDetailValue}>
                    {relatoSelecionado.descricao || "Sem descrição"}
                  </Text>
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function RelatoImage({ caminho, style }) {
  const [uri, setUri] = useState(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;

    getImageUrl(caminho)
      .then((downloadUrl) => {
        if (ativo) {
          setUri(downloadUrl);
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar imagem do relato:", error);
        if (ativo) {
          setErro(true);
        }
      });

    return () => {
      ativo = false;
    };
  }, [caminho]);

  if (erro) {
    return (
      <View style={[styles.relatoThumbnail, style]}>
        <Text style={styles.relatoImageError}>Imagem indisponível</Text>
      </View>
    );
  }

  return uri ? (
    <Image
      source={{ uri }}
      style={[styles.relatoThumbnail, style]}
      accessibilityLabel="Imagem do relato"
      onError={(event) => {
        console.error(
          "Erro ao exibir imagem do relato:",
          event.nativeEvent.error
        );
        setErro(true);
      }}
    />
  ) : (
    <View style={[styles.relatoThumbnail, style]}>
      <Ionicons name="image-outline" size={20} color="#8a8a8a" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161515",
  },

  header: {
    width: "100%",
    paddingTop: 75,
    paddingBottom: 15,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  menuButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  menuOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    zIndex: 30,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 90,
    paddingRight: 18,
  },

  menuSheet: {
    width: 180,
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 14,
    overflow: "hidden",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },

  menuItemText: {
    color: "#e5e5e5",
    fontSize: 14,
    fontWeight: "600",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },

  subtitle: {
    color: "#8a8a8a",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
  },

  notificationTestCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    marginBottom: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2a4b34",
    backgroundColor: "#142018",
  },

  notificationTestText: {
    flex: 1,
    marginRight: 10,
  },

  notificationTestTitle: {
    color: "#e5e5e5",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },

  notificationTestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: "#22c55e",
  },

  notificationTestButtonDisabled: {
    opacity: 0.6,
  },

  notificationTestButtonText: {
    color: "#0b0b0b",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },

  mapCard: {
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
    overflow: "hidden",
  },

  mapVisual: {
    backgroundColor: "#0f1f14",
    borderRadius: 12,
    marginBottom: 14,
    overflow: "hidden",
  },

  mapLoading: {
    height: 130,
    alignItems: "center",
    justifyContent: "center",
  },

  mapLoadingText: {
    color: "#a5a5a5",
    fontSize: 12,
  },

  mapLabel: {
    color: "#22c55e",
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 4,
  },

  mapTitle: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 6,
  },

  mapDescription: {
    color: "#8a8a8a",
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 16,
  },

  mapButton: {
    backgroundColor: "#22c55e",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 20,
  },

  mapButtonText: {
    color: "#000",
    fontWeight: "bold",
    marginRight: 4,
  },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 15,
  },

  meusRelatosTitle: {
    marginTop: 16,
    marginBottom: 14,
  },

  sortRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  sortText: {
    color: "#22c55e",
    fontSize: 12,
    marginRight: 2,
  },

  categoryChip: {
    width: 76,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 12,
    paddingVertical: 14,
    marginRight: 10,
  },

  categoryChipActive: {
    borderColor: "#22c55e",
    backgroundColor: "#0f1f14",
  },

  categoryText: {
    color: "#8a8a8a",
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 6,
  },

  categoryTextActive: {
    color: "#22c55e",
  },

  categoryQtd: {
    color: "#8a8a8a",
    fontSize: 10,
    marginTop: 2,
  },

  relatoCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  relatoModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  relatoModalCard: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "82%",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    borderRadius: 16,
    backgroundColor: "#161515",
    padding: 18,
  },

  relatoModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  relatoModalTitle: {
    color: "#e5e5e5",
    fontSize: 17,
    fontWeight: "bold",
  },

  relatoModalContent: {
    paddingBottom: 8,
  },

  relatoDetailImage: {
    width: "100%",
    height: 190,
    borderRadius: 12,
    marginRight: 0,
    marginBottom: 14,
  },

  relatoDetailName: {
    color: "#e5e5e5",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },

  relatoDetailField: {
    marginBottom: 14,
  },

  relatoDetailLabel: {
    color: "#22c55e",
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
  },

  relatoDetailValue: {
    color: "#d4d4d4",
    fontSize: 13,
    lineHeight: 19,
  },

  relatoEmptyCard: {
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
  },

  relatoEmpty: {
    color: "#8a8a8a",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },

  relatoError: {
    color: "#fca5a5",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 18,
  },

  criarRelatoButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },

  criarRelatoButtonText: {
    color: "#22c55e",
    fontSize: 13,
    fontWeight: "bold",
  },

  relatoInfo: {
    flex: 1,
    marginRight: 8,
  },

  relatoThumbnail: {
    width: 52,
    height: 52,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#252525",
    alignItems: "center",
    justifyContent: "center",
  },

  relatoImageError: {
    color: "#fca5a5",
    fontSize: 8,
    textAlign: "center",
  },

  relatoTitle: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 6,
  },

  relatoLine: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },

  relatoText: {
    color: "#8a8a8a",
    fontSize: 11,
    marginLeft: 5,
  },

  relatoRight: {
    alignItems: "flex-end",
  },

  verRelatoText: {
    color: "#22c55e",
    fontSize: 9,
    fontWeight: "600",
    marginTop: 7,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 28,
  },

  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 14,
    color: "#e5e5e5",
    fontSize: 13,
  },

  bairroColetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  bairroColetaInput: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    borderRadius: 10,
    color: "#e5e5e5",
    backgroundColor: "#1d1d1d",
    fontSize: 13,
    marginRight: 8,
  },

  bairroColetaButton: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#22c55e",
  },

  bairroColetaButtonDisabled: {
    opacity: 0.6,
  },

  bairroColetaButtonActive: {
    backgroundColor: "#14532d",
  },

  bairroColetaButtonText: {
    color: "#0b0b0b",
    fontSize: 12,
    fontWeight: "bold",
  },

  bairroColetaButtonTextActive: {
    color: "#e5e5e5",
  },

  collectionFollowRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: "#0f1f14",
  },

  collectionFollowStatus: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginRight: 8,
  },

  collectionFollowText: {
    flex: 1,
    color: "#c5e8cf",
    fontSize: 12,
    lineHeight: 17,
    marginLeft: 8,
  },

  collectionStopButton: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },

  collectionStopText: {
    color: "#f87171",
    fontSize: 12,
    fontWeight: "600",
  },

  coletaSourceLink: {
    marginTop: 2,
  },

  agendaCard: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2f4635",
    backgroundColor: "#19211b",
  },

  agendaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  agendaIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderRadius: 17,
    backgroundColor: "#0f2e1a",
  },

  agendaHeaderText: {
    flex: 1,
  },

  agendaDay: {
    color: "#e5e5e5",
    fontSize: 13,
    fontWeight: "bold",
  },

  agendaCooperativa: {
    color: "#22c55e",
    fontSize: 11,
    marginTop: 3,
  },

  agendaHours: {
    color: "#b5b5b5",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 6,
  },

  agendaAreas: {
    color: "#a5a5a5",
    fontSize: 12,
    lineHeight: 18,
  },

  collectionReminderNote: {
    color: "#999",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
    marginBottom: 24,
  },

  ecopontoTitle: {
    marginTop: 4,
  },

  sourceLink: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 14,
  },

  sourceLinkText: {
    color: "#22c55e",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },

  scheduleNotice: {
    padding: 12,
    marginBottom: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4b3b14",
    backgroundColor: "#241f12",
  },

  scheduleNoticeText: {
    color: "#e7d9a8",
    fontSize: 12,
    lineHeight: 18,
  },

  pontoCard: {
    flexDirection: "row",
    padding: 14,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#1d1d1d",
  },

  pontoIcon: {
    width: 36,
    height: 36,
    marginRight: 11,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f2e1a",
  },

  pontoInfo: {
    flex: 1,
  },

  pontoNome: {
    color: "#e5e5e5",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },

  pontoDescricao: {
    color: "#a5a5a5",
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 3,
  },

  pontoEmail: {
    color: "#22c55e",
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 3,
  },

  pontoHorario: {
    color: "#22c55e",
    fontSize: 12,
    fontWeight: "600",
    marginVertical: 4,
  },

  followButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#22c55e",
    borderRadius: 18,
  },

  followButtonActive: {
    backgroundColor: "#22c55e",
  },

  followButtonText: {
    color: "#22c55e",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 6,
  },

  followButtonTextActive: {
    color: "#0b0b0b",
  },
});
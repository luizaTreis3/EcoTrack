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

export default function Infos({ setScreen, dadosUsuario, carregandoPerfil, erroPerfil,
}) {
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
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

  async function salvarBairroColeta() {
    const idUsuario = dadosUsuario?.id_usuario;
    const bairro = bairroDigitado.trim();

    if (!idUsuario) {
      Alert.alert("Atenção", "Entre na sua conta para salvar o bairro da coleta.");
      return;
    }
    if (!bairro) {
      setErroAgenda("Informe o bairro da sua residência.");
      return;
    }
    if (bairro.length > 100) {
      setErroAgenda("O bairro deve ter no máximo 100 caracteres.");
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
        throw new Error(data.mensagem || "Não foi possível salvar seu bairro.");
      }

      setBairroColeta(data.bairro_coleta || bairro);
    } catch (error) {
      console.error("Erro ao salvar bairro da coleta:", error);
      setErroAgenda(error.message || "Não foi possível salvar seu bairro.");
    } finally {
      setSalvandoBairro(false);
    }
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

  const menuItems = [
    { label: "Início", screen: "Home", icon: "home-outline" },
    { label: "Infos", screen: "Infos", icon: "newspaper-outline" },
    { label: "Desafios", screen: "Desafios", icon: "trophy-outline" },
    { label: "Relato", screen: "CriarRelato", icon: "create-outline" },
    { label: "Notificações", screen: "Notificacoes", icon: "notifications-outline" },
    { label: "Perfil", screen: "MeuPerfil", icon: "person-outline" },
  ];

  const categorias = [
    { nome: "Todas", icon: "reload-outline", qtd: 24, color: "#22c55e" },
    { nome: "Papel", icon: "document-text-outline", qtd: 6, color: "#3b82f6" },
    { nome: "Plástico", icon: "flask-outline", qtd: 6, color: "#ef4444" },
    { nome: "Vidro", icon: "wine-outline", qtd: 4, color: "#166534" },
    { nome: "Metal", icon: "hardware-chip-outline", qtd: 4, color: "#facc15" },
    { nome: "Orgânicos", icon: "leaf-outline", qtd: 4, color: "#92400e" },
    { nome: "Perigoso", icon: "warning-outline", qtd: 2, color: "#f97316" },
  ];

  const pontosFiltrados = pontosColeta.filter((ponto) =>
    `${ponto.nome} ${ponto.endereco} ${ponto.tipo_residuo}`
      .toLowerCase()
      .includes(buscaPonto.trim().toLowerCase())
  );

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
            <View style={styles.mapDot} />
            <Ionicons name="location" size={22} color="#22c55e" style={{ position: "absolute", top: 20, left: 40 }} />
            <Ionicons name="location" size={22} color="#22c55e" style={{ position: "absolute", top: 55, right: 50 }} />
            <Ionicons name="location" size={22} color="#22c55e" style={{ position: "absolute", bottom: 15, left: 90 }} />
          </View>

          <Text style={styles.mapLabel}>Mapa interativo</Text>
          <Text style={styles.mapTitle}>Pontos de coleta</Text>
          <Text style={styles.mapDescription}>
            Encontre os pontos de coleta mais próximos de você.
          </Text>

          <Pressable style={styles.mapButton}>
            <Text style={styles.mapButtonText}>Ver todos</Text>
            <Ionicons name="chevron-forward" size={16} color="#000" />
          </Pressable>
        </View>

        {/* Filtrar por categoria */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Filtrar por categoria</Text>
          <Pressable style={styles.sortRow}>
            <Text style={styles.sortText}>Ver todas</Text>
            <Ionicons name="chevron-forward" size={14} color="#22c55e" />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          directionalLockEnabled
          style={{ marginBottom: 28 }}
        >
          {categorias.map((cat, index) => (
            <Pressable
              key={index}
              onPress={() => setCategoriaAtiva(cat.nome)}
              style={[
                styles.categoryChip,
                categoriaAtiva === cat.nome && styles.categoryChipActive,
              ]}
            >
              <Ionicons name={cat.icon} size={22} color={cat.color} />
              <Text
                style={[
                  styles.categoryText,
                  categoriaAtiva === cat.nome && styles.categoryTextActive,
                ]}
              >
                {cat.nome}
              </Text>
              <Text style={styles.categoryQtd}>{cat.qtd}</Text>
            </Pressable>
          ))}
        </ScrollView>

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

        <Text style={styles.sectionTitle}>Coleta seletiva por bairro</Text>
        <Text style={styles.mapDescription}>
          Informe seu bairro para consultar os dias, turnos e cooperativas da rota mais próxima.
        </Text>

        <View style={styles.bairroColetaRow}>
          <TextInput
            value={bairroDigitado}
            onChangeText={setBairroDigitado}
            placeholder="Ex.: Campestre, Centro ou Feitoria"
            placeholderTextColor="#8a8a8a"
            style={styles.bairroColetaInput}
            maxLength={100}
            editable={!salvandoBairro}
          />
          <Pressable
            onPress={salvarBairroColeta}
            disabled={salvandoBairro}
            style={[
              styles.bairroColetaButton,
              salvandoBairro && styles.bairroColetaButtonDisabled,
            ]}
          >
            <Text style={styles.bairroColetaButtonText}>
              {salvandoBairro ? "Salvando..." : "Salvar"}
            </Text>
          </Pressable>
        </View>

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
            Estes Ecopontos recebem pneus, móveis, resíduos de poda e entulho. Não são pontos de entrega de recicláveis domésticos comuns. O calendário de coleta seletiva por bairro não foi confirmado pela fonte municipal e não é exibido aqui.
          </Text>
        </View>

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
            Nenhum Ecoponto encontrado. Verifique se a migração de notificações e pontos foi aplicada.
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
                <Text style={styles.pontoDescricao}>{ponto.tipo_residuo}</Text>
                {ponto.horario_funcionamento ? (
                  <Text style={styles.pontoHorario}>{ponto.horario_funcionamento}</Text>
                ) : null}
                {ponto.telefone ? (
                  <Text style={styles.pontoDescricao}>Contato: {ponto.telefone}</Text>
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
    height: 130,
    backgroundColor: "#0f1f14",
    borderRadius: 12,
    marginBottom: 14,
    position: "relative",
    overflow: "hidden",
  },

  mapDot: {
    position: "absolute",
    top: "45%",
    left: "45%",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3b82f6",
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

  bairroColetaButtonText: {
    color: "#0b0b0b",
    fontSize: 12,
    fontWeight: "bold",
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
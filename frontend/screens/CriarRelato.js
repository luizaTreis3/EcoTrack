import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TabBar from "./TabBar";
import { API_URL } from "../src/services/api";
import {
  appendImageToFormData,
  pickImageFromLibrary,
  sendFormData,
} from "../src/services/imageStorage";

export default function CriarRelato({
  setScreen,
  usuario,
  dadosUsuario,
  carregandoPerfil = false,
  erroPerfil = "",
  onRetry,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriaAberta, setCategoriaAberta] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState("");

  // Estados dos campos
  const [titulo, setTitulo] = useState("");
  const [bairro, setBairro] = useState("");
  const [endereco, setEndereco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [atualizarStatus, setAtualizarStatus] = useState(false);
  const [imagemRelato, setImagemRelato] = useState(null);

  const [carregando, setCarregando] = useState(false);
  const categoriasRelato = ["Lixo", "Esgoto", "Infraestrutura", "Água", "Outros"];
  const categoriasFiltradas = categoriasRelato.filter((opcao) =>
    opcao
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes(
        filtroCategoria
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
      )
  );

  const menuItems = [
    { label: "Início", screen: "Home", icon: "home-outline" },
    { label: "Infos", screen: "Infos", icon: "newspaper-outline" },
    { label: "Desafios", screen: "Desafios", icon: "trophy-outline" },
    { label: "Relato", screen: "CriarRelato", icon: "create-outline" },
    { label: "Notificações", screen: "Notificacoes", icon: "notifications-outline" },
    { label: "Perfil", screen: "MeuPerfil", icon: "person-outline" },
  ];

  async function selecionarImagemRelato() {
    try {
      const asset = await pickImageFromLibrary();
      if (asset) {
        setImagemRelato(asset);
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem do relato:", error);
      Alert.alert(
        "Não foi possível selecionar a imagem",
        error.message || "Verifique a permissão da galeria e tente novamente."
      );
    }
  }

  async function handleCriarRelato() {
    const idUsuario = dadosUsuario?.id_usuario || usuario?.id_usuario;

    if (carregandoPerfil || (usuario?.uid && !dadosUsuario && !erroPerfil)) {
      Alert.alert("Aguarde", "Estamos carregando os dados do seu cadastro.");
      return;
    }

    if (erroPerfil) {
      Alert.alert("Cadastro indisponível", erroPerfil);
      return;
    }

    // Verifica se existe usuário logado
    if (!usuario?.uid || !idUsuario) {
      Alert.alert(
        "Erro",
        "Não foi possível identificar seu cadastro. Tente novamente em instantes."
      );
      return;
    }

    // Verifica os campos obrigatórios
    if (!titulo || !bairro || !endereco || !categoria || !descricao) {
      Alert.alert(
        "Atenção",
        "Preencha todos os campos obrigatórios."
      );
      return;
    }

    setCarregando(true);

    try {
      const relato = {
        id_usuario: idUsuario,
        titulo: titulo.trim(),
        bairro: bairro.trim(),
        endereco: endereco.trim(),
        categoria: categoria.trim(),
        descricao: descricao.trim(),
        atualizar_status: atualizarStatus,
      };
      let body = JSON.stringify(relato);
      let headers = { "Content-Type": "application/json" };

      if (imagemRelato) {
        const formData = new FormData();
        Object.entries(relato).forEach(([campo, valor]) => {
          formData.append(
            campo,
            typeof valor === "boolean" ? (valor ? "1" : "0") : String(valor)
          );
        });
        await appendImageToFormData(formData, imagemRelato);
        body = formData;
        headers = undefined;
      }

      const requestOptions = {
        method: "POST",
        headers,
        body,
      };
      const response = imagemRelato
        ? await sendFormData(`${API_URL}/relatos`, requestOptions)
        : await fetch(`${API_URL}/relatos`, requestOptions);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || "Não foi possível criar o relato.");
      }

      Alert.alert(
        "Sucesso!",
        "Relato criado com sucesso!"
      );

      // Limpa os campos depois de criar
      setTitulo("");
      setBairro("");
      setEndereco("");
      setCategoria("");
      setDescricao("");
      setAtualizarStatus(false);
      setImagemRelato(null);
      setScreen("Infos");

    } catch (error) {
      console.error("Erro ao criar relato:", error);

      Alert.alert(
        "Não foi possível criar o relato",
        error.message || "Verifique sua conexão e tente novamente."
      );

    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>

      {menuOpen && (
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuOpen(false)}
        >
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
                <Ionicons
                  name={item.icon}
                  size={18}
                  color="#22c55e"
                />

                <Text style={styles.menuItemText}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      )}

      <View style={styles.header}>

        <Pressable
          onPress={() => setScreen("Home")}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Voltar para o início"
        >
          <Ionicons
            name="chevron-back"
            size={26}
            color="#22c55e"
          />
        </Pressable>

        <Text
          style={{
            fontWeight: "bold",
            fontSize: 20,
            color: "#e5e5e5",
          }}
        >
          Crie um relato
        </Text>

        <Pressable
          onPress={() => setMenuOpen((prev) => !prev)}
          hitSlop={12}
          style={styles.menuButton}
        >
          <Ionicons
            name="menu"
            size={26}
            color="#22c55e"
          />
        </Pressable>

      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        {carregandoPerfil ? (
          <Text style={styles.profileNotice}>Carregando os dados do seu cadastro...</Text>
        ) : erroPerfil ? (
          <View style={styles.profileErrorBox}>
            <Text style={styles.profileErrorText}>{erroPerfil}</Text>
            {onRetry ? (
              <Pressable onPress={onRetry} style={styles.profileRetryButton}>
                <Text style={styles.profileRetryText}>Tentar novamente</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {/* TÍTULO */}
        <View style={styles.row}>

          <TextInput
            style={[
              styles.input,
              {
                flex: 1,
                marginRight: 12,
              },
            ]}
            placeholder="Título*"
            placeholderTextColor="#8a8a8a"
            value={titulo}
            onChangeText={setTitulo}
          />

          <Pressable
            style={styles.uploadBox}
            onPress={selecionarImagemRelato}
            disabled={carregando}
            accessibilityRole="button"
            accessibilityLabel={imagemRelato ? "Alterar imagem do relato" : "Adicionar imagem ao relato"}
          >
            {imagemRelato ? (
              <Image
                source={{ uri: imagemRelato.uri }}
                style={styles.uploadPreview}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require("../assets/image/upload.png")}
                style={styles.uploadImage}
                resizeMode="contain"
              />
            )}
          </Pressable>

        </View>
        {imagemRelato ? (
          <Pressable
            style={styles.removeImageButton}
            onPress={() => setImagemRelato(null)}
            disabled={carregando}
          >
            <Text style={styles.removeImageText}>Remover imagem</Text>
          </Pressable>
        ) : null}

        {/* BAIRRO */}
        <TextInput
          style={styles.input}
          placeholder="Bairro*"
          placeholderTextColor="#8a8a8a"
          value={bairro}
          onChangeText={setBairro}
        />

        {/* ENDEREÇO */}
        <TextInput
          style={styles.input}
          placeholder="Endereço*"
          placeholderTextColor="#8a8a8a"
          value={endereco}
          onChangeText={setEndereco}
        />

        {/* CATEGORIA */}
        <Pressable
          style={styles.inputWithIcon}
          onPress={() => {
            setCategoriaAberta((aberta) => !aberta);
            setFiltroCategoria("");
          }}
          accessibilityRole="button"
          accessibilityLabel={categoria || "Selecionar categoria do relato"}
          accessibilityState={{ expanded: categoriaAberta }}
        >
          <Ionicons
            name="funnel-outline"
            size={18}
            color="#22c55e"
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.inputInline, !categoria && styles.categoryPlaceholder]}>
            {categoria || "Selecione a categoria*"}
          </Text>
          <Ionicons
            name={categoriaAberta ? "chevron-up" : "chevron-down"}
            size={18}
            color="#8a8a8a"
          />
        </Pressable>

        {categoriaAberta ? (
          <View style={styles.categoryOptions}>
            <View style={styles.categorySearch}>
              <Ionicons name="search" size={17} color="#8a8a8a" />
              <TextInput
                value={filtroCategoria}
                onChangeText={setFiltroCategoria}
                placeholder="Buscar categoria..."
                placeholderTextColor="#8a8a8a"
                style={styles.categorySearchInput}
                autoCapitalize="none"
                accessibilityLabel="Filtrar categorias do relato"
              />
            </View>
            {categoriasFiltradas.map((opcao) => (
              <Pressable
                key={opcao}
                style={styles.categoryOption}
                onPress={() => {
                  setCategoria(opcao);
                  setCategoriaAberta(false);
                  setFiltroCategoria("");
                }}
              >
                <Text style={styles.categoryOptionText}>{opcao}</Text>
                {categoria === opcao ? (
                  <Ionicons name="checkmark" size={18} color="#22c55e" />
                ) : null}
              </Pressable>
            ))}
            {categoriasFiltradas.length === 0 ? (
              <Text style={styles.noCategoryResults}>
                Nenhuma categoria encontrada.
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* DESCRIÇÃO */}
        <TextInput
          style={[
            styles.input,
            styles.textArea,
          ]}
          placeholder="Descrição*"
          placeholderTextColor="#8a8a8a"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={descricao}
          onChangeText={setDescricao}
        />

        {/* CHECKBOX */}
        <Pressable
          onPress={() =>
            setAtualizarStatus((prev) => !prev)
          }
        >
          <Text style={styles.checkbox}>

            {atualizarStatus ? "☑" : "☐"}{" "}

            <Text
              style={{
                color: "#22c55e",
                fontWeight: "bold",
                textDecorationLine: "underline",
              }}
            >
              Mantenha-me atualizado sobre o status do relato.
            </Text>

          </Text>
        </Pressable>

        {/* BOTÃO */}
        <Pressable
          style={[
            styles.button,
            (carregando || carregandoPerfil || Boolean(erroPerfil) || !dadosUsuario?.id_usuario)
              && { opacity: 0.6 },
          ]}
          onPress={handleCriarRelato}
          disabled={
            carregando
            || carregandoPerfil
            || Boolean(erroPerfil)
            || !dadosUsuario?.id_usuario
          }
        >

          <Ionicons
            name="arrow-forward"
            size={18}
            color="#000"
            style={{ marginRight: 8 }}
          />

          <Text style={styles.buttonText}>
            {carregando
              ? "Criando..."
              : carregandoPerfil || (!dadosUsuario?.id_usuario && !erroPerfil)
                ? "Carregando cadastro..."
                : erroPerfil
                  ? "Cadastro indisponível"
              : "Criar relato"}
          </Text>

        </Pressable>

      </ScrollView>

      <TabBar
        active="CriarRelato"
        setScreen={setScreen}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161515",
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

  header: {
    width: "100%",
    paddingTop: 75,
    paddingBottom: 15,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  form: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingBottom: 30,
    width: "100%",
    maxWidth: 700,
  },

  row: {
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
  },

  input: {
    borderWidth: 1,
    borderColor: "#3a3a3a",
    width: "100%",
    backgroundColor: "#161616",
    padding: 15,
    borderRadius: 12,
    marginBottom: 18,
    color: "#e5e5e5",
  },

  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 18,
  },

  inputInline: {
    flex: 1,
    paddingVertical: 15,
    color: "#e5e5e5",
  },

  categoryPlaceholder: {
    color: "#8a8a8a",
  },

  categoryOptions: {
    marginTop: -12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    borderRadius: 12,
    backgroundColor: "#161616",
    overflow: "hidden",
  },

  categorySearch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },

  categorySearchInput: {
    flex: 1,
    minHeight: 44,
    color: "#e5e5e5",
  },

  noCategoryResults: {
    padding: 14,
    color: "#8a8a8a",
  },

  categoryOption: {
    minHeight: 46,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  categoryOptionText: {
    color: "#e5e5e5",
  },

  profileNotice: {
    color: "#facc15",
    marginBottom: 14,
  },

  profileErrorBox: {
    marginBottom: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#2e270f",
  },

  profileErrorText: {
    color: "#fca5a5",
  },

  profileRetryButton: {
    alignSelf: "flex-start",
    marginTop: 8,
  },

  profileRetryText: {
    color: "#22c55e",
    fontWeight: "bold",
  },

  textArea: {
    minHeight: 110,
    paddingTop: 15,
  },

  uploadBox: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  uploadImage: {
    width: 40,
    height: 40,
  },

  uploadPreview: {
    width: "100%",
    height: "100%",
    borderRadius: 11,
  },

  removeImageButton: {
    alignSelf: "flex-end",
    marginTop: -12,
    marginBottom: 14,
    paddingVertical: 4,
  },

  removeImageText: {
    color: "#fca5a5",
    fontSize: 12,
  },

  checkbox: {
    textAlign: "left",
    color: "#e5e5e5",
    width: "100%",
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#22c55e",
    padding: 15,
    borderRadius: 12,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },

  buttonText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 16,
  },
});
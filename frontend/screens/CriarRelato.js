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

export default function CriarRelato({ setScreen, usuario }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Estados dos campos
  const [titulo, setTitulo] = useState("");
  const [bairro, setBairro] = useState("");
  const [endereco, setEndereco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [atualizarStatus, setAtualizarStatus] = useState(false);

  const [carregando, setCarregando] = useState(false);

  const menuItems = [
    { label: "Início", screen: "Home", icon: "home-outline" },
    { label: "Infos", screen: "Infos", icon: "newspaper-outline" },
    { label: "Desafios", screen: "Desafios", icon: "trophy-outline" },
    { label: "Relato", screen: "CriarRelato", icon: "create-outline" },
    { label: "Perfil", screen: "MeuPerfil", icon: "person-outline" },
  ];

  async function handleCriarRelato() {
    // Verifica se existe usuário logado
    if (!usuario || !usuario.id_usuario) {
      Alert.alert(
        "Erro",
        "Não foi possível identificar o usuário logado."
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
      const response = await fetch(
        "http://192.168.1.21:3000/relatos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            // ID do usuário que criou o relato
            id_usuario: usuario.id_usuario,

            titulo: titulo.trim(),
            bairro: bairro.trim(),
            endereco: endereco.trim(),
            categoria: categoria.trim(),
            descricao: descricao.trim(),
            imagem: null,
            atualizar_status: atualizarStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Erro",
          data.mensagem || "Não foi possível criar o relato."
        );
        return;
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

    } catch (error) {
      console.error("Erro ao criar relato:", error);

      Alert.alert(
        "Erro de conexão",
        "Não foi possível conectar ao servidor."
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
          onPress={() => setScreen("Login")}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Voltar para o login"
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

          <Pressable style={styles.uploadBox}>
            <Image
              source={require("../assets/image/upload.png")}
              style={styles.uploadImage}
              resizeMode="contain"
            />
          </Pressable>

        </View>

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
        <View style={styles.inputWithIcon}>

          <Ionicons
            name="funnel-outline"
            size={18}
            color="#22c55e"
            style={{ marginRight: 8 }}
          />

          <TextInput
            style={styles.inputInline}
            placeholder="Categoria*"
            placeholderTextColor="#8a8a8a"
            value={categoria}
            onChangeText={setCategoria}
          />

        </View>

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
            carregando && { opacity: 0.6 },
          ]}
          onPress={handleCriarRelato}
          disabled={carregando}
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
    paddingTop: 45,
    paddingBottom: 15,
    marginBottom: 10,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
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
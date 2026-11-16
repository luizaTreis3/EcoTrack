import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "../src/services/api";
import {
  appendImageToFormData,
  pickImageFromLibrary,
  sendFormData,
} from "../src/services/imageStorage";

const materiais = [
  "Papel",
  "Plástico",
  "Vidro",
  "Metal",
  "Orgânico",
];

function formatarDataLocal(date) {
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function formatarDataDigitada(value) {
  const digitos = value.replace(/\D/g, "").slice(0, 8);
  if (digitos.length <= 2) {
    return digitos;
  }
  if (digitos.length <= 4) {
    return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  }
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

export default function RegistrarReciclagem({ setScreen, dadosUsuario, usuario }) {
  const [material, setMaterial] = useState("Plástico");
  const [quantidade, setQuantidade] = useState("");
  const [data, setData] = useState(() => formatarDataLocal(new Date()));
  const [local, setLocal] = useState("");
  const [foto, setFoto] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function escolherFoto() {
    try {
      const asset = await pickImageFromLibrary();
      if (asset) {
        setFoto(asset);
        setMensagem("");
      }
    } catch (error) {
      console.error("Erro ao escolher foto:", error);
      setMensagem(error.message || "Não foi possível selecionar a foto.");
    }
  }

  async function tirarFoto() {
    try {
      const permissao =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissao.granted) {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de acesso à câmera para tirar uma foto como comprovante."
        );
        return;
      }

      const resultado =
        await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          maxWidth: 1600,
          maxHeight: 1600,
        });

      if (!resultado.canceled) {
        setFoto(resultado.assets[0]);
        setMensagem("");
      }
    } catch (error) {
      console.error("Erro ao tirar foto:", error);
      setMensagem(error.message || "Não foi possível tirar a foto.");
    }
  }

  function selecionarComprovante() {
    Alert.alert(
      "Comprovante",
      "Escolha como deseja adicionar a foto.",
      [
        {
          text: "Tirar foto",
          onPress: tirarFoto,
        },
        {
          text: "Escolher da galeria",
          onPress: escolherFoto,
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ]
    );
  }

  function removerFoto() {
    setFoto(null);
  }

  async function handleRegistrar() {
    if (!quantidade || !data || !local) {
      setMensagem(
        "Preencha a quantidade, a data e o local da reciclagem."
      );
      return;
    }

    const quantidadeNumero = Number(
      quantidade.replace(",", ".")
    );

    if (
      isNaN(quantidadeNumero) ||
      quantidadeNumero <= 0
    ) {
      setMensagem(
        "Informe uma quantidade válida maior que zero."
      );
      return;
    }

    if (!foto) {
      setMensagem(
        "Adicione uma foto como comprovante da reciclagem."
      );
      return;
    }

    const idUsuario = dadosUsuario?.id_usuario;
    if (!idUsuario) {
      setMensagem("Não foi possível identificar sua conta. Entre novamente e tente.");
      return;
    }

    const partesData = data.trim().split("/");
    if (partesData.length !== 3) {
      setMensagem("Informe a data no formato DD/MM/AAAA.");
      return;
    }

    const [dia, mes, ano] = partesData.map(Number);
    const dataSelecionada = new Date(Date.UTC(ano, mes - 1, dia));
    if (
      !dia || !mes || !ano
      || dataSelecionada.getUTCFullYear() !== ano
      || dataSelecionada.getUTCMonth() !== mes - 1
      || dataSelecionada.getUTCDate() !== dia
    ) {
      setMensagem("Informe uma data válida no formato DD/MM/AAAA.");
      return;
    }

    setCarregando(true);
    setMensagem("");

    try {
      const formData = new FormData();
      formData.append("id_usuario", String(idUsuario));
      formData.append("material", material);
      formData.append("quantidade_kg", String(quantidadeNumero));
      formData.append(
        "data_reciclagem",
        `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
      );
      formData.append("local", local.trim());
      await appendImageToFormData(formData, foto);

      const response = await sendFormData(`${API_URL}/reciclagens`, {
        method: "POST",
        body: formData,
      });
      const resposta = await response.json();

      if (!response.ok) {
        throw new Error(resposta.mensagem || "Não foi possível registrar a reciclagem.");
      }

      Alert.alert(
        "Registro enviado",
        "Sua reciclagem está pendente de aprovação. Quando for aprovada, contará para o desafio de reciclagem.",
        [{ text: "OK", onPress: () => setScreen("Desafios") }],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Erro ao registrar reciclagem:", error);
      setMensagem(error.message || "Não foi possível registrar a reciclagem.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setScreen("Home")}
          hitSlop={12}
          style={styles.iconButton}
        >
          <Ionicons
            name="chevron-back"
            size={26}
            color="#22c55e"
          />
        </Pressable>

        <View style={styles.titleWrap}>
          <Ionicons
            name="refresh-outline"
            size={20}
            color="#22c55e"
          />

          <Text style={styles.title}>
            Registrar reciclagem
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ÍCONE */}
        <View style={styles.introIcon}>
          <Ionicons
            name="leaf-outline"
            size={30}
            color="#22c55e"
          />
        </View>

        <Text style={styles.heading}>
          Registre uma nova reciclagem
        </Text>

        <Text style={styles.description}>
          Informe os detalhes para acompanhar seu
          impacto positivo.
        </Text>

        {/* MATERIAL */}
        <Text style={styles.label}>
          O que você reciclou?
        </Text>

        <View style={styles.materials}>
          {materiais.map((item) => (
            <Pressable
              key={item}
              onPress={() => setMaterial(item)}
              style={[
                styles.materialChip,
                material === item &&
                  styles.materialChipActive,
              ]}
            >
              <Text
                style={[
                  styles.materialText,
                  material === item &&
                    styles.materialTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* QUANTIDADE */}
        <Text style={styles.label}>
          Quantidade
        </Text>

        <View style={styles.inputWrap}>
          <Ionicons
            name="scale-outline"
            size={19}
            color="#22c55e"
          />

          <TextInput
            value={quantidade}
            onChangeText={setQuantidade}
            style={styles.input}
            placeholder="Ex.: 2"
            placeholderTextColor="#8a8a8a"
            keyboardType="decimal-pad"
          />

          <Text style={styles.unit}>
            kg
          </Text>
        </View>

        {/* DATA */}
        <Text style={styles.label}>
          Data da reciclagem
        </Text>

        <View style={styles.inputWrap}>
          <Ionicons
            name="calendar-outline"
            size={19}
            color="#22c55e"
          />

          <TextInput
            value={data}
            onChangeText={(value) => setData(formatarDataDigitada(value))}
            style={styles.input}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#8a8a8a"
            keyboardType="number-pad"
            maxLength={10}
            selectTextOnFocus
          />
        </View>

        {/* LOCAL */}
        <Text style={styles.label}>
          Onde foi reciclado?
        </Text>

        <View style={styles.inputWrap}>
          <Ionicons
            name="location-outline"
            size={19}
            color="#22c55e"
          />

          <TextInput
            value={local}
            onChangeText={setLocal}
            style={styles.input}
            placeholder="Ex.: Ponto de coleta do Centro"
            placeholderTextColor="#8a8a8a"
          />
        </View>

        {/* COMPROVANTE */}
        <Text style={styles.label}>
          Comprovante da reciclagem
        </Text>

        {!foto ? (
          <Pressable
            onPress={selecionarComprovante}
            style={styles.photoButton}
          >
            <View style={styles.photoIcon}>
              <Ionicons
                name="camera-outline"
                size={27}
                color="#22c55e"
              />
            </View>

            <View style={styles.photoTextWrap}>
              <Text style={styles.photoTitle}>
                Adicionar foto
              </Text>

              <Text style={styles.photoDescription}>
                Tire uma foto ou escolha uma da galeria
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#8a8a8a"
            />
          </Pressable>
        ) : (
          <View style={styles.photoPreviewContainer}>
            <Image
              source={{ uri: foto.uri }}
              style={styles.photoPreview}
            />

            <View style={styles.photoOverlay}>
              <View style={styles.photoCheck}>
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color="#22c55e"
                />

                <Text style={styles.photoCheckText}>
                  Comprovante adicionado
                </Text>
              </View>

              <Pressable
                onPress={removerFoto}
                style={styles.removeButton}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color="#fff"
                />

                <Text style={styles.removeText}>
                  Remover
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* BOTÃO */}
        <Pressable
          onPress={handleRegistrar}
          style={[styles.button, carregando && styles.buttonDisabled]}
          disabled={carregando}
          accessibilityRole="button"
          accessibilityLabel="Confirmar reciclagem"
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color="#000"
          />

          <Text style={styles.buttonText}>
            {carregando ? "Enviando..." : "Confirmar reciclagem"}
          </Text>
        </Pressable>

        {/* MENSAGEM DE ERRO */}
        {mensagem ? (
          <Text style={styles.errorMessage}>
            {mensagem}
          </Text>
        ) : null}

        <Text style={styles.required}>
          * Preencha todos os campos e adicione uma foto como comprovante. O registro precisa ser aprovado para contar para os desafios.
        </Text>
      </ScrollView>
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
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  headerSpacer: {
    width: 32,
    height: 32,
  },

  titleWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  title: {
    color: "#e5e5e5",
    fontSize: 19,
    fontWeight: "bold",
  },

  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  introIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#0f2e1a",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 14,
  },

  heading: {
    color: "#e5e5e5",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },

  description: {
    color: "#8a8a8a",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 28,
  },

  label: {
    color: "#e5e5e5",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 9,
  },

  materials: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 22,
  },

  materialChip: {
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 9,
    paddingVertical: 10,
    paddingHorizontal: 13,
  },

  materialChipActive: {
    borderColor: "#22c55e",
    backgroundColor: "#0f2e1a",
  },

  materialText: {
    color: "#8a8a8a",
    fontSize: 12,
    fontWeight: "600",
  },

  materialTextActive: {
    color: "#22c55e",
  },

  inputWrap: {
    width: "100%",
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 19,
  },

  input: {
    flex: 1,
    color: "#e5e5e5",
    fontSize: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },

  unit: {
    color: "#8a8a8a",
    fontSize: 13,
  },

  /* COMPROVANTE */

  photoButton: {
    width: "100%",
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    borderStyle: "dashed",
    backgroundColor: "#161616",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 19,
  },

  photoIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#0f2e1a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  photoTextWrap: {
    flex: 1,
  },

  photoTitle: {
    color: "#e5e5e5",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },

  photoDescription: {
    color: "#8a8a8a",
    fontSize: 11,
  },

  photoPreviewContainer: {
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#161616",
    marginBottom: 19,
    borderWidth: 1,
    borderColor: "#3a3a3a",
  },

  photoPreview: {
    width: "100%",
    height: 190,
    resizeMode: "cover",
  },

  photoOverlay: {
    minHeight: 55,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  photoCheck: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  photoCheckText: {
    color: "#e5e5e5",
    fontSize: 12,
    fontWeight: "600",
  },

  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#3a3a3a",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 7,
  },

  removeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  /* BOTÃO */

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#22c55e",
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 10,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },

  required: {
    color: "#8a8a8a",
    fontSize: 11,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 16,
  },

  errorMessage: {
    color: "#ef4444",
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
  },
});
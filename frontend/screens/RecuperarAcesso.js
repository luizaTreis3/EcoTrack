import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { Alert, View, Text, TextInput, Pressable, StyleSheet, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../src/services/firebaseConfig";

export default function RecuperarAcesso({ setScreen }) {
  const { width } = useWindowDimensions();
  const lockSize = Math.min(Math.max(width - 80, 180), 280);
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviarLinkRecuperacao() {
    const emailInformado = email.trim();

    if (!emailInformado) {
      Alert.alert("Atenção", "Informe o e-mail da sua conta.");
      return;
    }

    setEnviando(true);

    try {
      await sendPasswordResetEmail(auth, emailInformado);
      Alert.alert(
        "Verifique seu e-mail",
        "Se houver uma conta com esse endereço, você receberá um link para redefinir a senha. Verifique também a caixa de spam."
      );
    } catch (error) {
      console.error("Erro ao enviar link de recuperação:", error);

      if (error.code === "auth/invalid-email") {
        Alert.alert("E-mail inválido", "Confira o endereço informado e tente novamente.");
      } else if (error.code === "auth/too-many-requests") {
        Alert.alert("Aguarde", "Muitas tentativas. Tente novamente mais tarde.");
      } else if (error.code === "auth/operation-not-allowed") {
        Alert.alert(
          "Serviço indisponível",
          "A redefinição de senha não está habilitada no Firebase."
        );
      } else if (error.code === "auth/user-not-found" || error.code === "auth/user-disabled") {
        Alert.alert(
          "Verifique seu e-mail",
          "Se houver uma conta com esse endereço, você receberá um link para redefinir a senha. Verifique também a caixa de spam."
        );
      } else {
        Alert.alert(
          "Erro",
          "Não foi possível enviar o link. Verifique sua conexão e tente novamente."
        );
      }
    } finally {
      setEnviando(false);
    }
  }

  return (

    <View style={styles.container}>
        
      <View style={styles.header}>

        <Pressable
          onPress={() => setScreen("Login")}
          style={styles.backButton}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Voltar para o login"
        >
          <Ionicons name="chevron-back" size={26} color="#22c55e" />
        </Pressable>

          <Text style={styles.tituloCabecalho}>
            Esqueci minha senha
          </Text>
      </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.cadeado}>
            <Image
                source={require("../assets/image/cadeado.png")}
              style={[styles.imagemCadeado, { width: lockSize, height: lockSize }]}
                resizeMode="contain"
            />
        </View>

      <View style={styles.form}>
        <Text style={styles.titulo}>{'Recupere o acesso\nà sua conta'}
        </Text>

        <Text style={styles.texto}>
                {'Informe o e-mail cadastrado na sua conta\nque enviaremos um link para você\nredefinir sua senha.'}
            </Text>
        
        <TextInput
          style={styles.input} 
          placeholder="E-mail*" 
          placeholderTextColor="#fff" 
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          editable={!enviando}
        />

        <Pressable
          onPress={enviarLinkRecuperacao}
          style={[styles.button, enviando && styles.buttonDisabled]}
          disabled={enviando}
        >
          <Text style={styles.buttonText}>
            {enviando ? "Enviando..." : "➜ Enviar Link de Recuperação"}
          </Text>
        </Pressable>

        <Text style={styles.lembrou}>
            Lembrou sua senha?{" "}
            <Pressable 
                onPress={() => setScreen("Login")}
              >
              <Text style={styles.linkLogin}>Fazer Login</Text>
            </Pressable>
        </Text>

      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161515",
  },

  input: {
    borderWidth: 1,
    borderColor: "#3a3a3a",
    width: "100%",
    backgroundColor: "#161616",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    color: "#e5e5e5",
  },

  tituloCabecalho: {
    fontWeight: "bold",
    fontSize: 22,
    color: "#e5e5e5",
  },

  linkLogin: {
    color: "#22c55e",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },

  header: {
    width: "100%",
    paddingTop: 45,
    paddingBottom: 15,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    position: "relative",
  },

  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: "100%",
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#000000",
    fontWeight: "bold",
  },

  backButton: {
    position: "absolute",
    top: 38,
    left: 20,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 10,
  },

  form: {
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 30,
    width: "100%",
    maxWidth: 560,
  },

  titulo: {
    textAlign: "center",
    color: "#e5e5e5",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
  },

  texto: {
    textAlign: "center",
    fontSize: 16,
    color: "#a0a0a0",
    lineHeight: 20,
    paddingBottom: 25,
  },

  cadeado: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 4,
  },

  imagemCadeado: {
    alignSelf: "center",
  },

  scrollContent: {
    alignItems: "center",
    paddingBottom: 20,
  },

   lembrou: {
    color: "#ffffff",
    fontWeight: "bold",
    marginTop: 30,
  },
    
}); 
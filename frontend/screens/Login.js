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

import { useState } from "react";

export default function Login({ setScreen }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert("Atenção", "Preencha o e-mail e a senha.");
      return;
    }

    setCarregando(true);

    try {
      const response = await fetch("http://192.168.1.21:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          senha: senha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Erro", data.mensagem || "E-mail ou senha inválidos.");
        return;
      }

      Alert.alert("Sucesso", data.mensagem);

      // Login correto → vai para a Home
      setScreen("Home");

    } catch (error) {
      console.error("Erro ao fazer login:", error);

      Alert.alert(
        "Erro de conexão",
        "Não foi possível conectar ao servidor."
      );

    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.top} />

      <View style={styles.logo}>
        <Image
          source={require("../assets/image/logoEcoTrackPreto.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <TextInput
        placeholder="E-mail"
        placeholderTextColor="#ffffff"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Senha"
        placeholderTextColor="#ffffff"
        secureTextEntry
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
      />

      <Pressable
        onPress={() => setScreen("RecuperarAcesso")}
        style={styles.esqueceu}
      >
        <Text style={styles.esqueceuTexto}>
          Esqueceu sua senha?
        </Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={handleLogin}
        disabled={carregando}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Entrar"
      >
        <Text style={styles.buttonText}>
          {carregando ? "Entrando..." : "➜ Entrar"}
        </Text>
      </Pressable>

      <View style={styles.cadastroContainer}>
        <Text style={styles.cadastro}>
          Não é cadastrado?{" "}
        </Text>

        <Pressable onPress={() => setScreen("Cadastro")}>
          <Text style={styles.linkCadastro}>
            Cadastre-se
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 20,
    flexGrow: 1,
    backgroundColor: "#161515",
    alignItems: "center",
    justifyContent: "center",
  },

  top: {
    position: "absolute",
    top: 0,
    width: "200%",
    height: 350,
    backgroundColor: "#494747",
    borderBottomLeftRadius: 275,
    borderBottomRightRadius: 275,
  },

  logo: {
    width: "70%",
    maxWidth: 350,
    height: 200,
    marginBottom: 130,
    paddingTop: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  logoImage: {
    width: "150%",
    height: "100%",
  },

  input: {
    borderWidth: 1,
    borderColor: "#3a3a3a",
    width: "100%",
    maxWidth: 560,
    backgroundColor: "#161616",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    color: "#e5e5e5",
  },

  button: {
    backgroundColor: "#22c55e",
    padding: 10,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 40,
  },

  buttonText: {
    color: "#000000",
    fontWeight: "bold",
  },

  esqueceu: {
    alignSelf: "flex-end",
  },

  esqueceuTexto: {
    color: "#a0a0a0",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },

  cadastroContainer: {
    flexDirection: "row",
    marginTop: 30,
    alignItems: "center",
  },

  cadastro: {
    color: "#e5e5e5",
    fontWeight: "bold",
  },

  linkCadastro: {
    color: "#22c55e",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Cadastro({ setScreen }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [desejaNotificacoes, setDesejaNotificacoes] = useState(false);

  const [carregando, setCarregando] = useState(false);

  async function handleCadastro() {
    // Verifica campos obrigatórios
    if (
      !nome.trim() ||
      !email.trim() ||
      !cep.trim() ||
      !telefone.trim() ||
      !cpf.trim() ||
      !senha.trim() ||
      !confirmarSenha.trim()
    ) {
      Alert.alert(
        "Atenção",
        "Preencha todos os campos obrigatórios."
      );
      return;
    }

    // Verifica se as senhas são iguais
    if (senha !== confirmarSenha) {
      Alert.alert(
        "Erro",
        "As senhas não são iguais."
      );
      return;
    }

    // Verifica os termos
    if (!aceitouTermos) {
      Alert.alert(
        "Atenção",
        "Você precisa aceitar os Termos de Uso e a Política de Privacidade."
      );
      return;
    }

    setCarregando(true);

    try {
      /*
       * Se estiver usando:
       * - Android Emulator: http://10.0.2.2:3000
       * - iOS Simulator: http://localhost:3000
       * - Celular físico: IP do computador na rede.
       * Exemplo:
       * http://192.168.0.10:3000
       */

      const response = await fetch("http://192.168.1.21:3000/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome_completo: nome.trim(),
          email: email.trim(),
          cep: cep.trim(),
          endereco: endereco.trim(),
          telefone: telefone.trim(),
          cpf: cpf.trim(),
          senha: senha,
          aceitou_termos: aceitouTermos,
          deseja_notificacoes: desejaNotificacoes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Erro",
          data.mensagem || "Não foi possível realizar o cadastro."
        );
        return;
      }

      Alert.alert(
        "Cadastro realizado!",
        "Seu usuário foi cadastrado com sucesso.",
        [
          {
            text: "OK",
            onPress: () => setScreen("Login"),
          },
        ]
      );
    } catch (error) {
      console.error("Erro ao cadastrar:", error);

      Alert.alert(
        "Erro de conexão",
        "Não foi possível conectar ao servidor. Verifique se o backend está funcionando."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setScreen("Login")}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Voltar para o login"
          style={styles.backButton}
        >
          <Ionicons
            name="chevron-back"
            size={26}
            color="#22c55e"
          />
        </Pressable>

        <Text style={styles.headerText}>Cadastro</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        {/* NOME */}
        <TextInput
          style={styles.input}
          placeholder="Nome Completo*"
          placeholderTextColor="#fff"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
        />

        {/* EMAIL */}
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#fff"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* CEP */}
        <TextInput
          style={styles.input}
          placeholder="CEP*"
          placeholderTextColor="#fff"
          value={cep}
          onChangeText={setCep}
          keyboardType="numeric"
        />

        {/* ENDEREÇO */}
        <TextInput
          style={styles.input}
          placeholder="Endereço"
          placeholderTextColor="#fff"
          value={endereco}
          onChangeText={setEndereco}
        />

        {/* TELEFONE */}
        <TextInput
          style={styles.input}
          placeholder="Telefone*"
          placeholderTextColor="#fff"
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
        />

        {/* CPF */}
        <TextInput
          style={styles.input}
          placeholder="CPF*"
          placeholderTextColor="#fff"
          value={cpf}
          onChangeText={setCpf}
          keyboardType="numeric"
        />

        {/* SENHA */}
        <TextInput
          style={styles.input}
          placeholder="Senha*"
          placeholderTextColor="#fff"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        {/* CONFIRMAR SENHA */}
        <TextInput
          style={styles.input}
          placeholder="Confirmar senha*"
          placeholderTextColor="#fff"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry
        />

        {/* TERMOS */}
        <Pressable
          style={styles.checkboxContainer}
          onPress={() => setAceitouTermos(!aceitouTermos)}
        >
          <Text style={styles.checkbox}>
            {aceitouTermos ? "☑" : "☐"} Aceito os{" "}
            <Text
              style={{
                color: "#22c55e",
                fontWeight: "bold",
                textDecorationLine: "underline",
              }}
            >
              Termos de Uso e Política de Privacidade
            </Text>
          </Text>
        </Pressable>

        {/* NOTIFICAÇÕES */}
        <Pressable
          style={styles.checkboxContainer}
          onPress={() =>
            setDesejaNotificacoes(!desejaNotificacoes)
          }
        >
          <Text style={styles.checkbox}>
            {desejaNotificacoes ? "☑" : "☐"} Deseja receber notificações?
          </Text>
        </Pressable>

        {/* BOTÃO */}
        <Pressable
          onPress={handleCadastro}
          style={[
            styles.button,
            carregando && styles.buttonDisabled,
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Confirmar cadastro"
          disabled={carregando}
        >
          <Text style={styles.buttonText}>
            {carregando
              ? "Cadastrando..."
              : "➜ Confirmar cadastro"}
          </Text>
        </Pressable>

        {/* LOGIN */}
        <View style={styles.loginContainer}>
          <Text style={styles.cadastro}>
            Já tem uma conta?{" "}
          </Text>

          <Pressable
            onPress={() => setScreen("Login")}
          >
            <Text style={styles.linkLogin}>
              Fazer Login
            </Text>
          </Pressable>
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

  top: {
    position: "absolute",
    top: 0,
    width: "120%",
    height: "40%",
    backgroundColor: "#1a1a1a",
    borderBottomLeftRadius: 275,
    borderBottomRightRadius: 275,
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

  buttonText: {
    color: "#000000",
    fontWeight: "bold",
  },

  cadastro: {
    color: "#e5e5e5",
    fontWeight: "bold",
    marginTop: 30,
  },

  linkLogin: {
    color: "#22c55e",
    fontWeight: "bold",
    textDecorationLine: "underline",
    marginTop: 30,
  },

  header: {
    width: "100%",
    paddingTop: 45,
    paddingBottom: 15,
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  headerSpacer: {
    width: 32,
    height: 32,
  },

  headerText: {
    color: "#e5e5e5",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },

  form: {
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    width: "100%",
    maxWidth: 560,
  },

  checkboxContainer: {
    width: "100%",
  },

  checkbox: {
    textAlign: "left",
    color: "#e5e5e5",
    width: "100%",
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 24,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
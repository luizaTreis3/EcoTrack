import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Cadastro({ setScreen }) {
  function handleCadastro() {
    setScreen("Login");
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
          <Ionicons name="chevron-back" size={26} color="#22c55e" />
        </Pressable>

        <Text style={styles.headerText}>Cadastro</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput style={styles.input} placeholder="Nome Completo*" placeholderTextColor="#fff" />
        <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor="#fff" />
        <TextInput style={styles.input} placeholder="CEP*" placeholderTextColor="#fff" />
        <TextInput style={styles.input} placeholder="Endereço" placeholderTextColor="#fff" />
        <TextInput style={styles.input} placeholder="Telefone*" placeholderTextColor="#fff" />
        <TextInput style={styles.input} placeholder="CPF*" placeholderTextColor="#fff" />
        <TextInput style={styles.input} placeholder="Senha*" placeholderTextColor="#fff" secureTextEntry />
        <TextInput style={styles.input} placeholder="Confirmar senha*" placeholderTextColor="#fff" secureTextEntry />

        <Text style={styles.checkbox}>
          ☑ Aceito os{" "}
          <Text style={{ color: "#22c55e", fontWeight: "bold", textDecorationLine: "underline" }}>
            Termos de Uso e Política de Privacidade
          </Text>
        </Text>

        <Text style={styles.checkbox}>
          ☑ Deseja receber notificações?
        </Text>

        <Pressable
          onPress={handleCadastro}
          style={styles.button}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Confirmar cadastro"
        >
          <Text style={styles.buttonText}>➜ Confirmar cadastro</Text>
        </Pressable>

        <Text style={styles.cadastro}>
          Já tem uma conta?{" "}

          <Pressable 
            onPress={() => setScreen("Login")}
          >
            <Text style={styles.linkLogin}>Fazer Login</Text>
          </Pressable>

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
});
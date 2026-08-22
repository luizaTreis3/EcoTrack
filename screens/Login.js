import { View, Text, TextInput, Pressable, Image, ScrollView, StyleSheet } from "react-native";

export default function Login({ setScreen }) {
  function handleLogin() {
    setScreen("Home");
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

      <TextInput //input do email
        placeholder="E-mail"
        placeholderTextColor="#ffffff"
        style={styles.input}
      />

      <TextInput //input da senha
        placeholder="Senha"
        placeholderTextColor="#ffffff"
        secureTextEntry
        style={styles.input}
      />

      <Pressable 
       onPress={() => setScreen("RecuperarAcesso")}
      style={styles.esqueceu}> 
        <Text style={styles.esqueceuTexto}>Esqueceu sua senha?</Text>
      </Pressable>
      
      <Pressable
        style={styles.button}
        onPress={handleLogin}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Entrar"
      >
        <Text style={styles.buttonText}>➜ Entrar</Text>
      </Pressable>

      <Text style={styles.cadastro}>
        Não é cadastrado?{" "}

        <Pressable 
          onPress={() => setScreen("Cadastro")}
        >
          <Text style={styles.linkCadastro}>Cadastre-se</Text>
        </Pressable>

      </Text>

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
    backgroundColor: "#2c2c2c",
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

  linkCadastro: {
    color: "#22c55e",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },

  cadastro: {
    color: "#e5e5e5",
    fontWeight: "bold",
    marginTop: 30,
  },
});

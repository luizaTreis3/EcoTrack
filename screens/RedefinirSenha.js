import { useWindowDimensions } from "react-native";
import { View, Text, TextInput, Pressable, StyleSheet, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RedefinirSenha({ setScreen }) {
  const { width } = useWindowDimensions();
  const lockSize = Math.min(Math.max(width - 80, 180), 250);

  return (

    <View style={styles.container}>
        
      <View style={styles.header}>

        <Pressable
          onPress={() => setScreen("RecuperarAcesso")}
          style={styles.backButton}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Voltar para recuperar acesso"
          >
          <Ionicons name="chevron-back" size={26} color="#22c55e" />
        </Pressable>

          <Text style={styles.tituloCabecalho}>
            Redefinir senha
          </Text>
      </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.cadeado}>
            <Image
                source={require("../assets/image/cadeadoVerificacao.png")}
              style={[styles.imagemCadeado, { width: lockSize, height: lockSize }]}
                resizeMode="contain"
            />
        </View>

      <View style={styles.form}>
        <Text style={styles.titulo}>{'Crie uma nova senha'}
        </Text>

        <Text style={styles.texto}>
                {'Sua nova senha deve ser diferente das\nanteriores para mais segurança.'}
            </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.rotuloCampo}>Nova Senha</Text>
          <TextInput 
            style={styles.input}
            placeholder="Digite sua nova senha*" 
            placeholderTextColor="#fff" 
          />
        </View>

        <View style={styles.requisitosContainer}>
          <View style={styles.linhaRequisito}>
            <Text style={styles.simboloRequisito}>ⓥ</Text>
            <Text style={styles.requisitosTexto}>Mínimo de 8 caracteres</Text>
          </View>

          <View style={styles.linhaRequisito}>
            <Text style={styles.simboloRequisito}>ⓥ</Text>
            <Text style={styles.requisitosTexto}>Pelo menos 1 letra maiúscula</Text>
          </View>

          <View style={styles.linhaRequisito}>
            <Text style={styles.simboloRequisito}>ⓥ</Text>
            <Text style={styles.requisitosTexto}>Pelo menos 1 número</Text>
          </View>

          <View style={styles.linhaRequisito}>
            <Text style={styles.simboloRequisito}>ⓥ</Text>
            <Text style={styles.requisitosTexto}>Pelo menos 1 caractere especial</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.rotuloCampo}>Confirmar nova senha*</Text>
          <TextInput 
            style={styles.input}
            placeholder="Digite novamente sua nova senha*"
            placeholderTextColor="#fff" 
          />
        </View>


        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>➜ Redefinir senha</Text>
        </Pressable>

        <Text style={styles.lembrou}>
            Fale com nosso{" "}
            <Pressable 
                onPress={() => setScreen("Login")}
              >
              <Text style={styles.linkSuporte}>suporte</Text>
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

  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },

  rotuloCampo: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 5,
    alignSelf: "flex-start",
  },

  input: {
    borderWidth: 1,
    borderColor: "#3a3a3a",
    width: "100%",
    backgroundColor: "#161616",
    padding: 15,
    borderRadius: 10,
    color: "#e5e5e5",
  },

  requisitosContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginTop: 8,
    marginBottom: 12,
  },

  linhaRequisito: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  simboloRequisito: {
    color: "#22c55e",
    fontSize: 15,
    fontWeight: "bold",
    marginRight: 8,
  },

  requisitosTexto: {
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 25,
  },

  tituloCabecalho: {
    fontWeight: "bold",
    fontSize: 22,
    color: "#e5e5e5",
  },

  linkSuporte: {
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
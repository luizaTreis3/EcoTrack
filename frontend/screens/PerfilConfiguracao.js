import { useEffect, useState } from "react";
import { Alert, View, Text, TextInput, Pressable, StyleSheet, ScrollView, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  sendPasswordResetEmail,
} from "firebase/auth";
import { API_URL } from "../src/services/api";
import { auth } from "../src/services/firebaseConfig";

const configs = {
  pessoal: { title: "Informações pessoais", icon: "person-outline" },
  seguranca: { title: "Segurança", icon: "lock-closed-outline" },
  notificacoes: { title: "Notificações", icon: "notifications-outline" },
  privacidade: { title: "Privacidade", icon: "shield-checkmark-outline" },
  termos: { title: "Termos de uso", icon: "document-text-outline" },
  ajuda: { title: "Central de ajuda", icon: "help-circle-outline" },
  sobre: { title: "Sobre o EcoTrack", icon: "alert-circle-outline" },
  idioma: { title: "Idioma", icon: "globe-outline" },
  tema: { title: "Tema", icon: "moon-outline" },
  acessibilidade: { title: "Acessibilidade", icon: "accessibility-outline" },
  impacto: { title: "Relatório de impacto", icon: "leaf-outline" },
};

export default function PerfilConfiguracao({
  setScreen,
  type,
  usuario,
  dadosUsuario,
  setDadosUsuario,
  carregandoPerfil,
  erroPerfil,
  onRetry,
}) {
  const config = configs[type] || configs.pessoal;
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [enviandoLinkSenha, setEnviandoLinkSenha] = useState(false);
  const [notificacoes, setNotificacoes] = useState(true);
  const [emailNotificacoes, setEmailNotificacoes] = useState(true);
  const [alertasColeta, setAlertasColeta] = useState(true);
  const [atualizacoesRelatos, setAtualizacoesRelatos] = useState(true);
  const [localizacao, setLocalizacao] = useState(true);
  const [temaClaro, setTemaClaro] = useState(false);
  const [altoContraste, setAltoContraste] = useState(false);
  const [textoMaior, setTextoMaior] = useState(false);
  const [reduzirAnimacoes, setReduzirAnimacoes] = useState(false);
  const [idioma, setIdioma] = useState("Português (Brasil)");

  useEffect(() => {
    if (!dadosUsuario) {
      return;
    }

    setNome(dadosUsuario.nome_completo || "");
    setEmail(usuario?.email || dadosUsuario.email || "");
    setCep(dadosUsuario.cep || "");
    setEndereco(dadosUsuario.endereco || "");
    setTelefone(dadosUsuario.telefone || "");
  }, [dadosUsuario, usuario?.email]);

  async function enviarLinkAlteracaoSenha() {
    const emailConta = auth.currentUser?.email || usuario?.email;

    if (!emailConta) {
      Alert.alert(
        "E-mail indisponível",
        "Não encontramos um e-mail associado à sua conta. Faça login novamente."
      );
      return;
    }

    setEnviandoLinkSenha(true);

    try {
      await sendPasswordResetEmail(auth, emailConta);
      Alert.alert(
        "Verifique seu e-mail",
        `Enviamos um link de redefinição para ${emailConta}. Abra-o para escolher uma nova senha.`
      );
    } catch (error) {
      console.error("Erro ao enviar link para alteração de senha:", error);

      const mensagens = {
        "auth/invalid-email": "O e-mail associado à conta é inválido.",
        "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
        "auth/operation-not-allowed": "A redefinição de senha não está habilitada no Firebase.",
      };

      Alert.alert(
        "Não foi possível enviar o link",
        mensagens[error.code] || "Verifique sua conexão e tente novamente."
      );
    } finally {
      setEnviandoLinkSenha(false);
    }
  }

  async function salvarDadosPessoais() {
    if (!nome.trim() || !cep.trim() || !telefone.trim() || !dadosUsuario?.cpf) {
      Alert.alert("Atenção", "Preencha os campos obrigatórios.");
      return;
    }

    setSalvando(true);

    try {
      const response = await fetch(
        `${API_URL}/usuarios/firebase/${encodeURIComponent(usuario.uid)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome_completo: nome.trim(),
            cep: cep.trim(),
            endereco: endereco.trim(),
            telefone: telefone.trim(),
            cpf: dadosUsuario.cpf,
            aceitou_termos: dadosUsuario.aceitou_termos,
            deseja_notificacoes: dadosUsuario.deseja_notificacoes,
          }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || "Não foi possível atualizar seus dados.");
      }

      setDadosUsuario({
        ...dadosUsuario,
        nome_completo: nome.trim(),
        cep: cep.trim(),
        endereco: endereco.trim(),
        telefone: telefone.trim(),
      });
      Alert.alert("Sucesso", "Seus dados foram atualizados.");
      setScreen("MeuPerfil");
    } catch (error) {
      console.error("Erro ao atualizar dados do perfil:", error);
      Alert.alert(
        "Erro",
        error.message || "Não foi possível atualizar seus dados."
      );
    } finally {
      setSalvando(false);
    }
  }

  function renderSwitch(label, value, onValueChange, description) {
    return (
      <View style={styles.optionRow}>
        <View style={styles.optionText}>
          <Text style={styles.optionLabel}>{label}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: "#3a3a3a", true: "#166534" }}
          thumbColor={value ? "#22c55e" : "#8a8a8a"}
        />
      </View>
    );
  }

  function renderContent() {
    if (type === "pessoal") {
      if (carregandoPerfil) {
        return <Text style={styles.intro}>Carregando seus dados...</Text>;
      }

      if (erroPerfil || !dadosUsuario) {
        return <>
          <Text style={styles.intro}>
            {erroPerfil || "Não foi possível carregar seus dados."}
          </Text>
          <SaveButton label="Tentar novamente" onPress={onRetry} />
        </>;
      }

      return <>
        <Text style={styles.intro}>Atualize seus dados para manter sua conta sempre correta.</Text>
        <Text style={styles.label}>Nome completo</Text>
        <TextInput value={nome} onChangeText={setNome} style={styles.input} placeholderTextColor="#8a8a8a" />
        <Text style={styles.label}>E-mail atual</Text>
        <TextInput value={email} editable={false} keyboardType="email-address" style={styles.input} placeholderTextColor="#8a8a8a" />
        <Text style={styles.label}>Telefone</Text>
        <TextInput value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" style={styles.input} placeholderTextColor="#8a8a8a" />
        <Text style={styles.label}>CEP</Text>
        <TextInput value={cep} onChangeText={setCep} keyboardType="numeric" style={styles.input} placeholderTextColor="#8a8a8a" />
        <Text style={styles.label}>Endereço</Text>
        <TextInput value={endereco} onChangeText={setEndereco} style={styles.input} placeholderTextColor="#8a8a8a" />
        <SaveButton
          label={salvando ? "Salvando..." : "Salvar alterações"}
          onPress={salvarDadosPessoais}
          disabled={salvando}
        />
      </>;
    }

    if (type === "seguranca") {
      return <>
        <Text style={styles.intro}>
          Para proteger sua conta, enviaremos um link para o e-mail associado. Abra o link para escolher uma nova senha.
        </Text>
        <Text style={styles.label}>E-mail da conta</Text>
        <TextInput
          value={auth.currentUser?.email || usuario?.email || ""}
          editable={false}
          keyboardType="email-address"
          style={styles.input}
          placeholderTextColor="#8a8a8a"
        />
        <SaveButton
          label={enviandoLinkSenha ? "Enviando link..." : "Enviar link para trocar senha"}
          onPress={enviarLinkAlteracaoSenha}
          disabled={enviandoLinkSenha}
        />
      </>;
    }

    if (type === "notificacoes") {
      return <>
        {renderSwitch("Notificações no celular", notificacoes, setNotificacoes, "Receba novidades e lembretes do EcoTrack.")}
        {renderSwitch("Atualizações por e-mail", emailNotificacoes, setEmailNotificacoes, "Receba um resumo das suas atividades.")}
        {renderSwitch("Atualizações sobre meus relatos", atualizacoesRelatos, setAtualizacoesRelatos, "Acompanhe quando um relato for recebido, atualizado ou resolvido.")}
        {renderSwitch("Alertas de coleta", alertasColeta, setAlertasColeta, "Saiba quando a coleta estiver próxima.")}
      </>;
    }

    if (type === "privacidade") {
      return <>
        {renderSwitch("Usar minha localização", localizacao, setLocalizacao, "Ajuda a mostrar pontos de coleta próximos.")}
        <Pressable style={styles.actionRow} onPress={() => setScreen("MeuPerfil")}><Text style={styles.actionText}>Baixar meus dados</Text><Ionicons name="download-outline" size={20} color="#22c55e" /></Pressable>
      </>;
    }

    if (type === "idioma") {
      return <>
        <Text style={styles.intro}>Escolha o idioma usado no aplicativo.</Text>
        <Choice label="Português (Brasil)" selected={idioma === "Português (Brasil)"} onPress={() => setIdioma("Português (Brasil)")} />
        <Choice label="English" selected={idioma === "English"} onPress={() => setIdioma("English")} />
        <Choice label="Español" selected={idioma === "Español"} onPress={() => setIdioma("Español")} />
      </>;
    }

    if (type === "tema") {
      return <>{renderSwitch("Tema claro", temaClaro, setTemaClaro, "Ative para usar o aplicativo com fundo claro.")}</>;
    }

    if (type === "acessibilidade") {
      return <>
        {renderSwitch("Alto contraste", altoContraste, setAltoContraste, "Aumenta a diferença entre texto e fundo.")}
        {renderSwitch("Texto maior", textoMaior, setTextoMaior, "Aumenta o tamanho dos textos do aplicativo.")}
        {renderSwitch("Reduzir animações", reduzirAnimacoes, setReduzirAnimacoes, "Diminui os movimentos da interface.")}
      </>;
    }

    if (type === "impacto") {
      return <>
        <Text style={styles.intro}>Seu impacto positivo na cidade até agora.</Text>
        <Stat label="CO² evitado" value="12,4 kg" icon="leaf-outline" />
        <Stat label="Materiais reciclados" value="23" icon="reload-outline" />
        <Stat label="Ações realizadas" value="128" icon="checkmark-circle-outline" />
      </>;
    }

    const text = {
      termos: "Ao usar o EcoTrack, você concorda em utilizar a plataforma de forma responsável e colaborar com o cuidado da cidade.",
      ajuda: "Encontre orientações sobre relatos, coleta seletiva e sua conta. Para falar com a equipe, envie uma mensagem pelo suporte.",
      sobre: "O EcoTrack conecta pessoas e ações sustentáveis para tornar o descarte correto mais simples e transformar dados em cuidado com a cidade.",
    }[type];
    return <Text style={styles.longText}>{text}</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => setScreen("MeuPerfil")} hitSlop={12} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color="#22c55e" />
        </Pressable>
        <View style={styles.titleWrap}>
          <Ionicons name={config.icon} size={20} color="#22c55e" />
          <Text style={styles.title}>{config.title}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

function SaveButton({ label, onPress, disabled = false }) {
  return <Pressable style={[styles.saveButton, disabled && styles.saveButtonDisabled]} onPress={onPress} disabled={disabled}><Text style={styles.saveButtonText}>{label}</Text></Pressable>;
}

function Choice({ label, selected, onPress }) {
  return <Pressable style={styles.choice} onPress={onPress}><Ionicons name={selected ? "radio-button-on" : "radio-button-off"} size={22} color={selected ? "#22c55e" : "#8a8a8a"} /><Text style={styles.optionLabel}>{label}</Text></Pressable>;
}

function Stat({ label, value, icon }) {
  return <View style={styles.stat}><Ionicons name={icon} size={24} color="#22c55e" /><View><Text style={styles.statValue}>{value}</Text><Text style={styles.description}>{label}</Text></View></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#161515" },
  header: { width: "100%", paddingTop: 75, paddingBottom: 15, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  headerSpacer: { width: 32, height: 32 },
  titleWrap: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  title: { color: "#e5e5e5", fontSize: 19, fontWeight: "bold" },
  content: { width: "100%", maxWidth: 560, alignSelf: "center", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 },
  intro: { color: "#8a8a8a", fontSize: 13, lineHeight: 20, marginBottom: 22 },
  label: { color: "#e5e5e5", fontSize: 13, fontWeight: "bold", marginBottom: 8 },
  input: { width: "100%", color: "#e5e5e5", backgroundColor: "#161616", borderWidth: 1, borderColor: "#3a3a3a", borderRadius: 10, padding: 14, marginBottom: 18 },
  saveButton: { backgroundColor: "#22c55e", borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#000", fontWeight: "bold", fontSize: 14 },
  optionRow: { backgroundColor: "#161616", borderWidth: 1, borderColor: "#3a3a3a", borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  optionText: { flex: 1, paddingRight: 14 },
  optionLabel: { color: "#e5e5e5", fontSize: 14, fontWeight: "600" },
  description: { color: "#8a8a8a", fontSize: 12, lineHeight: 17, marginTop: 4 },
  actionRow: { backgroundColor: "#161616", borderWidth: 1, borderColor: "#3a3a3a", borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  actionText: { color: "#22c55e", fontSize: 14, fontWeight: "bold" },
  choice: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 17, borderBottomWidth: 1, borderBottomColor: "#2a2a2a" },
  longText: { color: "#c4c4c4", fontSize: 14, lineHeight: 24, backgroundColor: "#161616", borderWidth: 1, borderColor: "#3a3a3a", borderRadius: 12, padding: 18 },
  stat: { backgroundColor: "#161616", borderWidth: 1, borderColor: "#3a3a3a", borderRadius: 12, padding: 18, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12 },
  statValue: { color: "#e5e5e5", fontWeight: "bold", fontSize: 18 },
});

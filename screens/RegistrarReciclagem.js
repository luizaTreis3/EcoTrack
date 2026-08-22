import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const materiais = ["Papel", "Plástico", "Vidro", "Metal", "Orgânico"];

export default function RegistrarReciclagem({ setScreen }) {
  const [material, setMaterial] = useState("Plástico");
  const [quantidade, setQuantidade] = useState("");
  const [data, setData] = useState("");
  const [local, setLocal] = useState("");
  const [mensagem, setMensagem] = useState("");

  function handleRegistrar() {
    if (!quantidade || !data || !local) {
      setMensagem("Preencha a quantidade, a data e o local da reciclagem.");
      return;
    }
    setMensagem("");
    setScreen("Home");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => setScreen("Home")} hitSlop={12} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={26} color="#22c55e" />
        </Pressable>
        <View style={styles.titleWrap}>
          <Ionicons name="refresh-outline" size={20} color="#22c55e" />
          <Text style={styles.title}>Registrar reciclagem</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.introIcon}>
          <Ionicons name="leaf-outline" size={30} color="#22c55e" />
        </View>
        <Text style={styles.heading}>Registre uma nova reciclagem</Text>
        <Text style={styles.description}>Informe os detalhes para acompanhar seu impacto positivo.</Text>

        <Text style={styles.label}>O que você reciclou?</Text>
        <View style={styles.materials}>
          {materiais.map((item) => (
            <Pressable key={item} onPress={() => setMaterial(item)} style={[styles.materialChip, material === item && styles.materialChipActive]}>
              <Text style={[styles.materialText, material === item && styles.materialTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Quantidade</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="scale-outline" size={19} color="#22c55e" />
          <TextInput value={quantidade} onChangeText={setQuantidade} style={styles.input} placeholder="Ex.: 2" placeholderTextColor="#8a8a8a" keyboardType="decimal-pad" />
          <Text style={styles.unit}>kg</Text>
        </View>

        <Text style={styles.label}>Data da reciclagem</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="calendar-outline" size={19} color="#22c55e" />
          <TextInput value={data} onChangeText={setData} style={styles.input} placeholder="DD/MM/AAAA" placeholderTextColor="#8a8a8a" keyboardType="numbers-and-punctuation" />
        </View>

        <Text style={styles.label}>Onde foi reciclado?</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="location-outline" size={19} color="#22c55e" />
          <TextInput value={local} onChangeText={setLocal} style={styles.input} placeholder="Ex.: Ponto de coleta do Centro" placeholderTextColor="#8a8a8a" />
        </View>

        <Pressable onPress={handleRegistrar} style={styles.button} accessibilityRole="button" accessibilityLabel="Confirmar reciclagem">
          <Ionicons name="checkmark-circle-outline" size={20} color="#000" />
          <Text style={styles.buttonText}>Confirmar reciclagem</Text>
        </Pressable>
        {mensagem ? <Text style={styles.errorMessage}>{mensagem}</Text> : null}
        <Text style={styles.required}>Preencha todos os campos para confirmar.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#161515" },
  header: { width: "100%", paddingTop: 75, paddingBottom: 15, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  headerSpacer: { width: 32, height: 32 },
  titleWrap: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  title: { color: "#e5e5e5", fontSize: 19, fontWeight: "bold" },
  content: { width: "100%", maxWidth: 560, alignSelf: "center", paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  introIcon: { width: 62, height: 62, borderRadius: 31, backgroundColor: "#0f2e1a", alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 14 },
  heading: { color: "#e5e5e5", fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 6 },
  description: { color: "#8a8a8a", fontSize: 13, lineHeight: 19, textAlign: "center", marginBottom: 28 },
  label: { color: "#e5e5e5", fontSize: 13, fontWeight: "bold", marginBottom: 9 },
  materials: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 22 },
  materialChip: { borderWidth: 1, borderColor: "#3a3a3a", backgroundColor: "#161616", borderRadius: 9, paddingVertical: 10, paddingHorizontal: 13 },
  materialChipActive: { borderColor: "#22c55e", backgroundColor: "#0f2e1a" },
  materialText: { color: "#8a8a8a", fontSize: 12, fontWeight: "600" },
  materialTextActive: { color: "#22c55e" },
  inputWrap: { width: "100%", minHeight: 52, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#3a3a3a", backgroundColor: "#161616", borderRadius: 10, paddingHorizontal: 14, marginBottom: 19 },
  input: { flex: 1, color: "#e5e5e5", fontSize: 14, paddingVertical: 14, paddingHorizontal: 10 },
  unit: { color: "#8a8a8a", fontSize: 13 },
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#22c55e", borderRadius: 10, paddingVertical: 14, marginTop: 10 },
  buttonText: { color: "#000", fontWeight: "bold", fontSize: 14 },
  required: { color: "#8a8a8a", fontSize: 11, textAlign: "center", marginTop: 12 },
  errorMessage: { color: "#ef4444", fontSize: 12, textAlign: "center", marginTop: 12 },
});

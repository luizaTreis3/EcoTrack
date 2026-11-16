import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function getCoordenadaValida(ponto) {
  if (
    ponto.latitude == null
    || ponto.longitude == null
    || String(ponto.latitude).trim() === ""
    || String(ponto.longitude).trim() === ""
  ) {
    return null;
  }

  const latitude = Number(ponto.latitude);
  const longitude = Number(ponto.longitude);

  if (
    !Number.isFinite(latitude)
    || !Number.isFinite(longitude)
    || latitude < -90
    || latitude > 90
    || longitude < -180
    || longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}

export default function EcopontosMap({ pontos, expanded = false }) {
  const pontosComCoordenadas = pontos
    .map((ponto) => ({ ponto, coordenada: getCoordenadaValida(ponto) }))
    .filter((item) => item.coordenada);
  const pontosVisiveis = expanded
    ? pontosComCoordenadas
    : pontosComCoordenadas.slice(0, 1);

  async function abrirMapa(coordenada) {
    const url = `https://www.openstreetmap.org/?mlat=${coordenada.latitude}&mlon=${coordenada.longitude}#map=17/${coordenada.latitude}/${coordenada.longitude}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Erro ao abrir o mapa do Ecoponto:", error);
      Alert.alert("Erro", "Não foi possível abrir o mapa deste Ecoponto.");
    }
  }

  if (pontosComCoordenadas.length === 0) {
    return (
      <View style={styles.emptyMap}>
        <Text style={styles.emptyTitle}>Mapa aguardando coordenadas</Text>
        <Text style={styles.emptyText}>
          Cadastre latitude e longitude nos Ecopontos para exibi-los no mapa.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.mapLinks}>
      <Text style={styles.description}>
        {expanded
          ? "Abra a localização de cada Ecoponto no mapa:"
          : `${pontosComCoordenadas.length} Ecopontos cadastrados em São Leopoldo.`}
      </Text>
      {pontosVisiveis.map(({ ponto, coordenada }) => (
        <Pressable
          key={ponto.id_ponto}
          style={styles.mapLink}
          onPress={() => abrirMapa(coordenada)}
          accessibilityRole="link"
        >
          <Ionicons name="location" size={18} color="#22c55e" />
          <View style={styles.mapLinkText}>
            <Text style={styles.pointName}>{ponto.nome}</Text>
            <Text style={styles.pointAddress}>{ponto.endereco}</Text>
          </View>
          <Ionicons name="open-outline" size={16} color="#22c55e" />
        </Pressable>
      ))}
      {!expanded && pontosComCoordenadas.length > 1 ? (
        <Text style={styles.morePoints}>
          Toque em “Ver todos” para mostrar os outros Ecopontos.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyMap: {
    minHeight: 130,
    padding: 18,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    borderRadius: 14,
    backgroundColor: "#161616",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    color: "#e5e5e5",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },
  emptyText: {
    color: "#8a8a8a",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  mapLinks: {
    borderWidth: 1,
    borderColor: "#3a3a3a",
    borderRadius: 14,
    backgroundColor: "#161616",
    padding: 14,
  },
  description: {
    color: "#8a8a8a",
    fontSize: 12,
    marginBottom: 10,
  },
  morePoints: {
    color: "#8a8a8a",
    fontSize: 11,
    marginTop: 8,
  },
  mapLink: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
  },
  mapLinkText: {
    flex: 1,
  },
  pointName: {
    color: "#e5e5e5",
    fontSize: 13,
    fontWeight: "600",
  },
  pointAddress: {
    color: "#8a8a8a",
    fontSize: 11,
    marginTop: 3,
  },
});

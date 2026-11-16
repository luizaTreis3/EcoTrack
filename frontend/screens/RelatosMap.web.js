import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function getCoordenadaValida(relato) {
  if (
    relato.latitude == null
    || relato.longitude == null
    || String(relato.latitude).trim() === ""
    || String(relato.longitude).trim() === ""
  ) {
    return null;
  }

  const latitude = Number(relato.latitude);
  const longitude = Number(relato.longitude);

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

function getStatus(status) {
  switch (String(status || "").trim().toLowerCase()) {
    case "em análise":
      return { nome: "Em análise", cor: "#3b82f6" };
    case "resolvido":
      return { nome: "Resolvido", cor: "#22c55e" };
    case "pendente":
    default:
      return { nome: "Pendente", cor: "#ef4444" };
  }
}

export default function RelatosMap({ relatos, expanded = false }) {
  const relatosComCoordenadas = relatos
    .map((relato) => ({ relato, coordenada: getCoordenadaValida(relato) }))
    .filter((item) => item.coordenada);
  const relatosVisiveis = expanded
    ? relatosComCoordenadas
    : relatosComCoordenadas.slice(0, 1);
  const semCoordenadas = relatos.length - relatosComCoordenadas.length;

  async function abrirMapa(coordenada) {
    const url = `https://www.openstreetmap.org/?mlat=${coordenada.latitude}&mlon=${coordenada.longitude}#map=17/${coordenada.latitude}/${coordenada.longitude}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Erro ao abrir a localização do relato:", error);
      Alert.alert("Erro", "Não foi possível abrir o mapa deste relato.");
    }
  }

  if (relatosComCoordenadas.length === 0) {
    return (
      <View style={styles.emptyMap}>
        <Text style={styles.emptyTitle}>Nenhum relato com localização no mapa</Text>
        <Text style={styles.emptyText}>
          Ao criar um relato, informe as coordenadas do local para que ele apareça aqui.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.mapLinks}>
      <Text style={styles.description}>
        {expanded
          ? "Toque em um relato para abrir sua localização no OpenStreetMap:"
          : `${relatosComCoordenadas.length} relato(s) com localização. Expanda para ver todos:`}
      </Text>
      {relatosVisiveis.map(({ relato, coordenada }) => {
        const status = getStatus(relato.status);
        return (
          <Pressable
            key={relato.id_relato}
            style={styles.mapLink}
            onPress={() => abrirMapa(coordenada)}
            accessibilityRole="link"
            accessibilityLabel={`Abrir no mapa: ${relato.categoria || "Sem categoria"}, ${status.nome}`}
          >
            <Ionicons name="location" size={18} color={status.cor} />
            <View style={styles.mapLinkText}>
              <Text style={styles.pointName}>
                {relato.categoria || "Categoria não informada"} · {relato.titulo}
              </Text>
              <Text style={[styles.pointAddress, { color: status.cor }]}>
                {status.nome} · {[relato.endereco, relato.bairro].filter(Boolean).join(" · ")}
              </Text>
            </View>
            <Ionicons name="open-outline" size={16} color={status.cor} />
          </Pressable>
        );
      })}
      {!expanded && relatosComCoordenadas.length > 1 ? (
        <Text style={styles.caption}>
          Toque em “Ver mapa completo” para exibir as outras localizações.
        </Text>
      ) : null}
      {semCoordenadas > 0 ? (
        <Text style={styles.caption}>
          {semCoordenadas} relato(s) antigo(s) sem coordenadas não aparecem no mapa.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyMap: {
    minHeight: 150,
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
  caption: {
    color: "#8a8a8a",
    fontSize: 11,
    lineHeight: 16,
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
    fontSize: 11,
    marginTop: 4,
  },
});

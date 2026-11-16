import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

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

function getCorStatus(status) {
  switch (String(status || "").trim().toLowerCase()) {
    case "em análise":
      return "#3b82f6";
    case "resolvido":
      return "#22c55e";
    case "pendente":
    default:
      return "#ef4444";
  }
}

export default function RelatosMap({ relatos, expanded = false }) {
  const relatosComCoordenadas = useMemo(
    () => relatos
      .map((relato) => ({ relato, coordenada: getCoordenadaValida(relato) }))
      .filter((item) => item.coordenada),
    [relatos]
  );
  const initialRegion = useMemo(() => {
    const latitudes = relatosComCoordenadas.map(({ coordenada }) => coordenada.latitude);
    const longitudes = relatosComCoordenadas.map(({ coordenada }) => coordenada.longitude);
    const latitudeMinima = Math.min(...latitudes);
    const latitudeMaxima = Math.max(...latitudes);
    const longitudeMinima = Math.min(...longitudes);
    const longitudeMaxima = Math.max(...longitudes);

    return {
      latitude: (latitudeMinima + latitudeMaxima) / 2,
      longitude: (longitudeMinima + longitudeMaxima) / 2,
      latitudeDelta: Math.max((latitudeMaxima - latitudeMinima) * 1.6, 0.015),
      longitudeDelta: Math.max((longitudeMaxima - longitudeMinima) * 1.6, 0.015),
    };
  }, [relatosComCoordenadas]);
  const semCoordenadas = relatos.length - relatosComCoordenadas.length;

  if (relatosComCoordenadas.length === 0) {
    return (
      <View style={styles.emptyMap}>
        <Text style={styles.emptyTitle}>Nenhum relato com localização no mapa</Text>
        <Text style={styles.emptyText}>
          Ao criar um relato, marque o local no mapa para que ele apareça aqui.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <MapView
        key={relatosComCoordenadas
          .map(({ relato, coordenada }) =>
            `${relato.id_relato}:${coordenada.latitude},${coordenada.longitude}:${relato.status}`
          )
          .join("-") + `:${expanded}`}
        style={[styles.map, expanded && styles.mapExpanded]}
        initialRegion={initialRegion}
        loadingEnabled
        toolbarEnabled
      >
        {relatosComCoordenadas.map(({ relato, coordenada }) => (
          <Marker
            key={relato.id_relato}
            coordinate={coordenada}
            pinColor={getCorStatus(relato.status)}
            title={`Categoria: ${relato.categoria || "Não informada"}`}
            description={[
              relato.titulo,
              relato.status || "Pendente",
              [relato.endereco, relato.bairro].filter(Boolean).join(" · "),
            ].filter(Boolean).join(" · ")}
          />
        ))}
      </MapView>
      {semCoordenadas > 0 ? (
        <Text style={styles.mapCaption}>
          {semCoordenadas} relato(s) antigo(s) sem coordenadas não aparecem no mapa.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 190,
    width: "100%",
    borderRadius: 14,
  },
  mapExpanded: {
    height: 360,
  },
  mapCaption: {
    color: "#8a8a8a",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },
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
});

import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

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
  const pontosComCoordenadas = useMemo(
    () => pontos
      .map((ponto) => ({ ponto, coordenada: getCoordenadaValida(ponto) }))
      .filter((item) => item.coordenada),
    [pontos]
  );
  const initialRegion = useMemo(() => {
    const latitudes = pontosComCoordenadas.map(({ coordenada }) => coordenada.latitude);
    const longitudes = pontosComCoordenadas.map(({ coordenada }) => coordenada.longitude);
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
  }, [pontosComCoordenadas]);
  const semCoordenadas = pontos.length - pontosComCoordenadas.length;

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
    <View>
      <MapView
        key={pontosComCoordenadas
          .map(({ ponto, coordenada }) =>
            `${ponto.id_ponto}:${coordenada.latitude},${coordenada.longitude}`
          )
          .join("-") + `:${expanded}`}
        style={[styles.map, expanded && styles.mapExpanded]}
        initialRegion={initialRegion}
        loadingEnabled
        toolbarEnabled
      >
        {pontosComCoordenadas.map(({ ponto, coordenada }) => (
          <Marker
            key={ponto.id_ponto}
            coordinate={coordenada}
            title={ponto.nome}
            description={[ponto.endereco, ponto.tipo_residuo]
              .filter(Boolean)
              .join(" · ")}
          />
        ))}
      </MapView>
      {expanded ? (
        <Text style={styles.mapCaption}>
          Toque em um marcador para ver o endereço. Os pinos usam a geocodificação dos endereços oficiais.
          {semCoordenadas > 0
            ? ` ${semCoordenadas} ponto(s) sem coordenadas não aparecem no mapa.`
            : ""}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 130,
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
});

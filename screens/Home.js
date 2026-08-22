import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import TabBar from "./TabBar";


function ProgressRing({ size, strokeWidth, progress, color, children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#262626"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      {children}
    </View>
  );
}

export default function Home({ setScreen }) {
  const [busca, setBusca] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { label: "Início", screen: "Home", icon: "home-outline" },
    { label: "Infos", screen: "Infos", icon: "newspaper-outline" },
    { label: "Desafios", screen: "Desafios", icon: "trophy-outline" },
    { label: "Relato", screen: "CriarRelato", icon: "create-outline" },
    { label: "Perfil", screen: "MeuPerfil", icon: "person-outline" },
  ];

  return (
    <View style={styles.pageWrap}>
      {menuOpen && (
        <Pressable style={styles.menuOverlay} onPress={() => setMenuOpen(false)}>
          <View style={styles.menuSheet}>
            {menuItems.map((item) => (
              <Pressable
                key={item.label}
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  setScreen(item.screen);
                }}
              >
                <Ionicons name={item.icon} size={18} color="#22c55e" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      )}

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="leaf" size={22} color="#22c55e" style={{ marginRight: 6 }} />
          <Text style={styles.logoText}>
            Eco<Text style={{ color: "#22c55e" }}>Track</Text>
          </Text>
        </View>
        <Pressable onPress={() => setMenuOpen((prev) => !prev)} hitSlop={12} style={styles.menuButton}>
          <Ionicons name="menu" size={26} color="#22c55e" />
        </Pressable>
      </View>

      {/* Saudação */}
      <View style={styles.section}>
        <Text style={styles.greeting}>
          Olá, <Text style={{ color: "#22c55e" }}>Usuário</Text>!
        </Text>
        <Text style={styles.subGreeting}>
          Que tal transformar hoje em um dia{" "}
          <Text style={{ color: "#22c55e" }}>mais sustentável</Text>?
        </Text>
      </View>

      {/* EcoScore */}
      <View style={[styles.card, styles.ecoScoreCard]}>
        <View style={styles.ecoScoreHeader}>
          <Text style={styles.cardTitleSmall}>Seu EcoScore</Text>
          <Ionicons name="information-circle-outline" size={16} color="#8a8a8a" />
        </View>

        <View style={styles.ecoScoreBody}>
          <ProgressRing size={100} strokeWidth={10} progress={75} color="#22c55e">
            <Text style={styles.ecoScoreNumber}>750</Text>
            <Text style={styles.ecoScoreOf}>de 1000</Text>
          </ProgressRing>

          <View style={{ flex: 1, marginLeft: 18 }}>
            <Text style={styles.ecoScoreGood}>Muito bem!</Text>
            <Text style={styles.ecoScoreText}>
              Você está no caminho certo para uma cidade mais sustentável.
            </Text>

            <Pressable style={styles.outlineButton}>
              <Ionicons name="trending-up" size={16} color="#e5e5e5" style={{ marginRight: 6 }} />
              <Text style={styles.outlineButtonText}>Ver meu impacto</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Seu impacto */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seu impacto</Text>

        <View style={styles.rowThree}>
          <View style={styles.statCard}>
            <View style={styles.statIconCircle}>
              <Ionicons name="leaf-outline" size={20} color="#22c55e" />
            </View>
            <Text style={styles.statNumber}>12,4 kg</Text>
            <Text style={styles.statLabel}>CO² evitado</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconCircle}>
              <Ionicons name="refresh-outline" size={20} color="#22c55e" />
            </View>
            <Text style={styles.statNumber}>23</Text>
            <Text style={styles.statLabel}>Materiais reciclados</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconCircle}>
              <Ionicons name="construct-outline" size={20} color="#22c55e" />
            </View>
            <Text style={styles.statNumber}>10</Text>
            <Text style={styles.statLabel}>Danos estruturais consertados</Text>
          </View>
        </View>
      </View>

      {/* Ações rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações rápidas</Text>

        <View style={styles.rowThree}>
          <Pressable style={styles.actionCard} onPress={() => setScreen("RegistrarReciclagem")}>
            <View style={styles.statIconCircle}>
              <Ionicons name="refresh-outline" size={20} color="#22c55e" />
            </View>
            <Text style={styles.actionTitle}>Registrar</Text>
            <Text style={styles.actionLabel}>reciclagem</Text>
          </Pressable>

          <Pressable style={styles.actionCard} onPress={() => setScreen("Desafios")}>
            <View style={styles.statIconCircle}>
              <Ionicons name="trophy-outline" size={20} color="#22c55e" />
            </View>
            <Text style={styles.actionTitle}>Desafios</Text>
            <Text style={styles.actionLabel}>sustentáveis</Text>
          </Pressable>

          <Pressable style={styles.actionCard} onPress={() => setScreen("CriarRelato")}>
            <View style={styles.statIconCircle}>
              <Ionicons name="time-outline" size={20} color="#22c55e" />
            </View>
            <Text style={styles.actionTitle}>Reportar</Text>
            <Text style={styles.actionLabel}>relato</Text>
          </Pressable>
        </View>
      </View>

      {/* Desafios para você */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Desafios para você</Text>
          <Pressable
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => setScreen("Desafios")}
            accessibilityRole="button"
            accessibilityLabel="Ver todos os desafios"
          >
            <Text style={styles.verTodos}>Ver todos</Text>
            <Ionicons name="chevron-forward" size={14} color="#8a8a8a" />
          </Pressable>
        </View>

        <View style={[styles.card, styles.desafioCard]}>
          <ProgressRing size={64} strokeWidth={6} progress={42} color="#22c55e">
            <Text style={styles.desafioPercent}>42%</Text>
          </ProgressRing>

          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.desafioTitle}>Desafio Sem Plástico</Text>
            <Text style={styles.desafioText}>
              Evite o uso de plástico descartável por 7 dias.
            </Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: "42%" }]} />
            </View>
            <Text style={styles.desafioDias}>3 de 7 dias</Text>
          </View>

          <View style={styles.giftBox}>
            <Ionicons name="gift-outline" size={22} color="#22c55e" />
          </View>
        </View>
      </View>

      {/* Mapa */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mapa de relatos</Text>

        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={18} color="#22c55e" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar no mapa"
              placeholderTextColor="#8a8a8a"
              value={busca}
              onChangeText={setBusca}
            />
          </View>
          <Pressable style={styles.filterButton}>
            <Ionicons name="funnel-outline" size={18} color="#e5e5e5" />
          </Pressable>
        </View>

        {/* Mockup visual do mapa - trocar por MapView real depois */}
        <View style={styles.mapMock}>
          <View style={styles.mapZoomControls}>
            <View style={styles.mapZoomBtn}>
              <Ionicons name="add" size={16} color="#e5e5e5" />
            </View>
            <View style={styles.mapZoomBtn}>
              <Ionicons name="remove" size={16} color="#e5e5e5" />
            </View>
          </View>
          
          <MapPin label="Categoria: lixo" color="#ef4444" style={{ top: 14, right: 30 }} />
          <MapPin label="Categoria: esgoto" color="#22c55e" style={{ top: 70, left: 10 }} />
          <MapPin label="Categoria: infraestrutura" color="#222dc5" style={{ top: 130, left: 60 }} />
          <MapPin label="Categoria: água" color="#22c55e" style={{ top: 165, left: 190 }} />
        </View>
      </View>

      {/* Dica sustentável */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dica sustentável</Text>

        <View style={[styles.card, styles.dicaCard]}>
          <Ionicons name="leaf-outline" size={26} color="#22c55e" />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.dicaTitle}>Pequenas atitudes fazem uma grande diferença!</Text>
            <Text style={styles.dicaText}>
              Prefira produtos reutilizáveis e reduza o consumo de descartáveis.
            </Text>
          </View>
        </View>

        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: "#22c55e" }]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </ScrollView>
    <TabBar active="Home" setScreen={setScreen} />
    </View>
  );
}

function MapPin({ label, color, style }) {
  return (
    <View style={[{ position: "absolute", alignItems: "center" }, style]}>
      <Ionicons name="location" size={26} color={color} />
      {label && (
        <View style={styles.mapPinLabel}>
          <Text style={styles.mapPinLabelText}>{label}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrap: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  container: {
    flex: 1,
    backgroundColor: "#161515",
  },

  header: {
    width: "100%",
    paddingTop: 60,
    paddingBottom: 15,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  menuButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  menuOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    zIndex: 30,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 18,
  },

  menuSheet: {
    width: 180,
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 14,
    overflow: "hidden",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },

  menuItemText: {
    color: "#e5e5e5",
    fontSize: 14,
    fontWeight: "600",
  },

  logoText: {
    color: "#e5e5e5",
    fontSize: 18,
    fontWeight: "bold",
  },

  section: {
    paddingHorizontal: 25,
    marginTop: 22,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  greeting: {
    color: "#e5e5e5",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 6,
  },

  subGreeting: {
    color: "#a3a3a3",
    fontSize: 14,
    lineHeight: 20,
  },

  sectionTitle: {
    color: "#e5e5e5",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 12,
  },

  verTodos: {
    color: "#8a8a8a",
    fontSize: 13,
    marginRight: 2,
  },

  card: {
    borderWidth: 1,
    borderColor: "#262626",
    backgroundColor: "#161616",
    borderRadius: 16,
    padding: 18,
  },

  ecoScoreCard: {
    marginHorizontal: 25,
    marginTop: 20,
  },

  ecoScoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  cardTitleSmall: {
    color: "#a3a3a3",
    fontSize: 13,
    marginRight: 6,
  },

  ecoScoreBody: {
    flexDirection: "row",
    alignItems: "center",
  },

  ecoScoreNumber: {
    color: "#e5e5e5",
    fontSize: 22,
    fontWeight: "bold",
  },

  ecoScoreOf: {
    color: "#8a8a8a",
    fontSize: 11,
  },

  ecoScoreGood: {
    color: "#22c55e",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 4,
  },

  ecoScoreText: {
    color: "#a3a3a3",
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },

  outlineButton: {
    borderWidth: 1,
    borderColor: "#3a3a3a",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },

  outlineButtonText: {
    color: "#e5e5e5",
    fontSize: 12,
    fontWeight: "bold",
  },

  rowThree: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#262626",
    backgroundColor: "#161616",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    marginRight: 10,
  },

  actionCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#262626",
    backgroundColor: "#161616",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 6,
    alignItems: "center",
    marginRight: 10,
  },

  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  statNumber: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 2,
  },

  statLabel: {
    color: "#8a8a8a",
    fontSize: 10,
    textAlign: "center",
  },

  actionTitle: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 13,
  },

  actionLabel: {
    color: "#8a8a8a",
    fontSize: 10,
  },

  desafioCard: {
    flexDirection: "row",
    alignItems: "center",
  },

  desafioPercent: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 14,
  },

  desafioTitle: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },

  desafioText: {
    color: "#a3a3a3",
    fontSize: 11,
    marginBottom: 8,
  },

  progressBarBg: {
    height: 5,
    backgroundColor: "#262626",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },

  progressBarFill: {
    height: "100%",
    backgroundColor: "#22c55e",
  },

  desafioDias: {
    color: "#8a8a8a",
    fontSize: 10,
  },

  giftBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  searchRow: {
    flexDirection: "row",
    marginBottom: 14,
  },

  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: "#e5e5e5",
  },

  filterButton: {
    width: 46,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  mapMock: {
    height: 220,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#262626",
    backgroundColor: "#141b16",
    overflow: "hidden",
  },

  mapZoomControls: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 2,
  },

  mapZoomBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#1f1f1f",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  mapPinLabel: {
    backgroundColor: "#1f1f1f",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },

  mapPinLabelText: {
    color: "#e5e5e5",
    fontSize: 8,
  },

  dicaCard: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  dicaTitle: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 4,
  },

  dicaText: {
    color: "#a3a3a3",
    fontSize: 12,
    lineHeight: 17,
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3a3a3a",
    marginHorizontal: 3,
  },
});
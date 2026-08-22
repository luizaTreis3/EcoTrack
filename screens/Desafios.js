import { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import TabBar from "./TabBar";

export default function Desafios({ setScreen }) {
  const [tab, setTab] = useState("ativos");
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { label: "Início", screen: "Home", icon: "home-outline" },
    { label: "Infos", screen: "Infos", icon: "newspaper-outline" },
    { label: "Desafios", screen: "Desafios", icon: "trophy-outline" },
    { label: "Relato", screen: "CriarRelato", icon: "create-outline" },
    { label: "Perfil", screen: "MeuPerfil", icon: "person-outline" },
  ];

  const desafiosAtivos = [
    {
      icon: "reload-outline",
      iconBg: "#0f2e1a",
      iconColor: "#22c55e",
      titulo: "Recicle 5 itens",
      descricao: "Descarte corretamente 5 itens recicláveis.",
      progresso: 3,
      total: 5,
      barColor: "#22c55e",
      pontos: "+100",
      pontosColor: "#22c55e",
    },
    {
      icon: "water-outline",
      iconBg: "#0f1f2e",
      iconColor: "#3b82f6",
      titulo: "Economize água",
      descricao: "Reduza seu consumo de água em 20% durante 7 dias.",
      progresso: 5,
      total: 7,
      barColor: "#3b82f6",
      pontos: "+120",
      pontosColor: "#3b82f6",
    },
    {
      icon: "bicycle-outline",
      iconBg: "#2e2410",
      iconColor: "#f59e0b",
      titulo: "Vá de bike",
      descricao: "Utilize a bicicleta como meio de transporte por 5 dias.",
      progresso: 2,
      total: 5,
      barColor: "#f59e0b",
      pontos: "+80",
      pontosColor: "#f59e0b",
    },
    {
      icon: "bag-outline",
      iconBg: "#1c1c1c",
      iconColor: "#a3a3a3",
      titulo: "Consumo consciente",
      descricao: "Evite comprar por impulso e registre 3 compras conscientes.",
      progresso: 1,
      total: 3,
      barColor: "#a3a3a3",
      pontos: "+90",
      pontosColor: "#a3a3a3",
    },
  ];

  const desafiosConcluidos = [
    {
      icon: "reload-outline",
      iconBg: "#0f2e1a",
      iconColor: "#22c55e",
      titulo: "Recicle 5 itens",
      descricao: "Descarte corretamente 5 itens recicláveis.",
      progresso: 5,
      total: 5,
      barColor: "#22c55e",
      pontos: "+100",
      pontosColor: "#22c55e",
      dataConclusao: "02/05/2026",
    },
    {
      icon: "water-outline",
      iconBg: "#0f1f2e",
      iconColor: "#3b82f6",
      titulo: "Economize água",
      descricao: "Reduza seu consumo de água em 20% durante 7 dias.",
      progresso: 7,
      total: 7,
      barColor: "#3b82f6",
      pontos: "+120",
      pontosColor: "#3b82f6",
      dataConclusao: "01/05/2026",
    },
    {
      icon: "bicycle-outline",
      iconBg: "#2e2410",
      iconColor: "#f59e0b",
      titulo: "Vá de bike",
      descricao: "Utilize a bicicleta como meio de transporte por 5 dias.",
      progresso: 5,
      total: 5,
      barColor: "#f59e0b",
      pontos: "+80",
      pontosColor: "#f59e0b",
      dataConclusao: "29/04/2026",
    },
    {
      icon: "bag-outline",
      iconBg: "#1c1c1c",
      iconColor: "#a3a3a3",
      titulo: "Consumo consciente",
      descricao: "Evite comprar por impulso e registre 3 compras conscientes.",
      progresso: 3,
      total: 3,
      barColor: "#a3a3a3",
      pontos: "+90",
      pontosColor: "#a3a3a3",
      dataConclusao: "26/04/2026",
    },
  ];

  return (
    <View style={styles.container}>
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

      <View style={styles.header}>
        <Pressable onPress={() => setScreen("Home")}>
          <Ionicons name="chevron-back" size={26} color="#22c55e" />
        </Pressable>

        <Text style={{ fontWeight: "bold", fontSize: 20, color: "#e5e5e5" }}>
          Desafios
        </Text>

        <Pressable onPress={() => setMenuOpen((prev) => !prev)} hitSlop={12} style={styles.menuButton}>
          <Ionicons name="menu" size={26} color="#22c55e" />
        </Pressable>
      </View>

      {/* Abas */}
      <View style={styles.tabs}>
        <Pressable style={styles.tabItem} onPress={() => setTab("ativos")}>
          <Text style={[styles.tabText, tab === "ativos" && styles.tabTextActive]}>
            Ativos
          </Text>
          {tab === "ativos" && <View style={styles.tabIndicator} />}
        </Pressable>

        <Pressable style={styles.tabItem} onPress={() => setTab("concluidos")}>
          <Text style={[styles.tabText, tab === "concluidos" && styles.tabTextActive]}>
            Concluídos
          </Text>
          {tab === "concluidos" && <View style={styles.tabIndicator} />}
        </Pressable>
      </View>
      <View style={styles.tabsDivider} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {tab === "ativos" ? (
          <>
            {/* Seu progresso */}
            <Text style={styles.sectionTitle}>Seu progresso</Text>

            <View style={styles.progressCard}>
              <View style={styles.progressRingWrapper}>
                <ProgressRing progress={5 / 8} size={80} strokeWidth={8} />
                <View style={styles.progressRingTextWrapper}>
                  <Text style={styles.progressRingValue}>5/8</Text>
                  <Text style={styles.progressRingLabel}>concluídos</Text>
                </View>
              </View>

              <View style={styles.progressCardTextWrapper}>
                <Text style={styles.progressCardTitle}>Continue assim!</Text>
                <Text style={styles.progressCardDescription}>
                  Complete desafios e ganhe pontos enquanto faz a diferença.
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#8a8a8a" />
            </View>

            {/* Desafios ativos */}
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>Desafios ativos</Text>
              <Pressable style={styles.sortRow}>
                <Text style={styles.sortText}>Mais recentes</Text>
                <Ionicons name="chevron-down" size={14} color="#22c55e" />
              </Pressable>
            </View>

            {desafiosAtivos.map((item, index) => (
              <Pressable key={index} style={styles.challengeCard}>
                <View style={[styles.challengeIcon, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={22} color={item.iconColor} />
                </View>

                <View style={styles.challengeInfo}>
                  <Text style={styles.challengeTitle}>{item.titulo}</Text>
                  <Text style={styles.challengeDescription}>{item.descricao}</Text>

                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${(item.progresso / item.total) * 100}%`,
                          backgroundColor: item.barColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressBarLabel}>
                    {item.progresso}/{item.total}
                  </Text>
                </View>

                <View style={styles.challengeRight}>
                  <Text style={[styles.challengePoints, { color: item.pontosColor }]}>
                    {item.pontos}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#8a8a8a" />
                </View>
              </Pressable>
            ))}

            {/* Desafio da semana */}
            <View style={styles.weekCard}>
              <View style={styles.weekIcon}>
                <Ionicons name="trophy" size={22} color="#22c55e" />
              </View>

              <View style={styles.challengeInfo}>
                <Text style={styles.weekTitle}>Desafio da semana</Text>
                <Text style={styles.challengeDescription}>
                  Complete todos os desafios ativos e ganhe bônus especial!
                </Text>

                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: "0%", backgroundColor: "#22c55e" }]} />
                </View>
                <Text style={styles.progressBarLabel}>0/4</Text>
              </View>

              <View style={styles.giftIcon}>
                <Ionicons name="gift-outline" size={20} color="#22c55e" />
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Parabéns */}
            <View style={styles.congratsCard}>
              <View style={styles.congratsIcon}>
                <Ionicons name="trophy" size={28} color="#22c55e" />
              </View>

              <View style={styles.congratsTextWrapper}>
                <Text style={styles.congratsTitle}>Parabéns!</Text>
                <Text style={styles.congratsDescription}>
                  Você concluiu 4 desafios e está fazendo a diferença todos os dias!
                </Text>
              </View>
            </View>

            {/* Cards de resumo */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Ionicons name="ribbon-outline" size={22} color="#22c55e" />
                <Text style={styles.summaryValue}>8</Text>
                <Text style={styles.summaryLabel}>Desafios concluídos</Text>
              </View>

              <View style={styles.summaryCard}>
                <Ionicons name="flag-outline" size={22} color="#22c55e" />
                <Text style={styles.summaryValue}>+1.250</Text>
                <Text style={styles.summaryLabel}>Pontos conquistados</Text>
              </View>
            </View>

            {/* Desafios concluídos */}
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>Desafios concluídos</Text>
              <Pressable style={styles.sortRow}>
                <Text style={styles.sortText}>Mais recentes</Text>
                <Ionicons name="chevron-down" size={14} color="#22c55e" />
              </Pressable>
            </View>

            {desafiosConcluidos.map((item, index) => (
              <Pressable key={index} style={styles.challengeCard}>
                <View style={[styles.challengeIcon, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={22} color={item.iconColor} />
                </View>

                <View style={styles.challengeInfo}>
                  <Text style={styles.challengeTitle}>{item.titulo}</Text>
                  <Text style={styles.challengeDescription}>{item.descricao}</Text>

                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${(item.progresso / item.total) * 100}%`,
                          backgroundColor: item.barColor,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.completedRow}>
                    <Text style={styles.completedDate}>
                      Concluído em {item.dataConclusao}
                    </Text>
                    <Text style={styles.progressBarLabel}>
                      {item.progresso}/{item.total}
                    </Text>
                  </View>
                </View>

                <View style={styles.challengeRight}>
                  <View style={[styles.checkCircle, { borderColor: item.iconColor }]}>
                    <Ionicons name="checkmark" size={18} color={item.iconColor} />
                  </View>
                  <Text style={[styles.challengePoints, { color: item.pontosColor }]}>
                    {item.pontos}
                  </Text>
                </View>
              </Pressable>
            ))}

            {/* EcoMembro */}
            <View style={styles.weekCard}>
              <View style={styles.weekIcon}>
                <Ionicons name="trophy" size={22} color="#22c55e" />
              </View>

              <View style={styles.challengeInfo}>
                <Text style={styles.weekTitle}>Você é um EcoMembro incrível!</Text>
                <Text style={styles.challengeDescription}>
                  Continue assim e inspire mais pessoas a cuidar do planeta.
                </Text>

                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: "100%", backgroundColor: "#22c55e" }]} />
                </View>
                <Text style={styles.progressBarLabel}>4/4</Text>
              </View>

              <View style={styles.giftIcon}>
                <Ionicons name="gift-outline" size={20} color="#22c55e" />
              </View>
            </View>
          </>
        )}
      </ScrollView>
      <TabBar active="Desafios" setScreen={setScreen} />
    </View>
  );
}

function ProgressRing({ progress, size, strokeWidth }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <Svg width={size} height={size}>
      <Circle
        stroke="#2a2a2a"
        fill="none"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
      />
      <Circle
        stroke="#22c55e"
        fill="none"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161515",
  },

  header: {
    width: "100%",
    paddingTop: 75,
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
    paddingTop: 90,
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

  tabs: {
    flexDirection: "row",
    paddingHorizontal: 25,
  },

  tabItem: {
    marginRight: 30,
    paddingBottom: 12,
  },

  tabText: {
    color: "#8a8a8a",
    fontWeight: "bold",
    fontSize: 14,
  },

  tabTextActive: {
    color: "#22c55e",
  },

  tabIndicator: {
    height: 2,
    backgroundColor: "#22c55e",
    marginTop: 8,
    borderRadius: 2,
  },

  tabsDivider: {
    height: 1,
    backgroundColor: "#2a2a2a",
    marginBottom: 20,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },

  sectionTitle: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 12,
  },

  progressCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 14,
    padding: 16,
    marginBottom: 30,
  },

  progressRingWrapper: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  progressRingTextWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  progressRingValue: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 16,
  },

  progressRingLabel: {
    color: "#8a8a8a",
    fontSize: 10,
  },

  progressCardTextWrapper: {
    flex: 1,
    marginRight: 8,
  },

  progressCardTitle: {
    color: "#22c55e",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 4,
  },

  progressCardDescription: {
    color: "#8a8a8a",
    fontSize: 12,
    lineHeight: 17,
  },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sortRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  sortText: {
    color: "#22c55e",
    fontSize: 12,
    marginRight: 2,
  },

  challengeCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },

  challengeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  challengeInfo: {
    flex: 1,
    marginRight: 8,
  },

  challengeTitle: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 3,
  },

  challengeDescription: {
    color: "#8a8a8a",
    fontSize: 11,
    marginBottom: 8,
    lineHeight: 15,
  },

  progressBarBackground: {
    height: 5,
    backgroundColor: "#2a2a2a",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },

  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },

  progressBarLabel: {
    color: "#8a8a8a",
    fontSize: 10,
  },

  challengeRight: {
    alignItems: "center",
  },

  challengePoints: {
    fontWeight: "bold",
    fontSize: 13,
    marginTop: 6,
  },

  weekCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#22c55e",
    backgroundColor: "#0f1f14",
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },

  weekIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  weekTitle: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 3,
  },

  giftIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
  },

  congratsCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  congratsIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  congratsTextWrapper: {
    flex: 1,
  },

  congratsTitle: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 3,
  },

  congratsDescription: {
    color: "#8a8a8a",
    fontSize: 12,
    lineHeight: 17,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },

  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#22c55e",
    backgroundColor: "#0f1f14",
    borderRadius: 14,
    padding: 16,
    alignItems: "flex-start",
  },

  summaryValue: {
    color: "#22c55e",
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 8,
    marginBottom: 2,
  },

  summaryLabel: {
    color: "#8a8a8a",
    fontSize: 11,
  },

  completedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  completedDate: {
    color: "#8a8a8a",
    fontSize: 10,
  },

  checkCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
});
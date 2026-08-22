import { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TabBar from "./TabBar";

export default function Infos({ setScreen }) {
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
  const [diaAtivo, setDiaAtivo] = useState("Seg");
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { label: "Início", screen: "Home", icon: "home-outline" },
    { label: "Infos", screen: "Infos", icon: "newspaper-outline" },
    { label: "Desafios", screen: "Desafios", icon: "trophy-outline" },
    { label: "Relato", screen: "CriarRelato", icon: "create-outline" },
    { label: "Perfil", screen: "MeuPerfil", icon: "person-outline" },
  ];

  const categorias = [
    { nome: "Todas", icon: "reload-outline", qtd: 24, color: "#22c55e" },
    { nome: "Papel", icon: "document-text-outline", qtd: 6, color: "#3b82f6" },
    { nome: "Plástico", icon: "flask-outline", qtd: 6, color: "#ef4444" },
    { nome: "Vidro", icon: "wine-outline", qtd: 4, color: "#166534" },
    { nome: "Metal", icon: "hardware-chip-outline", qtd: 4, color: "#facc15" },
    { nome: "Orgânicos", icon: "leaf-outline", qtd: 4, color: "#92400e" },
    { nome: "Perigoso", icon: "warning-outline", qtd: 2, color: "#f97316" },
  ];

  const relatos = [
    {
      icon: "checkmark-circle",
      iconColor: "#22c55e",
      titulo: "Lixo descartado irregularmente",
      endereco: "Av. Mauá, 1234 - Centro",
      data: "12/05/2026 · 10:30",
      status: "Resolvido",
      statusBg: "#0f2e1a",
      statusColor: "#22c55e",
    },
    {
      icon: "time",
      iconColor: "#3b82f6",
      titulo: "Coleta não realizada",
      endereco: "R. São João, 567 - Schariau",
      data: "10/05/2026 · 08:15",
      status: "Em andamento",
      statusBg: "#0f1f2e",
      statusColor: "#3b82f6",
    },
    {
      icon: "alert-circle",
      iconColor: "#ef4444",
      titulo: "Entulho na via pública",
      endereco: "R. Independência, 890 - Vila Nova",
      data: "08/05/2026 · 14:40",
      status: "Pendente",
      statusBg: "#2e0f0f",
      statusColor: "#ef4444",
    },
  ];

  const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const bairros = [
    { nome: "Campestre", turno: "Coleta nos turnos", badge: "Manhã e Tarde" },
    { nome: "Vila nova", turno: "Coleta no turno", badge: "Manhã" },
    { nome: "Feitoria Seller", turno: "Coleta nos turnos", badge: "Manhã e Tarde" },
    { nome: "Bairro Independência", turno: "Coleta no turno", badge: "Tarde" },
    { nome: "Duque de Caxias", turno: "Coleta no turno", badge: "Tarde" },
  ];

  const materiais = [
    { nome: "Orgânico", icon: "leaf-outline" },
    { nome: "Papel", icon: "document-text-outline" },
    { nome: "Plástico", icon: "flask-outline" },
    { nome: "Vidro", icon: "wine-outline" },
    { nome: "Metal", icon: "hardware-chip-outline" },
    { nome: "Perigoso", icon: "warning-outline" },
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
          Infos
        </Text>

        <Pressable onPress={() => setMenuOpen((prev) => !prev)} hitSlop={12} style={styles.menuButton}>
          <Ionicons name="menu" size={26} color="#22c55e" />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Tudo o que você precisa para cuidar da cidade
        </Text>

        {/* Card do mapa */}
        <View style={styles.mapCard}>
          <View style={styles.mapVisual}>
            <View style={styles.mapDot} />
            <Ionicons name="location" size={22} color="#22c55e" style={{ position: "absolute", top: 20, left: 40 }} />
            <Ionicons name="location" size={22} color="#22c55e" style={{ position: "absolute", top: 55, right: 50 }} />
            <Ionicons name="location" size={22} color="#22c55e" style={{ position: "absolute", bottom: 15, left: 90 }} />
          </View>

          <Text style={styles.mapLabel}>Mapa interativo</Text>
          <Text style={styles.mapTitle}>Pontos de coleta</Text>
          <Text style={styles.mapDescription}>
            Encontre os pontos de coleta mais próximos de você.
          </Text>

          <Pressable style={styles.mapButton}>
            <Text style={styles.mapButtonText}>Ver todos</Text>
            <Ionicons name="chevron-forward" size={16} color="#000" />
          </Pressable>
        </View>

        {/* Filtrar por categoria */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Filtrar por categoria</Text>
          <Pressable style={styles.sortRow}>
            <Text style={styles.sortText}>Ver todas</Text>
            <Ionicons name="chevron-forward" size={14} color="#22c55e" />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 28 }}
        >
          {categorias.map((cat, index) => (
            <Pressable
              key={index}
              onPress={() => setCategoriaAtiva(cat.nome)}
              style={[
                styles.categoryChip,
                categoriaAtiva === cat.nome && styles.categoryChipActive,
              ]}
            >
              <Ionicons name={cat.icon} size={22} color={cat.color} />
              <Text
                style={[
                  styles.categoryText,
                  categoriaAtiva === cat.nome && styles.categoryTextActive,
                ]}
              >
                {cat.nome}
              </Text>
              <Text style={styles.categoryQtd}>{cat.qtd}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Meus relatos */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Meus relatos</Text>
          <Pressable style={styles.sortRow}>
            <Text style={styles.sortText}>Ver todos</Text>
            <Ionicons name="chevron-forward" size={14} color="#22c55e" />
          </Pressable>
        </View>

        {relatos.map((item, index) => (
          <Pressable key={index} style={styles.relatoCard}>
            <Ionicons name={item.icon} size={22} color={item.iconColor} style={{ marginRight: 12 }} />

            <View style={styles.relatoInfo}>
              <Text style={styles.relatoTitle}>{item.titulo}</Text>

              <View style={styles.relatoLine}>
                <Ionicons name="location-outline" size={12} color="#8a8a8a" />
                <Text style={styles.relatoText}>{item.endereco}</Text>
              </View>

              <View style={styles.relatoLine}>
                <Ionicons name="time-outline" size={12} color="#8a8a8a" />
                <Text style={styles.relatoText}>{item.data}</Text>
              </View>
            </View>

            <View style={styles.relatoRight}>
              <View style={[styles.statusBadge, { backgroundColor: item.statusBg }]}>
                <Text style={[styles.statusText, { color: item.statusColor }]}>
                  {item.status}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#8a8a8a" style={{ marginTop: 8 }} />
            </View>
          </Pressable>
        ))}

        {/* Coleta Seletiva */}
        <Text style={styles.sectionTitle}>Coleta Seletiva</Text>
        <Text style={styles.mapDescription}>
          Consulte os dias e horários da coleta no seu bairro.
        </Text>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#8a8a8a" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Buscar seu bairro..."
              placeholderTextColor="#8a8a8a"
              style={styles.searchInput}
            />
          </View>
          <Pressable style={styles.filterButton}>
            <Ionicons name="options-outline" size={18} color="#22c55e" />
          </Pressable>
        </View>

        {/* Próxima coleta */}
        <Text style={styles.sectionTitle}>Próxima Coleta</Text>

        <View style={styles.nextCollectionCard}>
          <View style={styles.nextCollectionLeft}>
            <View style={styles.calendarIcon}>
              <Ionicons name="calendar" size={22} color="#22c55e" />
            </View>

            <View>
              <Text style={styles.nextCollectionLabel}>No seu bairro</Text>
              <Text style={styles.nextCollectionTitle}>Centro</Text>
              <View style={styles.nextCollectionBadge}>
                <Text style={styles.nextCollectionBadgeText}>Terça-feira ; Manhã e Tarde</Text>
              </View>
            </View>
          </View>

          <View style={styles.nextCollectionRight}>
            <Ionicons name="leaf-outline" size={16} color="#22c55e" />
            <Text style={styles.nextCollectionDaysLabel}>Faltam</Text>
            <Text style={styles.nextCollectionDays}>1 dia</Text>
            <Text style={styles.nextCollectionDate}>10 de jun ; Terça</Text>
          </View>
        </View>

        {/* Ver cronograma por dia */}
        <Text style={styles.sectionTitle}>Ver cronograma por dia</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
        >
          {dias.map((dia, index) => (
            <Pressable
              key={index}
              onPress={() => setDiaAtivo(dia)}
              style={[
                styles.dayChip,
                diaAtivo === dia && styles.dayChipActive,
              ]}
            >
              <Text
                style={[
                  styles.dayChipText,
                  diaAtivo === dia && styles.dayChipTextActive,
                ]}
              >
                {dia}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Bairros */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Bairros - Segunda-feira</Text>
          <Pressable style={styles.sortRow}>
            <Text style={styles.sortText}>16 bairros</Text>
            <Ionicons name="chevron-forward" size={14} color="#22c55e" />
          </Pressable>
        </View>

        <View style={styles.bairrosGroup}>
          {bairros.map((bairro, index) => (
            <Pressable
              key={index}
              style={[
                styles.bairroItem,
                index !== bairros.length - 1 && styles.bairroItemBorder,
              ]}
            >
              <View style={styles.bairroIconCircle}>
                <Ionicons name="home-outline" size={18} color="#22c55e" />
              </View>

              <View style={styles.bairroInfo}>
                <Text style={styles.bairroNome}>{bairro.nome}</Text>
                <Text style={styles.bairroTurno}>{bairro.turno}</Text>
              </View>

              <View style={styles.bairroBadge}>
                <Text style={styles.bairroBadgeText}>{bairro.badge}</Text>
              </View>

              <Ionicons name="chevron-forward" size={16} color="#8a8a8a" style={{ marginLeft: 8 }} />
            </Pressable>
          ))}

          <Pressable style={[styles.bairroItem, { justifyContent: "center" }]}>
            <Ionicons name="map-outline" size={18} color="#22c55e" style={{ marginRight: 8 }} />
            <Text style={styles.verMapaText}>Ver no mapa</Text>
          </Pressable>
        </View>

        {/* Materiais aceitos */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Materiais aceitos</Text>
          <Pressable style={styles.sortRow}>
            <Text style={styles.sortText}>Ver todos</Text>
            <Ionicons name="chevron-forward" size={14} color="#22c55e" />
          </Pressable>
        </View>

        <View style={styles.materiaisRow}>
          {materiais.map((mat, index) => (
            <View key={index} style={styles.materialItem}>
              <View style={styles.materialIconCircle}>
                <Ionicons name={mat.icon} size={20} color="#22c55e" />
              </View>
              <Text style={styles.materialText}>{mat.nome}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <TabBar active="Infos" setScreen={setScreen} />
    </View>
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

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  subtitle: {
    color: "#8a8a8a",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
  },

  mapCard: {
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
    overflow: "hidden",
  },

  mapVisual: {
    height: 130,
    backgroundColor: "#0f1f14",
    borderRadius: 12,
    marginBottom: 14,
    position: "relative",
    overflow: "hidden",
  },

  mapDot: {
    position: "absolute",
    top: "45%",
    left: "45%",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3b82f6",
  },

  mapLabel: {
    color: "#22c55e",
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 4,
  },

  mapTitle: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 6,
  },

  mapDescription: {
    color: "#8a8a8a",
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 16,
  },

  mapButton: {
    backgroundColor: "#22c55e",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 20,
  },

  mapButtonText: {
    color: "#000",
    fontWeight: "bold",
    marginRight: 4,
  },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 15,
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

  categoryChip: {
    width: 76,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 12,
    paddingVertical: 14,
    marginRight: 10,
  },

  categoryChipActive: {
    borderColor: "#22c55e",
    backgroundColor: "#0f1f14",
  },

  categoryText: {
    color: "#8a8a8a",
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 6,
  },

  categoryTextActive: {
    color: "#22c55e",
  },

  categoryQtd: {
    color: "#8a8a8a",
    fontSize: 10,
    marginTop: 2,
  },

  relatoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  relatoInfo: {
    flex: 1,
    marginRight: 8,
  },

  relatoTitle: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 6,
  },

  relatoLine: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },

  relatoText: {
    color: "#8a8a8a",
    fontSize: 11,
    marginLeft: 5,
  },

  relatoRight: {
    alignItems: "flex-end",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 28,
  },

  searchBox: {
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
    paddingVertical: 14,
    color: "#e5e5e5",
    fontSize: 13,
  },

  filterButton: {
    width: 46,
    height: 46,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  nextCollectionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#22c55e",
    backgroundColor: "#0f1f14",
    borderRadius: 14,
    padding: 16,
    marginBottom: 28,
  },

  nextCollectionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  calendarIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  nextCollectionLabel: {
    color: "#22c55e",
    fontSize: 11,
    marginBottom: 2,
  },

  nextCollectionTitle: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 6,
  },

  nextCollectionBadge: {
    backgroundColor: "#163a22",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },

  nextCollectionBadgeText: {
    color: "#22c55e",
    fontSize: 10,
    fontWeight: "bold",
  },

  nextCollectionRight: {
    alignItems: "flex-end",
  },

  nextCollectionDaysLabel: {
    color: "#8a8a8a",
    fontSize: 10,
    marginTop: 4,
  },

  nextCollectionDays: {
    color: "#22c55e",
    fontWeight: "bold",
    fontSize: 16,
    marginVertical: 2,
  },

  nextCollectionDate: {
    color: "#8a8a8a",
    fontSize: 10,
  },

  dayChip: {
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },

  dayChipActive: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },

  dayChipText: {
    color: "#8a8a8a",
    fontWeight: "bold",
    fontSize: 12,
  },

  dayChipTextActive: {
    color: "#000",
  },

  bairrosGroup: {
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 14,
    marginBottom: 28,
    overflow: "hidden",
  },

  bairroItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },

  bairroItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },

  bairroIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0f1f14",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  bairroInfo: {
    flex: 1,
  },

  bairroNome: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 2,
  },

  bairroTurno: {
    color: "#8a8a8a",
    fontSize: 10,
  },

  bairroBadge: {
    backgroundColor: "#163a22",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  bairroBadgeText: {
    color: "#22c55e",
    fontSize: 10,
    fontWeight: "bold",
  },

  verMapaText: {
    color: "#22c55e",
    fontWeight: "bold",
    fontSize: 13,
  },

  materiaisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  materialItem: {
    alignItems: "center",
    flex: 1,
  },

  materialIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  materialText: {
    color: "#8a8a8a",
    fontSize: 9,
    textAlign: "center",
  },
});
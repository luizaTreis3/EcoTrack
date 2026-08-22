import { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TabBar from "./TabBar";

export default function MeuPerfil({ setScreen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuItems = [
    { label: "Início", screen: "Home", icon: "home-outline" },
    { label: "Infos", screen: "Infos", icon: "newspaper-outline" },
    { label: "Desafios", screen: "Desafios", icon: "trophy-outline" },
    { label: "Relato", screen: "CriarRelato", icon: "create-outline" },
    { label: "Perfil", screen: "MeuPerfil", icon: "person-outline" },
  ];

  return (
    <View style={styles.container}>
      {menuOpen && (
        <Pressable style={styles.menuOverlay} onPress={() => setMenuOpen(false)}>
          <View style={styles.menuSheet}>
            {menuItems.map((item) => (
              <Pressable
                key={item.label}
                style={styles.dropdownItem}
                onPress={() => {
                  setMenuOpen(false);
                  setScreen(item.screen);
                }}
              >
                <Ionicons name={item.icon} size={18} color="#22c55e" />
                <Text style={styles.dropdownItemText}>{item.label}</Text>
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
          Meu Perfil
        </Text>

        <Pressable onPress={() => setMenuOpen((previous) => !previous)} hitSlop={12} style={styles.menuButton}>
          <Ionicons name="menu" size={26} color="#22c55e" />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Foto + dados do usuário */}
        <View style={styles.profileRow}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>FOTO</Text>
            </View>
            <Pressable style={styles.cameraButton} onPress={() => setScreen("Perfil:pessoal")}>
              <Ionicons name="camera" size={16} color="#000" />
            </Pressable>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>Lucas Oliveira S.</Text>
            <Text style={styles.email}>lucas.oliveira.ss@gmail.com</Text>

            <View style={styles.infoLine}>
              <Ionicons name="location-outline" size={14} color="#8a8a8a" />
              <Text style={styles.infoText}>Schariau, SL</Text>
            </View>

            <View style={styles.infoLine}>
              <Ionicons name="calendar-outline" size={14} color="#8a8a8a" />
              <Text style={styles.infoText}>Membro desde jan/2026</Text>
            </View>
          </View>
        </View>

        {/* Card de impacto */}
        <View style={styles.impactCard}>
          <View style={styles.impactHeader}>
            <Text style={styles.impactTitle}>Seu Impacto</Text>
            <Pressable style={styles.impactLinkRow} onPress={() => setScreen("Perfil:impacto")}>
              <Text style={styles.impactLink}>Ver relatório</Text>
              <Ionicons name="chevron-forward" size={14} color="#22c55e" />
            </Pressable>
          </View>

          <View style={styles.impactStats}>
            <View style={styles.impactStat}>
              <View style={styles.impactIconCircle}>
                <Ionicons name="leaf-outline" size={20} color="#22c55e" />
              </View>
              <Text style={styles.impactValue}>12,4 kg</Text>
              <Text style={styles.impactLabel}>CO² evitado</Text>
            </View>

            <View style={styles.impactStat}>
              <View style={styles.impactIconCircle}>
                <Ionicons name="reload-outline" size={20} color="#22c55e" />
              </View>
              <Text style={styles.impactValue}>23</Text>
              <Text style={styles.impactLabel}>Materiais reciclados</Text>
            </View>

            <View style={styles.impactStat}>
              <View style={styles.impactIconCircle}>
                <Ionicons name="cut-outline" size={20} color="#22c55e" />
              </View>
              <Text style={styles.impactValue}>128</Text>
              <Text style={styles.impactLabel}>Ações realizadas</Text>
            </View>
          </View>
        </View>

        {/* Conta */}
        <Text style={styles.sectionTitle}>Conta</Text>
        <View style={styles.menuGroup}>
          <MenuItem icon="person-outline" label="Informações pessoais" onPress={() => setScreen("Perfil:pessoal")} />
          <MenuItem icon="lock-closed-outline" label="Segurança" onPress={() => setScreen("RecuperarAcesso")} />
          <MenuItem icon="notifications-outline" label="Notificações" onPress={() => setScreen("Perfil:notificacoes")} />
          <MenuItem icon="shield-checkmark-outline" label="Privacidade" onPress={() => setScreen("Perfil:privacidade")} isLast />
        </View>

        {/* Geral */}
        <Text style={styles.sectionTitle}>Geral</Text>
        <View style={styles.menuGroup}>
          <MenuItem icon="document-text-outline" label="Termos de uso" onPress={() => setScreen("Perfil:termos")} />
          <MenuItem icon="help-circle-outline" label="Central de ajuda" onPress={() => setScreen("Perfil:ajuda")} />
          <MenuItem icon="alert-circle-outline" label="Sobre o EcoTrack" onPress={() => setScreen("Perfil:sobre")} isLast />
        </View>

        {/* Preferências */}
        <Text style={styles.sectionTitle}>Preferências</Text>
        <View style={styles.menuGroup}>
          <MenuItem icon="globe-outline" label="Idioma" onPress={() => setScreen("Perfil:idioma")} />
          <MenuItem icon="moon-outline" label="Tema" onPress={() => setScreen("Perfil:tema")} />
          <MenuItem icon="accessibility-outline" label="Acessibilidade" onPress={() => setScreen("Perfil:acessibilidade")} isLast />
        </View>

        {/* Sair da conta */}
        <Pressable style={styles.logoutRow} onPress={() => setScreen("Login")}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Sair da conta</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ef4444" />
        </Pressable>
      </ScrollView>
      <TabBar active="MeuPerfil" setScreen={setScreen} />
    </View>
  );
}

function MenuItem({ icon, label, isLast, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.menuItem, !isLast && styles.menuItemBorder]}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon} size={20} color="#22c55e" />
        <Text style={styles.menuItemText}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#8a8a8a" />
    </Pressable>
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

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },

  dropdownItemText: {
    color: "#e5e5e5",
    fontSize: 14,
    fontWeight: "600",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 130,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 25,
  },

  avatarWrapper: {
    position: "relative",
    marginRight: 16,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#22c55e",
    backgroundColor: "#161616",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#8a8a8a",
    fontWeight: "bold",
    fontSize: 12,
  },

  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#22c55e",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0f0f0f",
  },

  profileInfo: {
    flex: 1,
  },

  name: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 2,
  },

  email: {
    color: "#8a8a8a",
    fontSize: 13,
    marginBottom: 8,
  },

  infoLine: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },

  infoText: {
    color: "#8a8a8a",
    fontSize: 12,
    marginLeft: 5,
  },

  impactCard: {
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 14,
    padding: 18,
    marginBottom: 25,
  },

  impactHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  impactTitle: {
    color: "#22c55e",
    fontWeight: "bold",
    fontSize: 15,
  },

  impactLinkRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  impactLink: {
    color: "#22c55e",
    fontSize: 12,
    marginRight: 2,
  },

  impactStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  impactStat: {
    alignItems: "center",
    flex: 1,
  },

  impactIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  impactValue: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 2,
  },

  impactLabel: {
    color: "#8a8a8a",
    fontSize: 11,
    textAlign: "center",
  },

  sectionTitle: {
    color: "#e5e5e5",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 10,
  },

  menuGroup: {
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
    borderRadius: 14,
    marginBottom: 25,
    overflow: "hidden",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 16,
  },

  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#3a3a3a",
  },

  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  menuItemText: {
    color: "#e5e5e5",
    fontSize: 14,
    marginLeft: 10,
  },

  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#3a1a1a",
    backgroundColor: "#1a1010",
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  logoutText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
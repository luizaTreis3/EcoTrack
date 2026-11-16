import { View, Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TabBar({ active, setScreen }) {
  const tabs = [
    { key: "Home", label: "Início", icon: "home-outline", activeIcon: "home" },
    { key: "Infos", label: "Infos", icon: "newspaper-outline", activeIcon: "newspaper" },
    { key: "CriarRelato", label: "Registrar", icon: "add-circle-outline", activeIcon: "add-circle" },
    { key: "Desafios", label: "Desafios", icon: "trophy-outline", activeIcon: "trophy" },
    { key: "MeuPerfil", label: "Perfil", icon: "person-outline", activeIcon: "person" },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const isCenter = tab.key === "CriarRelato";

        return (
          <Pressable
            key={tab.key}
            style={isCenter ? styles.centerItem : styles.tabItem}
            onPress={() => setScreen(isCenter ? "CriarRelato" : tab.key)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isCenter ? "Criar relato" : tab.label}
          >
            <View style={isCenter ? styles.centerIconWrap : styles.iconWrap}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={isCenter ? 28 : 22}
                color={isCenter ? "#ffffff" : isActive ? "#22c55e" : "#8a8a8a"}
              />
            </View>
            {!isCenter && (
              <Text style={[styles.label, isActive && styles.activeLabel]}>{tab.label}</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 12,
    zIndex: 100,
    elevation: 0,
    overflow: "visible",
    borderRadius: 30,
    backgroundColor: "#161515",
    borderWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 58,
  },
  centerItem: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -28,
    backgroundColor: "#22c55e",
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#161515",
    zIndex: 2,
    elevation: 0,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerIconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginTop: 4,
    fontSize: 10,
    color: "#8a8a8a",
    fontWeight: "600",
  },
  activeLabel: {
    color: "#22c55e",
  },
});

// app/_layout.jsx
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Layout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fbf7" }}>
      <View style={styles.topbar}>
        <Pressable style={styles.iconBtn}><Ionicons name="menu" size={18} /></Pressable>
        <View style={styles.search}>
          <Ionicons name="search" size={14} />
          <TextInput placeholder="Search" style={{ flex: 1, marginLeft: 6 }} />
        </View>
        <Pressable style={styles.iconBtn}><Ionicons name="person-circle-outline" size={20} /></Pressable>
      </View>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topbar: {
    height: 56,
    paddingHorizontal: 12,
    backgroundColor: "#cfe8cf",
    borderBottomWidth: 1,
    borderColor: "#b6d5b6",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    width: 32, height: 32, alignItems: "center", justifyContent: "center",
    borderRadius: 8, backgroundColor: "white",
  },
  search: {
    flex: 1, height: 34, borderRadius: 8, paddingHorizontal: 10,
    backgroundColor: "white", borderWidth: 1, borderColor: "#e5efe5",
    flexDirection: "row", alignItems: "center", gap: 6,
  },
});

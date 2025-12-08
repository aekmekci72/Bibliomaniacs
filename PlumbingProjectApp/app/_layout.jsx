import "./login";
import { useState, useRef, useEffect } from "react";
import { Image, Animated, Dimensions, Pressable, Text, View, TextInput } from "react-native";
import { Link, Stack, usePathname } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../firebaseConfig";
import axios from "axios";
import './global.css';

export default function Layout() {
  const pathname = usePathname();
  const [role, setRole] = useState(null);

  // Map a route to a simple page name  
  function getPage() {
    if (pathname === "/landingpage") return "landingpage";
    if (pathname.startsWith("/dbtest")) return "dbtest";
    if (pathname.startsWith("/explorer")) return "explorer";
    if (pathname.startsWith("/chatbot")) return "chatbot";
    if (pathname.startsWith("/filedownload")) return "filedownload";
    if (pathname.startsWith("/login")) return "login";
    if (pathname.startsWith("/adminonly")) return "adminonly";

    return "";
  }

  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-270)).current;
  const SCREEN_WIDTH = Dimensions.get("window").width;


  const fetchRole = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setRole("no account"); // TEMP FIX
        return;
      }
  
      const idToken = await user.getIdToken(true);
  
      const res = await axios.post("http://localhost:5001/get_user_role", {
        idToken,
      });
      const roleValue = typeof res.data === "string" ? res.data : res.data.role;

      setRole(roleValue);

    } catch (err) {
      console.error(err);
    }
  };


  const toggleMenu = () => {
    const toValue = isOpen ? -270 : 0;
    setIsOpen(!isOpen);

    fetchRole();

    Animated.timing(slideAnim, {
      toValue,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };


  function NavItem({ icon, label, page, href }) {
    const isActive = getPage() === page;
  
    return (
      <Link href={href} asChild>
        <Pressable
          className={`flex-row items-center px-3 py-2 rounded-lg gap-3
            ${isActive ? "bg-gray-100" : ""}
          `}
        >
          <Ionicons
            name={icon}
            size={18}
            className={isActive ? "text-green-600" : "text-gray-500"}
          />
  
          <Text
            className={`text-sm
              ${isActive ? "text-green-600 font-semibold" : "text-gray-800"}
            `}
          >
            {label}
          </Text>
        </Pressable>
      </Link>
    );
  }

  useEffect(() => {    
    const unsubscribe = auth.onAuthStateChanged((user) => {
  
      fetchRole();
    });
  
    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fbf7" }}>
      <View className="topbar">
        <Pressable className="iconBtn" onPress={toggleMenu}>
          <Ionicons name="menu" size={18} />
        </Pressable>
        <View className="searchBar">
          <Ionicons name="search" size={14} />
          <TextInput placeholder="Search" style={{ flex: 1, marginLeft: 6 }} />
        </View>
        <Pressable className="iconBtn"><Ionicons name="person-circle-outline" size={20} /></Pressable>
      </View>
      <Stack screenOptions={{ headerShown: false }} />

      {/* Drawer Backdrop */}
      {isOpen && (
        <Pressable
          onPress={toggleMenu}
          style={{
            position: "absolute",
            width: SCREEN_WIDTH,
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.35)",
            zIndex: 1,
          }}
        />
      )}

      {/* Sliding Sidebar */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 260,
          height: "100%",
          backgroundColor: "white",
          paddingTop: 60,
          paddingHorizontal: 20,
          zIndex: 2,
          transform: [{ translateX: slideAnim }],
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 8,
        }}
      >
        {/* Logo */}
        <View style={{ marginBottom: 30, flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Image source={require("../assets/logo.png")} style={{ width: 22, height: 22, resizeMode: "contain" }} />
          <Text style={{ fontSize: 22, fontWeight: "600" }}>Bibliomaniacs</Text>
        </View>

        {/* Navigation Group */}
        <View className="mt-4 space-y-1">
          {role === "no account" && (
            <NavItem icon="home-outline" label="Landing Page" page="landingpage" href="/landingpage" />
          )}
          <NavItem icon="trending-up-outline" label="DB Test" page="dbtest" href="/dbtest" />
          <NavItem icon="calendar-outline" label="Explorer" page="explorer" href="/explorer" />
          <NavItem icon="document-text-outline" label="ChatBot" page="chatbot" href="/chatbot" />
          <NavItem icon="checkbox-outline" label="File Download" page="filedownload" href="/filedownload" />
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: "#e5e7eb", marginVertical: 20 }} />

        {/* Section Header */}
        <Text style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>Section Divider</Text>
        
        <View style={{ gap: 6 }}>
          {role === "admin" && (
            <NavItem icon="briefcase-outline" label="Admin Only" page="adminonly" href="/adminonly" />
          )}

          <NavItem icon="albums-outline" label="Accounts" href="/" />

          <NavItem icon="people-outline" label="Contacts" href="/" />

          <NavItem icon="help-circle-outline" label="Login" page="login" href="/login" />

        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

// const styles = StyleSheet.create({
//   topbar: {
//     height: 56,
//     paddingHorizontal: 12,
//     backgroundColor: "#cfe8cf",
//     borderBottomWidth: 1,
//     borderColor: "#b6d5b6",
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//   },
//   iconBtn: {
//     width: 32, height: 32, alignItems: "center", justifyContent: "center",
//     borderRadius: 8, backgroundColor: "white",
//   },
//   search: {
//     flex: 1, height: 34, borderRadius: 8, paddingHorizontal: 10,
//     backgroundColor: "white", borderWidth: 1, borderColor: "#e5efe5",
//     flexDirection: "row", alignItems: "center", gap: 6,
//   },
// });

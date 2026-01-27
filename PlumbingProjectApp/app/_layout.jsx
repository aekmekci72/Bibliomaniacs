import "./login";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, app } from "../firebaseConfig";
import { useState, useRef, useEffect } from "react";
import { Image, Animated, Dimensions, Pressable, Text, View, TextInput, ScrollView } from "react-native";
import { Link, Stack, usePathname, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5, AntDesign } from "@expo/vector-icons";
import axios from "axios";
import './global.css';

export default function Layout() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState(null);

  // Map a route to a simple page name  
  function getPage() {
    if (pathname.startsWith("/landingpage")) return "landingpage";
    if (pathname === "/homepage") return "homepage";
    if (pathname.startsWith("/explorer")) return "explorer";
    if (pathname.startsWith("/myreviews")) return "myreviews";
    if (pathname.startsWith("/reviewpage")) return "reviewpage";
    if (pathname.startsWith("/profile")) return "profile";
    if (pathname.startsWith("/admin-reviews")) return "admin-reviews";
    if (pathname.startsWith("/admindashboard")) return "admindashboard";
    if (pathname.startsWith("/adminhomepage")) return "adminhomepage";
    if (pathname.startsWith("/login")) return "login";

    return "";
  }

  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-270)).current;
  const SCREEN_WIDTH = Dimensions.get("window").width;

  const [notifOpen, setNotifOpen] = useState(false);


  // NOTIFICATION VARIABLES
  const dummyNotifications = [
    { id: "n1", iconSet: "Ionicons", icon: "checkmark-circle-outline", text: "Your [Catcher in the Rye] review was approved by Ms. Rivera." },
    { id: "n2", iconSet: "Ionicons", icon: "time-outline", text: "Your [The Giver] review is currently in review." },
    { id: "n3", iconSet: "Ionicons", icon: "mail-unread-outline", text: "New message from an admin about your volunteer hours." },
    { id: "n4", iconSet: "Ionicons", icon: "alert-circle-outline", text: "Your review needs a quick edit: missing grade level." },
    { id: "n5", iconSet: "Ionicons", icon: "sparkles-outline", text: "Book of the Week has been updated—check it out!" },
    { id: "n6", iconSet: "Ionicons", icon: "document-text-outline", text: "Reminder: finish your draft for [Fahrenheit 451]." },
  ].slice(0, 12);

  const shouldScroll = dummyNotifications.length > 6;

  const handleNotificationPress = (notif) => {
    // later: mark as read + route based on notif.type/href
    setNotifOpen(false);
    router.push("/myreviews");
  };


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


  function NavItem({ icon, IconSet, label, page, href }) {
    const isActive = getPage() === page;
  
    return (
      <Link href={href} asChild>
        <Pressable
          className={`flex-row items-center px-3 py-2 rounded-lg gap-3
            ${isActive ? "bg-gray-100" : ""}
          `}
        >
          <IconSet
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
    <View className="topbar flex-row items-center px-4">
      <Pressable className="iconBtn" onPress={toggleMenu}>
        <Ionicons name="menu" size={18} />
      </Pressable>

      <View className="flex-1 flex-row">
        <Pressable
          className="iconBtn ml-auto"
          onPress={() => {
            setIsOpen(false);
            setNotifOpen((v) => !v);
          }}
        >
          <FontAwesome5 name="inbox" size={16} color="rgb(71, 71, 71)" />
        </Pressable>
      </View>

      <Pressable
        className="iconBtn ml-auto rounded-full"
        onPress={() => router.push("/profile")}
      >
        <Ionicons name="person-circle-outline" size={20} color='rgb(71, 71, 71)' />
      </Pressable>
    </View>

    {/* NOTIFICATION MENU */}
    {notifOpen && (
      <Pressable
        onPress={() => setNotifOpen(false)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 5, // below popover, above page
          backgroundColor: "transparent",
        }}
      />
    )}

    {/* Notification Popover */}
    {notifOpen && (
      <View
        style={{
          position: "absolute",
          top: 62, // tweak if your topbar height differs
          right: 16, // aligns under right-side icons
          width: 320, // fixed width
          maxHeight: Dimensions.get("window").height * 0.55, // a little over half screen
          backgroundColor: "white",
          borderRadius: 14,
          paddingVertical: 10,
          zIndex: 6,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          borderWidth: 1,
          borderColor: "#e5e7eb",
        }}
      >
        <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>
            Notifications
          </Text>
          <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 2 }}>
            Recent activity
          </Text>
        </View>

        <View style={{ height: 1, backgroundColor: "#e5e7eb" }} />

        {/* List (top-aligned; scroll only if needed) */}
        <View
          style={{
            maxHeight: shouldScroll ? Dimensions.get("window").height * 0.55 : undefined,
          }}
        >
          <ScrollView
            style={{ paddingHorizontal: 10, paddingTop: 8 }}
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            {dummyNotifications.map((n) => (
              <Pressable
                key={n.id}
                onPress={() => handleNotificationPress(n)}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 10,
                  borderRadius: 12,
                }}
              >
                <Ionicons
                  name={n.icon}
                  size={18}
                  color="#374151"
                  style={{ marginTop: 1 }}
                />

                <Text
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: "#111827",
                    lineHeight: 18,
                  }}
                >
                  {n.text}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    )}

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
        {role === "user" ? (
          <View style={{ marginBottom: 30, flexDirection: "row", alignItems: "center", gap: 5 }} href="/homepage">
            <Image source={require("../assets/logo.png")} style={{ width: 22, height: 22, resizeMode: "contain" }} />
            <Text style={{ fontSize: 22, fontWeight: "600" }}>Bibliomaniacs</Text>
          </View>
        ) : role === "admin" ? (
          <View style={{ marginBottom: 30, flexDirection: "row", alignItems: "center", gap: 5 }} href="/adminhomepage">
            <Image source={require("../assets/logo.png")} style={{ width: 22, height: 22, resizeMode: "contain" }} />
            <Text style={{ fontSize: 22, fontWeight: "600" }}>Bibliomaniacs</Text>
          </View>
        ) : (
          <View style={{ marginBottom: 30, flexDirection: "row", alignItems: "center", gap: 5 }} href="/landingpage">
            <Image source={require("../assets/logo.png")} style={{ width: 22, height: 22, resizeMode: "contain" }} />
            <Text style={{ fontSize: 22, fontWeight: "600" }}>Bibliomaniacs</Text>
          </View>
        )}

        {/* Navigation Group */}
        {/* homepage, explorer, myreviews, reviewpage, profile, admin-reviews, admindashboard, adminhomepage */}
        <View className="mt-4 space-y-1">
          {role === "no account" && (
            <>
              <NavItem icon="home-outline" IconSet={Ionicons} label="Landing Page" page="landingpage" href="/landingpage" />
              <NavItem icon="trending-up-outline" IconSet={Ionicons} label="Explorer" page="explorer" href="/explorer" />
            </>
          )}

          {role === "user" && (
            <>
              <NavItem icon="trending-up-outline" IconSet={Ionicons} label="Explorer" page="explorer" href="/explorer" />
              <NavItem icon="document-text-outline" IconSet={Ionicons} label="My Reviews" page="myreviews" href="/myreviews" />
              <NavItem icon="calendar-outline" IconSet={Ionicons} label="Review Page" page="reviewpage" href="/reviewpage" />
              <NavItem icon="checkbox-outline" IconSet={Ionicons} label="Profile" page="profile" href="/profile" />
            </>
          )}

          {role === "admin" && (
            <>
            <NavItem icon="document-text-outline" IconSet={Ionicons} label="Admin Reviews" page="admin-reviews" href="/admin-reviews" />
            <NavItem icon="calendar-outline" IconSet={Ionicons} label="Admin Dashboard" page="admindashboard" href="/admindashboard" />
            <NavItem icon="checkbox-outline" IconSet={Ionicons} label="Admin Homepage" page="adminhomepage" href="/adminhomepage" />
            
            <View style={{ height: 1, backgroundColor: "#e5e7eb", marginVertical: 20 }} />
            <NavItem icon="trending-up-outline" IconSet={Ionicons} label="Explorer" page="explorer" href="/explorer" />
            </>
          )}

          <View style={{ height: 1, backgroundColor: "#e5e7eb", marginVertical: 20 }} />
          <NavItem icon="question-circle" IconSet={AntDesign} label="About" page="about" href="https://ridgewoodlibrary.org/about/" />
          <NavItem icon="person" IconSet={Ionicons} label="Logout" page="login" href="/login" />
          
        </View>

        {/* Divider */}
        {/* <View style={{ height: 1, backgroundColor: "#e5e7eb", marginVertical: 20 }} /> */}

        {/* Section Header */}
        {/* <Text style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>Section Divider</Text>
        
      <View style={{ gap: 6 }}>

    {role === "admin" && (
      <>
        <NavItem
          icon="grid-outline"
          label="Admin Dashboard"
          page="admin-dashboard"
          href="/admindashboard"
        />

        <NavItem
          icon="list-outline"
          label="Submitted Reviews"
          page="admin-reviews"
          href="/admin-reviews"
        />
        
        <NavItem
          icon="briefcase-outline"
          label="Admin Only"
          page="adminonly"
          href="/adminonly"
        />
      </>
    )}        <NavItem icon="albums-outline" label="Accounts" href="/" />
        <NavItem icon="people-outline" label="Contacts" href="/" />
        <NavItem icon="help-circle-outline" label="Login" page="login" href="/login" /> */}

      {/* </View> */}
      </Animated.View>
    </SafeAreaView>

    
  );
}


export async function SendNotif(type, sender, recipients, book = "", status = "") {
  try {
    const db = getFirestore(app);

    console.log("sendNotif: ", recipients);

    let message = "";
    let icon = "";

    if (type === "new_review") {
      icon = "document-text-outline";
      message = `${sender} submitted a new review of ${book}`;
    }

    else if (type === "review_status") {
      icon = "checkmark-circle-outline";
      message = `Your review of ${book} was ${status} by ${sender}`;
    }

    else if (type === "book_of_the_week") {
      icon = "sparkles-outline";
      message = "Book of the Week has been updated, check it out!";
    }

    else {
      console.error("Invalid notification type:", type);
      return;
    }

    // 3. Build the new notification object
    const newNotif = {
      type,
      icon,
      message,
      createdAt: Date.now(),
    };

    // 4. Update notifications for each recipient
    for (const uid of recipients) {
      try {
        const userRef = doc(db, "users", uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          console.warn(`Recipient ${uid} does not exist in Firestore.`);
          continue;
        }

        const data = snap.data();
        let notifArray = Array.isArray(data.notifications)
          ? [...data.notifications]
          : [];

        // Add new notification to the top
        notifArray.unshift(newNotif);

        // Trim to max of 8
        if (notifArray.length > 8) {
          notifArray = notifArray.slice(0, 8);
        }

        // Save updated array to Firestore
        await updateDoc(userRef, {
          notifications: notifArray,
        });

      } catch (err) {
        console.error(`Error updating notifications for ${uid}:`, err);
      }
    }

  } catch (err) {
    console.error("sendNotif error:", err);
  }
}

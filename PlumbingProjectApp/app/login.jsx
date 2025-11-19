import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import axios from "axios";

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function Login() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const idToken = await user.getIdToken(true);
          const res = await axios.post("http://localhost:5001/verify_token", { idToken });
          setRole(res.data.role);
        } catch (err) {
          console.error("Failed to fetch role:", err);
          setRole("user");
        }
      } else {
        setCurrentUser(null);
        setRole(null);
      }
    });
    return unsubscribe;
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, { email: user.email, role: "user" });
      }

      const idToken = await user.getIdToken(true);
      const res = await axios.post("http://localhost:5001/verify_token", { idToken });
      setRole(res.data.role);

      Alert.alert("Login Success", `Welcome ${user.displayName} (${res.data.role})`);
    } catch (error) {
      console.error("Firebase / Backend error:", error);
      Alert.alert("Login Failed", error.message || "Unknown error");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setRole(null);
      Alert.alert("Logged out", "You are now logged out");
    } catch (error) {
      Alert.alert("Logout Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Auth Demo</Text>

      {currentUser ? (
        <>
          <Text style={styles.userText}>
            Logged in as:{" "}
            <Text style={{ fontWeight: "700" }}>
              {currentUser.displayName} {role ? `(${role})` : ""}
            </Text>
          </Text>
          {role === "admin" && <Text style={styles.adminText}>You have admin access!</Text>}
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.userText}>Not logged in</Text>
          <Pressable style={styles.button} onPress={handleGoogleSignIn}>
            <Text style={styles.buttonText}>Login with Google</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 24 },
  userText: { fontSize: 18, marginBottom: 16 },
  adminText: { fontSize: 16, fontWeight: "700", color: "#d35400", marginBottom: 10 },
  button: { backgroundColor: "#2b7a4b", padding: 16, borderRadius: 12, marginTop: 10 },
  logoutButton: { backgroundColor: "#c0392b", padding: 16, borderRadius: 12, marginTop: 10 },
  buttonText: { color: "white", fontWeight: "700" },
});

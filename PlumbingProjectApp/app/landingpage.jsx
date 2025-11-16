import { Link } from "expo-router";
import { View, Text, Pressable, Image, ScrollView } from "react-native";

export default function LandingPage() {
  return (
    <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
      <View className="container">
        <Text className="title">Welcome to Bibliomaniacs</Text>
        <Text className="subtitle">
          Track what you read, discover new favorites, and see what our community loves.
        </Text>

        <Image
          source={{ uri: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600" }}
          className="hero"
        />

        <View className="ctaRow">
          <Link href="/explorer" asChild>
            <Pressable className="primaryBtn">
              <Text className="primaryText">Read Our Reviews</Text>
            </Pressable>
          </Link>
          <Pressable className="secondaryBtn" onPress={() => alert("Logging coming soon!")}>
            <Text className="secondaryText">Start Logging</Text>
          </Pressable>
        </View>

        <View className="features">
          {["Web-first", "Mobile ready", "JSX only"].map((f, i) => (
            <View key={i} className="featureCard">
              <Text className="featureText">{f}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// const styles = StyleSheet.create({
//   container: { padding: 24, gap: 16, alignItems: "center" },
//   title: { fontSize: 34, fontWeight: "800", textAlign: "center" },
//   subtitle: { fontSize: 16, color: "#3b3b3b", textAlign: "center", maxWidth: 720 },
//   hero: { width: "100%", maxWidth: 960, height: 320, borderRadius: 20, backgroundColor: "#ddd" },
//   ctaRow: { flexDirection: "row", gap: 12, marginTop: 10, flexWrap: "wrap" },
//   primaryBtn: { backgroundColor: "#2b7a4b", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
//   primaryText: { color: "white", fontWeight: "700" },
//   secondaryBtn: { backgroundColor: "white", borderWidth: 2, borderColor: "#2b7a4b", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
//   secondaryText: { color: "#2b7a4b", fontWeight: "700" },
//   features: { flexDirection: "row", gap: 12, flexWrap: "wrap", justifyContent: "center" },
//   featureCard: { backgroundColor: "#eaf6ea", borderWidth: 1, borderColor: "#cfe8cf", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
//   featureText: { color: "#224c2f", fontWeight: "700" },
// });

import { View, Text, ScrollView, Image } from "react-native";

const img = "https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea?w=600&q=80";

function ReviewCard() {
  return (
    <View className="reviewCard">
      <Image source={{ uri: img }} className="reviewThumb" />
      <View className="flex-1 gap-2">
        <View className="reviewLine w-[65%]" />
        <View className="reviewLine w-[80%]" />
        <View className="reviewLine w-[50%]" />
      </View>
    </View>
  );
}

export default function Explorer() {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="explorerContainer">
        <Text className="explorerH1">Read Our Reviews</Text>

        <View className="explorerGrid">
          {/* Left column */}
          <View className="explorerCol">
            <Text className="explorerSection">Book of the Week</Text>
            <ReviewCard />

            <Text className="explorerSection">Top Rated</Text>
            <ReviewCard />
            <ReviewCard />
          </View>

          {/* Right column */}
          <View className="explorerCol">
            <Text className="explorerSection">Recommendations</Text>
            <ReviewCard />
            <ReviewCard />
            <ReviewCard />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// const styles = StyleSheet.create({
//   container: { padding: 20, gap: 14 },
//   h1: { fontSize: 28, fontWeight: "800", textAlign: "center", marginVertical: 8 },
//   grid: {
//     flexDirection: "row",
//     gap: 24,
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },
//   col: { flexBasis: 360, flexGrow: 1, gap: 10 },
//   section: { fontSize: 18, fontWeight: "700", color: "#6b7c6b", marginTop: 6 },

//   card: {
//     flexDirection: "row",
//     gap: 12,
//     padding: 12,
//     borderRadius: 12,
//     backgroundColor: "white",
//     borderWidth: 1,
//     borderColor: "#e7eee7",
//   },
//   thumb: { width: 120, height: 80, borderRadius: 10, backgroundColor: "#ddd" },
//   line: { height: 12, borderRadius: 6, backgroundColor: "#cfe8cf" },
// });

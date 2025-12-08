import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";

export default function MyReviews() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const reviews = [
    {
      bookTitle: "The Great Gatsby",
      review: "A beautifully tragic novel.",
      rating: 5,
      status: "Approved",
      createdAt: "2024-11-02",
    },
    {
      bookTitle: "1984",
      review: "Haunting and thought-provoking.",
      rating: 4,
      status: "Pending",
      createdAt: "2024-10-12",
    },
    {
      bookTitle: "Sapiens",
      review: "Insightful and deep!",
      rating: 5,
      status: "Rejected",
      createdAt: "2024-08-21",
    },
  ];

  const filtered = reviews.filter((r) => {
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    const matchSearch = r.bookTitle.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusColor = {
    Approved: "#2b7a4b",
    Pending: "#cc9a06",
    Rejected: "#c0392b",
  };

  return (
    <ScrollView contentContainerStyle={{ alignItems: "center" }}>
      <View style={{ padding: 24, width: "100%", maxWidth: 1100 }}>
        
        {/* Header */}
        <Text style={{
          fontSize: 34,
          fontWeight: "800",
          textAlign: "center",
          marginBottom: 15,
        }}>
          My Submitted Reviews
        </Text>

        <Text style={{
          fontSize: 16,
          textAlign: "center",
          marginBottom: 25,
          color: "#444",
        }}>
          View the status of your submitted reviews.
        </Text>

        {/* Filters */}
        <View style={{
          flexDirection: "row",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          
          {/* Search */}
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by book title..."
            style={{
              borderWidth: 1,
              borderColor: "#cfe8cf",
              backgroundColor: "white",
              width: 260,
              padding: 10,
              borderRadius: 10,
              fontSize: 16,
            }}
          />

          {/* Status Filters */}
          {["All", "Approved", "Pending", "Rejected"].map((s) => (
            <Pressable
              key={s}
              onPress={() => setStatusFilter(s)}
              style={{
                backgroundColor: statusFilter === s ? "#2b7a4b" : "white",
                paddingVertical: 10,
                paddingHorizontal: 18,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: "#2b7a4b",
              }}
            >
              <Text style={{
                color: statusFilter === s ? "white" : "#2b7a4b",
                fontWeight: "700",
                fontSize: 15,
              }}>
                {s}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Table Header */}
        <View style={{
          flexDirection: "row",
          backgroundColor: "#eaf6ea",
          padding: 14,
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
          borderWidth: 1,
          borderBottomWidth: 0,
          borderColor: "#cfe8cf",
        }}>
          <Text style={{ flex: 2, fontWeight: "700", fontSize: 16 }}>Book</Text>
          <Text style={{ flex: 3, fontWeight: "700", fontSize: 16 }}>Review</Text>
          <Text style={{ flex: 1, fontWeight: "700", fontSize: 16 }}>Rating</Text>
          <Text style={{ flex: 1.3, fontWeight: "700", fontSize: 16 }}>Status</Text>
          <Text style={{ flex: 1.3, fontWeight: "700", fontSize: 16 }}>Date</Text>
        </View>

        {/* Table Rows */}
        {filtered.map((r, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              padding: 14,
              borderWidth: 1,
              borderTopWidth: 0,
              borderColor: "#cfe8cf",
              backgroundColor: "white",
            }}
          >
            <Text style={{ flex: 2, fontSize: 15 }}>{r.bookTitle}</Text>
            <Text style={{ flex: 3, fontSize: 15 }}>{r.review}</Text>
            <Text style={{ flex: 1, fontSize: 15 }}>⭐ {r.rating}</Text>
            <Text
              style={{
                flex: 1.3,
                fontSize: 15,
                fontWeight: "700",
                color: statusColor[r.status],
              }}
            >
              {r.status}
            </Text>
            <Text style={{ flex: 1.3, fontSize: 15 }}>
              {new Date(r.createdAt).toLocaleDateString()}
            </Text>
          </View>
        ))}

        {/* Empty State */}
        {filtered.length === 0 && (
          <View style={{
            padding: 30,
            borderWidth: 1,
            borderColor: "#cfe8cf",
            borderRadius: 14,
            marginTop: 10,
            backgroundColor: "white",
            alignItems: "center",
          }}>
            <Text style={{ fontSize: 16, color: "#444" }}>
              No reviews match your filters.
            </Text>
          </View>
        )}

        {/* Bottom Buttons */}
        <View
          style={{
            marginTop: 30,
            flexDirection: "row",
            justifyContent: "center",
            gap: 20,
          }}
        >
          {/* Export */}
          <Pressable
            onPress={() => console.log("Export pressed")}
            style={{
              backgroundColor: "#2b7a4b",
              paddingVertical: 14,
              paddingHorizontal: 28,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              Export Reviews
            </Text>
          </Pressable>

          <Pressable
            onPress={() => console.log("Add Review pressed")}
            style={{
              backgroundColor: "#2b7a4b",
              paddingVertical: 14,
              paddingHorizontal: 28,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              + Add New Review
            </Text>
          </Pressable>

        </View>
      </View>
    </ScrollView>
  );
}

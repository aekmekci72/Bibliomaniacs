import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, ScrollView } from "react-native";
import axios from "axios";
import { getAuth } from "firebase/auth";

export default function App() {
  const [title, setTitle] = useState("");
  const [books, setBooks] = useState([]);

  const addBook = async () => {
    if (!title) {
      alert("Please enter title");
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");

      const idToken = await user.getIdToken(true);

      const res = await axios.post("http://127.0.0.1:5000/add_book", {
        idToken,
        title,
      });

      console.log("Added book:", res.data);
      setTitle("");
      fetchBooks();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        alert("Permission denied: You are not an admin");
      } else if (err.response?.status === 401) {
        alert("Unauthorized: Please log in again");
      } else {
        alert("Failed to add book: " + err.message);
      }
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/get_books");
      setBooks(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch books");
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
      <Text className="title">DB Test</Text>
      <Text className="subtitle">Add books and fetch below.</Text>

        <View className="inputCard">
          <TextInput
            className="input"
            placeholder="Enter book title"
            value={title}
            onChangeText={setTitle}
          />

          <View className="buttonRow">
            <Pressable className="primaryBtn" onPress={addBook}>
              <Text className="primaryText">Add Book</Text>
            </Pressable>
            <Pressable className="secondaryBtn" onPress={fetchBooks}>
              <Text className="secondaryText">Get Books</Text>
            </Pressable>
          </View>
        </View>

      <View className="listContainer">
        <Text className="sectionTitle">Books in Database</Text>
        <FlatList
          data={books}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={({ item }) => (
            <View className="bookCard">
              <Text className="bookTitle">{item.title}</Text>
            </View>
          )}
          ListEmptyComponent={<Text className="emptyText">No books yet.</Text>}
        />
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

import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { RequireAccess } from "../components/requireaccess";
import { useState, useEffect } from "react";
import { auth, app } from "../backend/firebaseConfig";
import { getAuth } from "firebase/auth";

export default function AdminHomePage() {
  const router = useRouter();

  const [authReady, setAuthReady] = useState(false);
  const [loadingBook, setLoadingBook] = useState(true);
  const API_BASE_URL = "https://bibliomaniacs.onrender.com";

  const bookOfTheWeek = {
    title: "To Kill a Mockingbird",
    genre: "Bildungsroman",
    stars: "4.3",
    pages: "285",
    descr: "Quick Read",
    blurb:
      "The conscience of a town steeped in prejudice, violence and hypocrisy is pricked by the stamina of one man's struggle for justice. But the weight of history will only tolerate so much.",
  };

  const [bookOfWeek, setBookOfWeek] = useState({
    title: "",
    author: "",
    lastUpdated: "",
  });

  useEffect(() => {
    const auth = getAuth();
    auth.currentUser;
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthReady(true);
      } else {
        setAuthReady(false);
        console.error("User not authenticated");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const auth = getAuth();

    if (authReady) {
      fetchBookOfWeek();
    }
  }, [authReady]);

  const fetchBookOfWeek = async () => {
    try {
      setLoadingBook(true);
      const response = await fetch(`${API_BASE_URL}/get_book_of_week`);

      if (response.ok) {
        const data = await response.json();
        setBookOfWeek(data);
        console.log(bookOFWeek);
      } else {
        console.error("Failed to fetch book of the week");
      }
    } catch (error) {
      console.error("Error fetching book of the week:", error);
    } finally {
      setLoadingBook(false);
    }
  };

  return (
    <RequireAccess
      allowRoles={["admin"]}
      redirectTo="/notfound"
    >
    <View className="adminHomeRoot pt-16">
      <View className="adminHomeHeroSection">
        <View className="adminHomeHeroInner">

          {/* LEFT COLUMN */}
          <View className="adminHomeLeft">
            <Text className="adminHomeTitle">Welcome, Admin!</Text>

            <Text className="adminHomeTagline">
              As a Bibliomaniacs admin, you are granted full access to the admin pages, including the homepage, dashboard, and collection of all reviews. You may also explore the reviews from the user perspective.
            </Text>

            <View className="adminHomeBullets">
              <Text className="adminHomeBullet">• Approve or reject book reviews</Text>
              <Text className="adminHomeBullet">• Notify volunteers of their review status</Text>
              <Text className="adminHomeBullet">• Update the book of the week</Text>
            </View>

            <View className="adminHomeCtas">
              <Pressable
                className="landingPrimaryBtn"
                onPress={() => router.push("/admindashboard")}
              >
                <Text className="adminHomePrimaryText">Dashboard</Text>
              </Pressable>

            </View>
          </View>

          {/* RIGHT COLUMN – Book of the Week */}
          <View className="adminHomeRight">
            <View className="adminHomeBookCard">
              <Text className="adminHomeBookLabel">Book of the Week</Text>
              <Text className="adminHomeBookTitle">{bookOfWeek.title}</Text>

              <View className="adminHomeBookCover" />

              <View className="adminHomeBookMetaRow">
                <View className="adminHomeBookTag">
                  <Text className="adminHomeBookTagText">
                    {bookOfTheWeek.genre} · {bookOfTheWeek.stars} ★
                  </Text>
                </View>
                <Text className="adminHomeBookPages">
                  {bookOfTheWeek.pages} · {bookOfTheWeek.descr}
                </Text>
              </View>

              <Text className="adminHomeBookBlurb">{bookOfTheWeek.blurb}</Text>
            </View>
          </View>

        </View>
      </View>
    </View>
    </RequireAccess>
  );
}

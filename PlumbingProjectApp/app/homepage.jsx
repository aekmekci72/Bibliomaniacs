import React, { useState, useEffect } from "react";
import { RequireAccess } from "../components/requireaccess";
import { Link } from "expo-router";
import { View, Text, Pressable, ScrollView } from "react-native";
import { interpolate, interpolateColor } from 'react-native-reanimated';
import Carousel from "react-native-reanimated-carousel";
import { Dimensions } from "react-native";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, app } from "../firebaseConfig";

const { width } = Dimensions.get("window");
const CARD_WIDTH = Math.min(width * 0.7, 340);

export default function LandingPage() {

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      try {
        const db = getFirestore(app);
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) return;

        const data = snap.data() || {};
        const current = Array.isArray(data.notifications) ? data.notifications : [];

        const filtered = current.filter((n) => n?.type !== "book_of_the_week");

        if (filtered.length !== current.length) {
          await updateDoc(userRef, { notifications: filtered });
        }
      } catch (err) {
        console.error("Failed clearing review_status notifications:", err);
      }
    });

    return unsubscribe;
  }, []);

  const bookOfTheWeek = {
    title: "To Kill a Mockingbird",
    genre: "Bildungsroman",
    stars: "4.3",
    pages: "285",
    descr: "Quick Read",
    blurb:
      "The conscience of a town steeped in prejudice, violence and hypocrisy is pricked by the stamina of one man's struggle for justice. But the weight of history will only tolerate so much.",
  };

  const topRecs = [
    {
      title: "T'es stupide",
      meta: "Fantasy · 4.7 ★",
    },
    {
      title: "Hon Hon Hon",
      meta: "Non-fiction · 4.6 ★",
    },
    {
      title: "Feed Me Baguette",
      meta: "Sci-fi · 4.9 ★",
    },
  ];

  const [index, setIndex] = useState(0);

  const next = () => {
    setIndex((prev) => (prev + 1) % topRecs.length);
  };

  const prev = () => {
    setIndex((prev) => (prev - 1 + topRecs.length) % topRecs.length);
  };

  return (
    <RequireAccess
      allowRoles={["user", "admin"]}
      redirectTo="/notfound"
    >
    <ScrollView className="landingPageRoot landingScroll">
      {/* === TOP BAND === */}
      <View className="landingTopSection">
        <View className="landingTopInner">
          <View className="homeTopLeft">
            <Text className="landingTitle">Welcome Back!</Text>

            <Text className="landingTagline pt-2 pb-8">
              Book review website that enhances Ridgewood Public Library’s
              volunteer review service by streamlining personal information
              entry, organizing hours, and providing recommendations.
            </Text>

            <Pressable
              className="landingPrimaryBtn self-start"
              onPress={() => navigation?.navigate?.("explorer")}
            >
              <Text className="landingPrimaryText">Start Logging</Text>
            </Pressable>
          </View>

          {/* RIGHT COLUMN – Book of the Week */}
          <View className="bookWeekCard">
            <Text className="bookWeekLabel">Book of the Week</Text>
            <Text className="bookWeekTitle">{bookOfTheWeek.title}</Text>

            <View className="bookWeekCover" />

            <View className="bookWeekMetaRow">
              <View className="bookWeekTag">
                <Text className="bookWeekTagText">
                  {bookOfTheWeek.genre} · {bookOfTheWeek.stars} ★
                </Text>
              </View>
              <Text className="bookWeekPages">
                {bookOfTheWeek.pages} · {bookOfTheWeek.descr}
              </Text>
            </View>

            <Text className="bookWeekBlurb">{bookOfTheWeek.blurb}</Text>
          </View>
        </View>
      </View>

      {/* === BOTTOM BAND === */}
      <View className="landingBottomSection">
        <View className="recsHeaderRow">
          <Text className="recsTitle">Top Recommendations</Text>
          <Pressable>
            <Link href="explorer" className="recsShowMore">Show more</Link>
          </Pressable>
        </View>
        <View style>
          <Carousel
            width={width}
            height={300}
            data={topRecs}
            loop
            autoPlay
            autoPlayInterval={3000}
            scrollAnimationDuration={800}
            mode="custom"
            customAnimation={(value) => {
              'worklet';
              const zIndex = interpolate(
                value,
                [-1, -0.5, 0, 0.5, 1],
                [1, 5, 20, 5, 1]
              );

              const scale = interpolate(
                value,
                [-1, 0, 1],
                [0.8, 1, 0.8]
              );

              const opacity = interpolate(
                value,
                [-1, -0.5, 0, 0.5, 1],
                [0.4, 0.8, 1, 0.8, 0.4]
              );

              const translateX = interpolate(
                value,
                [-1, 0, 1],
                [-width * 0.25, 0, width * 0.25]
              );

              return {
                transform: [
                  { scale },
                  { translateX }
                ],
                zIndex,
                opacity,
              };
            }}
            windowSize={3}
            renderItem={({ item }) => (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <View
                  style={{
                    width: CARD_WIDTH,
                    backgroundColor: '#f6faf6',
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                  className="carouselCard"
                >
                  <View className="carouselThumb" />
                  <Text className="carouselTitle">{item.title}</Text>
                  <Text className="carouselMeta">{item.meta}</Text>
                </View>
              </View>
            )}
          />
        </View>
      </View>



      {/* FOOTER */}
      < View className="footer" >
        <View className="footerInner">
          <View className="flex flex-row flex-wrap justify-between gap-10">
            <View className="w-40">
              <Text className="footerBrand">Bibliomaniacs</Text>
              <Text className="footerText">
                Building better reading habits for the Ridgewood community.
              </Text>
            </View>

            <View className="w-40">
              <Text className="footerTitle">Contact Us</Text>
              <Text className="footerText">Email: support@bibliomaniacs.fake</Text>
              <Text className="footerText">Phone: (555) 123-4567</Text>
              <Text className="footerText">123 Library Lane, Ridgewood, NJ</Text>
            </View>

            <View className="w-40">
              <Text className="footerTitle">Quick Links</Text>
              <Text className="footerText">About Us</Text>
              <Text className="footerText">FAQ</Text>
              <Text className="footerText">Privacy Policy</Text>
            </View>

            <View className="w-40">
              <Text className="footerTitle">Follow Us</Text>
              <Text className="footerText">Instagram</Text>
              <Text className="footerText">Twitter</Text>
              <Text className="footerText">Facebook</Text>
            </View>
          </View>

          <View className="footerDivider" />

          <Text className="footerCopyright">
            © {new Date().getFullYear()} Bibliomaniacs. All rights reserved.
          </Text>
        </View>
      </View >
    </ScrollView >
    </RequireAccess>
  );
}

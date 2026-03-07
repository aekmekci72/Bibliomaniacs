import React, { useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, ScrollView, Alert } from "react-native";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
import { auth, app } from "../firebaseConfig";
import { RequireAccess } from "../components/requireaccess";

export default function LandingPage() {
  const router = useRouter();
  const db = getFirestore(app);

  const getUserRole = async (user) => {
    const idToken = await user.getIdToken(true);
  
    const res = await axios.post("https://bibliomaniacs.onrender.com/get_user_role", {
      idToken,
    });
  
    return typeof res.data === "string" ? res.data : res.data.role;
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      let isNewUser = false;
      if (!userSnap.exists()) {
        isNewUser = true;
        await setDoc(userRef, { email: user.email, role: "user" });
      }

      const role = await getUserRole(user);  

      Alert.alert("Login Success", `Welcome ${user.displayName}!`);

      if (isNewUser) {
        router.replace("/profilesetup");
      } else if (role == "admin") {
        router.replace("/adminhomepage");
      } else {
        router.replace("/homepage");
        console.log(user.role);
      }

    } catch (error) {
      console.error("LandingPage Google Login Error:", error);
      Alert.alert("Login Failed", error.message || "Unknown error");
    }
  };
  const bookOfTheWeek = {
    "title": "To Kill a Mockingbird",
    "genre": "Bildungsroman",
    "stars": "4.3",
    "pages": "285",
    "descr": "Quick Read", 
    "blurb": "The conscience of a town steeped in prejudice, violence and hypocrisy is pricked by the stamina of one man's struggle for justice. But the weight of history will only tolerate so much."
  }
  return (
    <RequireAccess
      allowRoles={["no account", null]}
      redirectTo="/notfound"
    >
    <ScrollView className="landingPageRoot landingScroll">
      {/* === TOP BAND === */}
      <View className="landingTopSection">
        <View className="landingTopInner">
          {/* LEFT COLUMN */}
          <View className="landingTopLeft">
            {/* Copy block */}
            <View className="landingTopCopy">
              <Text className="landingTitle">Bibliomaniacs</Text>

              <Text className="landingTagline">
                Book review website that enhances Ridgewood Public Library’s volunteer review
                service by streamlining personal information entry, organizing hours, and
                providing recommendations.
              </Text>

              <View className="landingBullets">
                <Text className="landingBullet">• Share your opinions on your favorite books</Text>
                <Text className="landingBullet">• Explore new works approved by fellow teens</Text>
                <Text className="landingBullet">• Earn community service hours</Text>
              </View>
            </View>

            {/* CTAs pinned towards bottom of the column */}
            <View className="landingCtaRowBottom">
              <Pressable
                className="landingPrimaryBtn"
                onPress={handleGoogleSignIn}
              >
                <Text className="landingPrimaryText">Sign Up</Text>
              </Pressable>

              <Pressable
                className="landingSecondaryBtn"
                onPress={handleGoogleSignIn}
              >
                <Text className="landingSecondaryText">Log In</Text>
              </Pressable>
            </View>
          </View>


          {/* RIGHT COLUMN – Book of the Week */}
          <View className="bookWeekCard">
            <Text className="bookWeekLabel">Book of the Week</Text>
            <Text className="bookWeekTitle">{bookOfTheWeek["title"]}</Text>

            <View className="bookWeekCover" />

            <View className="bookWeekMetaRow">
              <View className="bookWeekTag">
                <Text className="bookWeekTagText">{bookOfTheWeek["genre"]} · {bookOfTheWeek["stars"]} ★</Text>
              </View>
              <Text className="bookWeekPages">{bookOfTheWeek["pages"]} · {bookOfTheWeek["descr"]}</Text>
            </View>

            <Text className="bookWeekBlurb">{bookOfTheWeek["blurb"]}</Text>
          </View>
        </View>
      </View>

      {/* === BOTTOM BAND === */}
      <View className="landingBottomSection">
        <View className="landingBottomInner">
          <View className="recsHeaderRow">
            <Text className="recsTitle">Top Books</Text>
            <Pressable>
              <Link href="explorer" className="recsShowMore">Show more</Link>
            </Pressable>
          </View>

          {/* Three large cards that fill the entire width */}
          <View className="recsRowLarge">
            {/* Card 1 */}
            <View className="recCardLarge">
              <View className="recThumbLarge" />
              <Text className="recTitleLarge">Wings of Fire</Text>
              <Text className="recMetaLarge">Fantasy · 4.7 ★</Text>
            </View>

            {/* Card 2 */}
            <View className="recCardLarge">
              <View className="recThumbLarge" />
              <Text className="recTitleLarge">The Boy in the Striped Pajamas</Text>
              <Text className="recMetaLarge">Historical Fiction · 4.6 ★</Text>
            </View>

            {/* Card 3 */}
            <View className="recCardLarge">
              <View className="recThumbLarge" />
              <Text className="recTitleLarge">Dark Matter</Text>
              <Text className="recMetaLarge">Sci-fi · 4.9 ★</Text>
            </View>
          </View>
        </View>
      </View>


<View className="footer">
        <View className="footerInner">

          <View className="flex flex-row flex-wrap justify-between gap-10">

            {/* Brand */}
            <View className="w-40">
              <Text className="footerBrand">Bibliomaniacs</Text>
              <Text className="footerText">
                Building better reading habits for the Ridgewood community.
              </Text>
            </View>

            {/* Contact */}
            <View className="w-40">
              <Text className="footerTitle">Contact Us</Text>
              <Text className="footerText">Email: support@bibliomaniacs.fake</Text>
              <Text className="footerText">Phone: (555) 123-4567</Text>
              <Text className="footerText">123 Library Lane, Ridgewood, NJ</Text>
            </View>

            {/* Links */}
            <View className="w-40">
              <Text className="footerTitle">Quick Links</Text>
              <Text className="footerText">About Us</Text>
              <Text className="footerText">FAQ</Text>
              <Text className="footerText">Privacy Policy</Text>
            </View>

            {/* Socials */}
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
      </View>
    </ScrollView>
    </RequireAccess>
  );
}

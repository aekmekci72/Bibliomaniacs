import React, { useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, ScrollView, Alert } from "react-native";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
import { auth, app } from "../firebaseConfig";

export default function LandingPage() {
  const router = useRouter();
  const db = getFirestore(app);

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

      Alert.alert("Login Success", `Welcome ${user.displayName}!`);

      if (isNewUser) {
        router.replace("/profilesetup");
      } else {
        router.replace("/homepage");
      }

    } catch (error) {
      console.error("LandingPage Google Login Error:", error);
      Alert.alert("Login Failed", error.message || "Unknown error");
    }
  };
  const bookOfTheWeek = {
    "title": "An Emo and a Quant",
    "genre": "Non-Fiction",
    "stars": "4.8",
    "pages": "320",
    "descr": "Quick Read",
    "blurb": "Follow two comp sci kids on their journey towards redemption. After deleting a precious Canva textbox, these nerds face the wrath of a very awesome god."
  }
  return (
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
                <Text className="landingBullet">• This is a website</Text>
                <Text className="landingBullet">• We have cool features and stuff</Text>
                <Text className="landingBullet">• Another feature because it would look uglier with less text</Text>
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
              <Text className="recTitleLarge">T'es stupide</Text>
              <Text className="recMetaLarge">Fantasy · 4.7 ★</Text>
            </View>

            {/* Card 2 */}
            <View className="recCardLarge">
              <View className="recThumbLarge" />
              <Text className="recTitleLarge">Hon Hon Hon</Text>
              <Text className="recMetaLarge">Non-fiction · 4.6 ★</Text>
            </View>

            {/* Card 3 */}
            <View className="recCardLarge">
              <View className="recThumbLarge" />
              <Text className="recTitleLarge">Feed Me Baguette</Text>
              <Text className="recMetaLarge">Sci-fi · 4.9 ★</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// import { Link } from "expo-router";
// import { View, Text, Pressable, StyleSheet, Image, ScrollView, Platform } from "react-native";
// import jsPDF from "jspdf";

// export default function LandingPage() {

//   const generateCertificate = () => {
//     const doc = new jsPDF({
//       orientation: "portrait",
//       unit: "pt",
//       format: "a4",
//     });

//     doc.setFontSize(28);
//     doc.text("Certificate of Volunteer Hours", 50, 100);

//     doc.setFontSize(20);
//     doc.text("This certifies that NAME", 50, 150);
//     doc.text("has completed 15 volunteer hours", 50, 180);

//     doc.setFontSize(18);
//     doc.text("Ridgewood Public Library", 50, 210);

//     if (Platform.OS === "web") {
//       doc.save("certificate.pdf");
//     } else {
//       doc.output("dataurlstring").then((pdfDataUri) => {
//         const base64 = pdfDataUri.split(",")[1];

//         import("expo-file-system").then(FileSystem => {
//           import("expo-sharing").then(Sharing => {
//             const fileUri = FileSystem.cacheDirectory + "certificate.pdf";
//             FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 })
//               .then(() => Sharing.shareAsync(fileUri));
//           });
//         });
//       });
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
//       <View className="container">
//         <Text className="title">Welcome to Bibliomaniacs</Text>
//         <Text className="subtitle">
//           Track what you read, discover new favorites, and see what our community loves.
//         </Text>

//         <Image
//           source={{ uri: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600" }}
//           className="hero"
//         />

//       <View className="ctaRow">
//         <Link href="/explorer" asChild>
//           <Pressable className="primaryBtn">
//             <Text className="primaryText">Read Our Reviews</Text>
//           </Pressable>
//         </Link>
//         <Pressable className="secondaryBtn" onPress={() => alert("Logging coming soon!")}>
//           <Text className="secondaryText">Start Logging</Text>
//         </Pressable>
//         <Pressable
//           className="primaryBtn"
//           onPress={generateCertificate}
//         >
//           <Text className="primaryText">Generate Certificate</Text>
//         </Pressable>
//       </View>

//         <View className="features">
//           {["Web-first", "Mobile ready", "JSX only"].map((f, i) => (
//             <View key={i} className="featureCard">
//               <Text className="featureText">{f}</Text>
//             </View>
//           ))}
//         </View>
//       </View>
//     </ScrollView>
//   );
// }

// // const styles = StyleSheet.create({
// //   container: { padding: 24, gap: 16, alignItems: "center" },
// //   title: { fontSize: 34, fontWeight: "800", textAlign: "center" },
// //   subtitle: { fontSize: 16, color: "#3b3b3b", textAlign: "center", maxWidth: 720 },
// //   hero: { width: "100%", maxWidth: 960, height: 320, borderRadius: 20, backgroundColor: "#ddd" },
// //   ctaRow: { flexDirection: "row", gap: 12, marginTop: 10, flexWrap: "wrap" },
// //   primaryBtn: { backgroundColor: "#2b7a4b", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
// //   primaryText: { color: "white", fontWeight: "700" },
// //   secondaryBtn: { backgroundColor: "white", borderWidth: 2, borderColor: "#2b7a4b", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
// //   secondaryText: { color: "#2b7a4b", fontWeight: "700" },
// //   features: { flexDirection: "row", gap: 12, flexWrap: "wrap", justifyContent: "center" },
// //   featureCard: { backgroundColor: "#eaf6ea", borderWidth: 1, borderColor: "#cfe8cf", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
// //   featureText: { color: "#224c2f", fontWeight: "700" },
// // });

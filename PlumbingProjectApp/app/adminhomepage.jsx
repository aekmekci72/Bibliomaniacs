import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { RequireAccess } from "../components/requireaccess";

export default function AdminHomePage() {
  const router = useRouter();

  const bookOfTheWeek = {
    title: "To Kill a Mockingbird",
    genre: "Bildungsroman",
    stars: "4.3",
    pages: "285",
    descr: "Quick Read",
    blurb:
      "The conscience of a town steeped in prejudice, violence and hypocrisy is pricked by the stamina of one man's struggle for justice. But the weight of history will only tolerate so much.",
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
              Description about admin abilities/responsibilities
            </Text>

            <View className="adminHomeBullets">
              <Text className="adminHomeBullet">• This is a website</Text>
              <Text className="adminHomeBullet">• We have cool features and stuff</Text>
              <Text className="adminHomeBullet">
                • Another feature because it would look uglier with less text
              </Text>
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
              <Text className="adminHomeBookTitle">{bookOfTheWeek.title}</Text>

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

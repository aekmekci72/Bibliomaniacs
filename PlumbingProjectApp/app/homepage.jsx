import React from "react";
import { Link } from "expo-router";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, ScrollView } from "react-native";


export default function LandingPage() {
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
          <View className="homeTopLeft">
            {/* Copy block */}
              <Text className="landingTitle">Welcome Back!</Text>

              <Text className="landingTagline pt-2 pb-8">
                Book review website that enhances Ridgewood Public Library’s volunteer review 
                service by streamlining personal information entry, organizing hours, and 
                providing recommendations.
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
      <Text className="recsTitle">Top Recommendations</Text>
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
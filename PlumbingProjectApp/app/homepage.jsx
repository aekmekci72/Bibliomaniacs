import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, ScrollView } from "react-native";

export default function HomePage() {
  return (
    <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
      <Text className="title">Homepage</Text>
    </ScrollView>
  );
}

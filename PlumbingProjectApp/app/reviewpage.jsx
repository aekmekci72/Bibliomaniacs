import React, { useState } from "react";
import { View, Text, Pressable, TextInput, Modal } from "react-native";
import { Star } from "lucide-react-native";

export default function SubmitReviewPage() {
    const [modalVisible, setModalVisible] = useState(false);
    const [rating, setRating] = useState(0);

    return (
        <View className="flex-1 bg-[#f5fdf5] px-5 py-6">
            <Text className="text-2xl font-extrabold text-center mb-4">
                Submit Book Review
            </Text>

            <Pressable
                className="primaryBtn self-center"
                onPress={() => setModalVisible(true)}
            >
                <Text className="primaryText">New Review</Text>
            </Pressable>

            <Modal
                transparent
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="modalBackdrop">
                    <View className="modalCard">

                        <Text className="modalTitle">New Book Review</Text>

                        <Text className="inputLabel">Book Title</Text>
                        <TextInput
                            className="modalInput"
                            placeholder="Book title"
                        />

                        <Text className="inputLabel">Reviewer Name</Text>
                        <TextInput
                            className="modalInput"
                            placeholder="Name"
                        />

                        <Text className="inputLabel">Review</Text>
                        <TextInput
                            className="modalTextarea"
                            placeholder="Write your review..."
                            multiline
                        />

                        <Text className="inputLabel">Rating</Text>
                        <View className="flex-row mb-3">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <Pressable key={num} onPress={() => setRating(num)}>
                                    <Star
                                        size={28}
                                        color={num <= rating ? "#2b7a4b" : "#b6d5b6"}
                                        fill={num <= rating ? "#2b7a4b" : "none"}
                                        style={{ marginRight: 6 }}
                                    />
                                </Pressable>
                            ))}
                        </View>

                        <View className="buttonRow mt-1">
                            <Pressable
                                className="primaryBtn flex-1"
                                onPress={() => setModalVisible(false)}
                            >
                                <Text className="primaryText">Submit</Text>
                            </Pressable>

                            <Pressable
                                className="secondaryBtn flex-1"
                                onPress={() => setModalVisible(false)}
                            >
                                <Text className="secondaryText">Cancel</Text>
                            </Pressable>
                        </View>

                    </View>
                </View>
            </Modal>
        </View>
    );
}

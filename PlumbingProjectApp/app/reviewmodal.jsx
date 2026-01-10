import React from "react";
import {
    View,
    Text,
    Pressable,
    TextInput,
    Modal,
    ScrollView,
} from "react-native";
import { Star } from "lucide-react-native";

export default function ReviewModal({
    modalVisible,
    setModalVisible,
    bookTitle,
    handleTitleChange,
    authorName,
    setAuthorName,
    review,
    setReview,
    titleFlagged,
    gradeLevel,
    setGradeLevel,
    recommendedGrades,
    toggleRecommendedGrade,
    anonPref,
    setAnonPref,
    rating,
    setRating,
    gradeOptions,
    anonOptions,
    onSubmit,
}) {
    return (
        <Modal
            transparent
            animationType="slide"
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View className="modalBackdrop">
                <View className="modalCard">
                    <ScrollView
                        className="modalScroll"
                        contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
                    >
                        <Text className="modalTitle">New Book Review</Text>

                        <Text className="inputLabel">Book Title</Text>
                        <TextInput
                            className="modalInput"
                            placeholder="Book title"
                            value={bookTitle}
                            onChangeText={handleTitleChange}
                        />

                        {titleFlagged && (
                            <View className="warningBox">
                                <View className="flex-1">
                                    <Text className="warningTitle">Already popular title</Text>
                                    <Text className="warningText">
                                        This book has already been reviewed many times. Consider
                                        reviewing a different book.
                                    </Text>
                                </View>
                            </View>
                        )}

                        <Text className="inputLabel">Author Name</Text>
                        <TextInput
                            className="modalInput"
                            placeholder="Author name"
                            value={authorName}
                            onChangeText={setAuthorName}
                        />

                        <Text className="inputLabel">Reviewer Name</Text>
                        <TextInput className="modalInput" placeholder="Name" />

                        <Text className="inputLabel">Review</Text>
                        <TextInput
                            className="modalTextarea"
                            placeholder="Write your review..."
                            multiline
                            value={review}
                            onChangeText={setReview}
                        />

                        <Text className="inputLabel">Grade Level</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="gradeRow"
                        >
                            {gradeOptions.map((level) => (
                                <Pressable
                                    key={level}
                                    className={`gradeOption ${gradeLevel === level ? "gradeOptionActive" : ""
                                        }`}
                                    onPress={() => setGradeLevel(level)}
                                >
                                    <Text
                                        className={`gradeText ${gradeLevel === level ? "gradeTextActive" : ""
                                            }`}
                                    >
                                        {level}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>

                        <Text className="inputLabel">Recommended Grade Levels</Text>
                        <View className="flex-row flex-wrap mb-3">
                            {gradeOptions.map((level) => (
                                <Pressable
                                    key={level}
                                    className={`gradeOption ${recommendedGrades.includes(level) ? "gradeOptionActive" : ""
                                        }`}
                                    onPress={() => toggleRecommendedGrade(level)}
                                >
                                    <Text
                                        className={`gradeText ${recommendedGrades.includes(level) ? "gradeTextActive" : ""
                                            }`}
                                    >
                                        {level}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        <Text className="inputLabel">Anonymous Preference</Text>
                        <View className="radioRow">
                            {anonOptions.map((opt) => (
                                <Pressable
                                    key={opt}
                                    className={`radioOption ${anonPref === opt ? "radioOptionActive" : ""
                                        }`}
                                    onPress={() => setAnonPref(opt)}
                                >
                                    <View
                                        className={`radioCircle ${anonPref === opt ? "radioCircleActive" : ""
                                            }`}
                                    />
                                    <Text
                                        className={`radioText ${anonPref === opt ? "radioTextActive" : ""
                                            }`}
                                    >
                                        {opt}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

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
                                onPress={onSubmit}
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
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
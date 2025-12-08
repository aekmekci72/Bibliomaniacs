import React, { useState } from "react";
import {
    View,
    Text,
    Pressable,
    Image,
    TextInput,
    Modal,
    ScrollView,
} from "react-native";

export default function ProfilePage() {
    const [name, setName] = useState("John Doe");
    const [email] = useState("john.doe@example.com");
    const [phone, setPhone] = useState("(201) 123-4567");
    const [grade, setGrade] = useState("11");
    const [school, setSchool] = useState("Ridgewood High School");
    const [genres, setGenres] = useState(["Fantasy", "Sci-Fi"]);

    const GENRE_OPTIONS = [
        "Fantasy",
        "Sci-Fi",
        "Mystery",
        "Romance",
        "Thriller",
        "Non-fiction",
        "Biography",
        "Historical Fiction",
        "Horror",
        "Young Adult",
    ];

    const [modalVisible, setModalVisible] = useState(false);
    const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);

    const [editName, setEditName] = useState(name);
    const [editPhone, setEditPhone] = useState(phone);
    const [editGrade, setEditGrade] = useState(grade);
    const [editSchool, setEditSchool] = useState(school);
    const [editGenres, setEditGenres] = useState(genres);

    const openModal = () => {
        setEditName(name);
        setEditPhone(phone);
        setEditGrade(grade);
        setEditSchool(school);
        setEditGenres(genres);
        setModalVisible(true);
    };

    const toggleGenre = (genre) => {
        if (editGenres.includes(genre)) {
            setEditGenres(editGenres.filter((g) => g !== genre));
        } else {
            setEditGenres([...editGenres, genre]);
        }
    };

    const saveProfile = () => {
        setName(editName);
        setPhone(editPhone);
        setGrade(editGrade);
        setSchool(editSchool);
        setGenres(editGenres);
        setModalVisible(false);
    };

    return (
        <View className="flex-1 bg-[#f5fdf5] px-5 py-6">
            <Text className="profileH1">Profile</Text>

            <View className="profileCard">
                <View className="flex-1">
                    <Text className="profileName">{name || "Unnamed User"}</Text>
                    <Text className="profileEmail">{email}</Text>
                    <Text className="profileRole">Bibliomaniacs Reviewer</Text>
                </View>
            </View>

            <View className="profileInfoCard">
                <Text className="sectionTitle">Account Information</Text>

                <View className="infoRow">
                    <Text className="infoLabel">Phone Number</Text>
                    <Text className="infoValue">{phone}</Text>
                </View>

                <View className="infoRow">
                    <Text className="infoLabel">Grade</Text>
                    <Text className="infoValue">{grade}</Text>
                </View>

                <View className="infoRow">
                    <Text className="infoLabel">School</Text>
                    <Text className="infoValue">{school}</Text>
                </View>

                <View className="infoRow">
                    <Text className="infoLabel">Favorite Genres</Text>

                    {genres.length === 0 ? (
                        <Text className="infoValue text-neutral-500">None selected</Text>
                    ) : (
                        <View className="genresContainer">
                            {genres.map((g) => (
                                <View key={g} className="genreChip">
                                    <Text className="genreChipText">{g}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>

            <Pressable className="primaryBtn editBtn" onPress={openModal}>
                <Text className="primaryText text-center">Edit Profile</Text>
            </Pressable>

            <Modal
                transparent
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="modalBackdrop">

                    <ScrollView
                        className="modalScrollContainer"
                        contentContainerStyle={{ paddingVertical: 30 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="modalCard">
                            <Text className="modalTitle">Edit Profile</Text>

                            <Text className="inputLabel">Name</Text>
                            <TextInput
                                className="modalInput"
                                value={editName}
                                onChangeText={setEditName}
                            />

                            <Text className="inputLabel">Email</Text>
                            <View pointerEvents="none">
                                <TextInput
                                    className="modalInput modalInputDisabled"
                                    value={email}
                                    editable={false}
                                    focusable={false}
                                />
                            </View>

                            <Text className="inputLabel">Phone Number</Text>
                            <TextInput
                                className="modalInput"
                                value={editPhone}
                                keyboardType="phone-pad"
                                maxLength={14}
                                onChangeText={(text) => {
                                    const cleaned = text.replace(/\D/g, "");

                                    let formatted = cleaned;

                                    if (cleaned.length > 3 && cleaned.length <= 6) {
                                        formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
                                    } else if (cleaned.length > 6) {
                                        formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
                                    }

                                    setEditPhone(formatted);
                                }}
                            />


                            <Text className="inputLabel">Grade</Text>
                            <TextInput
                                className="modalInput"
                                value={editGrade}
                                keyboardType="numeric"
                                onChangeText={(text) => {
                                    const num = text.replace(/[^0-9]/g, "");

                                    if (num === "" || Number(num) <= 13) {
                                        setEditGrade(num);
                                    }
                                }}
                            />

                            <Text className="inputLabel">School</Text>
                            <TextInput
                                className="modalInput"
                                value={editSchool}
                                onChangeText={setEditSchool}
                            />

                            <Text className="inputLabel">Favorite Genres</Text>
                            <Pressable
                                className="dropdownBtn"
                                onPress={() => setGenreDropdownOpen(!genreDropdownOpen)}
                            >
                                <Text className="dropdownBtnText">
                                    {editGenres.length ? editGenres.join(", ") : "Select genres"}
                                </Text>
                            </Pressable>

                            {genreDropdownOpen && (
                                <View className="dropdownList">
                                    <ScrollView className="dropdownScroll">
                                        {GENRE_OPTIONS.map((genre) => (
                                            <Pressable
                                                key={genre}
                                                className="dropdownItem"
                                                onPress={() => toggleGenre(genre)}
                                            >
                                                <Text className="dropdownItemText">{genre}</Text>
                                                <View
                                                    className={`checkbox ${editGenres.includes(genre)
                                                        ? "checkboxChecked"
                                                        : "checkboxUnchecked"
                                                        }`}
                                                />
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            <View className="buttonRow mt-4">
                                <Pressable className="primaryBtn flex-1" onPress={saveProfile}>
                                    <Text className="primaryText text-center">Save</Text>
                                </Pressable>

                                <Pressable
                                    className="secondaryBtn flex-1"
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text className="secondaryText text-center">Cancel</Text>
                                </Pressable>
                            </View>

                        </View>
                    </ScrollView>
                </View>
            </Modal>

        </View>
    );
}

import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, Modal, ScrollView, ActivityIndicator } from "react-native";
import { auth, app } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc, deleteField } from "firebase/firestore";
  

export default function ProfilePage() {
    const router = useRouter();
    const db = getFirestore(app);

    const [loading, setLoading] = useState(true);
    const [userUid, setUserUid] = useState(null);

    const [role, setRole] = useState(null);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [grade, setGrade] = useState("");
    const [school, setSchool] = useState("");
    const [genres, setGenres] = useState([]);

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

    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editGrade, setEditGrade] = useState("");
    const [editSchool, setEditSchool] = useState("");
    const [editGenres, setEditGenres] = useState([]);

    const gradeOptions = Array.from({ length: 13 }, (_, i) =>
        i === 0 ? "K" : i.toString()
    );

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

    const loadProfile = async (uid) => {
        setLoading(true);
        try {
          const userRef = doc(db, "users", uid);
          const snap = await getDoc(userRef);
    
          if (snap.exists()) {
            const data = snap.data();
    
            // Missing fields stay as empty strings / empty arrays in UI state
            setName(data.name ?? "");
            setPhone(data.phone ?? "");
            setGrade(data.grade ?? "");
            setSchool(data.school ?? "");
            setGenres(Array.isArray(data.favoriteGenres) ? data.favoriteGenres : []);
          } else {
            // If doc doesn't exist for some reason, just show blanks
            setName("");
            setPhone("");
            setGrade("");
            setSchool("");
            setGenres([]);
          }
        } finally {
          setLoading(false);
        }
    };

    const saveProfile = async () => {
        if (!userUid) return;

        const userRef = doc(db, "users", userUid);

        // Build updates so blanks become MISSING (deleteField), not empty strings.
        const updates = {};

        const n = editName.trim();
        if (n) updates.name = n;
        else updates.name = deleteField();

        const p = editPhone.trim();
        if (p) updates.phone = p;
        else updates.phone = deleteField();

        if (editGrade) updates.grade = editGrade;
        else updates.grade = deleteField();

        const s = editSchool.trim();
        if (s) updates.school = s;
        else updates.school = deleteField();

        if (editGenres.length > 0) updates.favoriteGenres = editGenres;
        else updates.favoriteGenres = deleteField();

        await updateDoc(userRef, updates);

        // Update local display state to match what we saved
        setName(n);
        setPhone(p);
        setGrade(editGrade);
        setSchool(s);
        setGenres(editGenres);

        setModalVisible(false);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setUserUid(null);
                setEmail("");
                setLoading(false);
                setRole("no account"); // TEMP FIX
                return;
            }

            setUserUid(user.uid);
            setRole(user.role);
            setEmail(user.email ?? "");
            await loadProfile(user.uid);
        });

        return unsubscribe;
    }, []);

    return (
        <View className="flex-1 bg-[#f5fdf5] px-5 py-6">
            <Text className="profileH1">Profile</Text>

            <View className="profileCard">
                <View className="flex-1">
                    <Text className="profileName">{name || "Unnamed User"}</Text>
                    <Text className="profileEmail">{email || "--"}</Text>
                    <Text className="profileRole">Bibliomaniacs Reviewer</Text>
                </View>
            </View>

            <View className="profileInfoCard">
                <Text className="sectionTitle">Account Information</Text>

                <View className="infoRow">
                    <Text className="infoLabel">Phone Number</Text>
                    <Text className="infoValue">{phone || "--"}</Text>
                </View>

                <View className="infoRow">
                    <Text className="infoLabel">Grade</Text>
                    <Text className="infoValue">{grade || "--"}</Text>
                </View>

                <View className="infoRow">
                    <Text className="infoLabel">School</Text>
                    <Text className="infoValue">{school || "--"}</Text>
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
                    <View className="modalCard">
                        <ScrollView
                            className="modalScroll"
                            contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
                        >
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

                            <Text className="inputLabel">Grade Level</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                className="gradeRow"
                            >
                                {gradeOptions.map((level) => (
                                    <Pressable
                                        key={level}
                                        className={`gradeOption ${grade === level ? "gradeOptionActive" : ""
                                            }`}
                                        onPress={() => setGrade(level)}
                                    >
                                        <Text
                                            className={`gradeText ${grade === level ? "gradeTextActive" : ""
                                                }`}
                                        >
                                            {level}
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>

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

                        </ScrollView>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

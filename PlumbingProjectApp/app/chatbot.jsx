import React, { useState, useRef } from "react";
import { View, Text, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform, } from "react-native";
import axios from "axios";

export default function ChatbotPage() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const flatListRef = useRef(null);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            sender: "user",
            text: input,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        const waitingMessage = {
            id: (Date.now() + 0.1).toString(),
            sender: "bot",
            text: "Waiting for response...",
            isWaiting: true,
        };
        setMessages((prev) => [...prev, waitingMessage]);


        try {
            const res = await axios.post("http://127.0.0.1:5000/ask_question", {
                question: input,
            });

            const botMessage = {
                id: (Date.now() + 1).toString(),
                sender: "bot",
                text: res.data.response,
            };

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.isWaiting
                        ? { ...msg, text: res.data.response, isWaiting: false }
                        : msg
                )
            );

            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 200);

        } catch (e) {
            console.log(e);
        }
    };

    const renderMessage = ({ item }) => (
        <View>
            <Text>
                {item.sender === "user" ? "You: " : "Bot: "}
                {item.text}
            </Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <Text>Chatbot</Text>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
            />

            <View>
                <TextInput
                    placeholder="Ask something..."
                    value={input}
                    onChangeText={setInput}
                    multiline
                />

                <Pressable onPress={sendMessage}>
                    <Text>Send</Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import Animated, {
  FadeInRight,
  FadeInLeft,
  Layout,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import api from "../api/axios";
import { COLORS } from "../theme/colors";

export default function ChatbotScreen() {
  const [query, setQuery] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chat]);

  // const ask = async () => {
  //   if (!query.trim()) return;

  //   const userMessage = { from: 'user', text: query };
  //   setChat(prev => [...prev, userMessage]);
  //   setQuery('');
  //   setLoading(true);

  //   try {
  //     const res = await api.post('chatbot/', { question: query });
  //     setChat(prev => [...prev, { from: 'bot', text: res.data.reply }]);
  //   } catch (e) {
  //     setChat(prev => [...prev, { from: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const ask = async () => {
    if (!query.trim()) return;

    const userMessage = { from: "user", text: query };
    setChat((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

    try {
      const res = await api.post("chatbot/llm/", {
        message: query,
      });

      setChat((prev) => [...prev, { from: "bot", text: res.data.reply }]);
    } catch (e) {
      console.log(e);
      setChat((prev) => [
        ...prev,
        { from: "bot", text: "Sorry, I encountered an error." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const SuggestedQuestion = ({ text }) => (
    <TouchableOpacity onPress={() => setQuery(text)}>
      <View style={styles.suggestedBtn}>
        <Text style={styles.suggestedText}>{text}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.chatContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <LinearGradient colors={COLORS.gradient2} style={styles.chatHeader}>
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarText}>🤖</Text>
        </View>
        <View>
          <Text style={styles.chatHeaderTitle}>Financial AI Assistant</Text>
          <Text style={styles.chatHeaderSubtitle}>
            Ask me anything about your finances
          </Text>
        </View>
      </LinearGradient>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatBox}
        contentContainerStyle={styles.chatBoxContent}
        showsVerticalScrollIndicator={false}
      >
        {chat.length === 0 && (
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatTitle}>👋 Hi there!</Text>
            <Text style={styles.emptyChatText}>
              I'm your AI financial advisor. Try asking:
            </Text>
            <SuggestedQuestion text="How am I doing financially?" />
            <SuggestedQuestion text="What should I save this month?" />
            <SuggestedQuestion text="Analyze my spending patterns" />
          </View>
        )}

        {chat.map((m, i) =>
          m.from === "user" ? (
            <Animated.View
              key={i}
              entering={FadeInRight.springify()}
              layout={Layout.springify()}
            >
              <View style={styles.userMsgContainer}>
                <LinearGradient
                  colors={COLORS.gradient1}
                  style={styles.userMsg}
                >
                  <Text style={styles.userMsgText}>{m.text}</Text>
                </LinearGradient>
              </View>
            </Animated.View>
          ) : (
            <Animated.View
              key={i}
              entering={FadeInLeft.springify()}
              layout={Layout.springify()}
            >
              <View style={styles.botMsgContainer}>
                <View style={styles.botMsgAvatar}>
                  <Text style={styles.botMsgAvatarText}>🤖</Text>
                </View>
                <View style={styles.botMsg}>
                  <Text style={styles.botMsgText}>{m.text}</Text>
                </View>
              </View>
            </Animated.View>
          )
        )}

        {loading && (
          <Animated.View entering={FadeInLeft.springify()}>
            <View style={styles.botMsgContainer}>
              <View style={styles.botMsgAvatar}>
                <Text style={styles.botMsgAvatarText}>🤖</Text>
              </View>
              <View style={styles.botMsg}>
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={[styles.typingDot, styles.typingDotDelay1]} />
                  <View style={[styles.typingDot, styles.typingDotDelay2]} />
                </View>
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputArea}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Type your question..."
          placeholderTextColor={COLORS.textSecondary}
          style={styles.chatInput}
          mode="flat"
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          theme={{
            colors: { text: COLORS.text, placeholder: COLORS.textSecondary },
          }}
          multiline
          maxLength={500}
        />
        <TouchableOpacity onPress={ask} disabled={loading || !query.trim()}>
          <LinearGradient
            colors={
              query.trim()
                ? COLORS.gradient1
                : [COLORS.surfaceLight, COLORS.surfaceLight]
            }
            style={styles.sendButton}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  botAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  botAvatarText: {
    fontSize: 28,
  },
  chatHeaderTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "bold",
  },
  chatHeaderSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  chatBox: {
    flex: 1,
  },
  chatBoxContent: {
    padding: 16,
  },
  emptyChat: {
    alignItems: "center",
    paddingTop: 40,
  },
  emptyChatTitle: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyChatText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: 24,
  },
  suggestedBtn: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestedText: {
    color: COLORS.text,
    fontSize: 14,
  },
  userMsgContainer: {
    alignItems: "flex-end",
    marginBottom: 16,
  },
  userMsg: {
    maxWidth: "80%",
    padding: 16,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    elevation: 4,
  },
  userMsgText: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
  botMsgContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  botMsgAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  botMsgAvatarText: {
    fontSize: 20,
  },
  botMsg: {
    maxWidth: "75%",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  botMsgText: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },
  typingDotDelay1: {
    opacity: 0.6,
  },
  typingDotDelay2: {
    opacity: 0.3,
  },
  inputArea: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: "flex-end",
  },
  chatInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 24,
    marginRight: 12,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  sendButtonText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "bold",
  },
});

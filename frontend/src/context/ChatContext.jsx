import { createContext, useState, useEffect } from "react";
/*
Context Api: Two main components:
 1. Context Provider : Creating and managing the context
 2. Context consumer : Access the context and its data from within a component

*/
export const ChatContext = createContext("");

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  // Save messages whenever they change:

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(messages));
    }
  }, [messages]);

  // Load messages on mount

  useEffect(() => {
    const savedMessages = localStorage.getItem("chatHistory");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error("Failed to load chat History:", error);
      }
    }
  }, []);

  //   Clear history functions
  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem("chatHistory");
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        clearHistory,
        isStreaming,
        setIsStreaming,
        streamingContent,
        setStreamingContent,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

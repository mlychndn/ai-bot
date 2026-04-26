import save from "/image.png?url";
import { useContext, useState } from "react";
import { streamApi } from "../services/api";
import { ChatContext } from "../context/ChatContext";

function StreamChatInput() {
  const [text, setText] = useState("");
  const { messages, setMessages, isStreaming, setIsStreaming, setStreamingContent } =
    useContext(ChatContext);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!text.trim() || isStreaming) return;

    const userMsg = { role: "user", content: text.trim() };
    const currentHistory = [...messages, userMsg];
    setText("");
    setIsStreaming(true);
    setStreamingContent("");

    // Add user message first. Assistant message starts on first chunk.
    setMessages((prev) => [...prev, userMsg]);

    try {
      let fullText = "";
      let assistantStarted = false;
      for await (const chunk of streamApi(userMsg.content, currentHistory)) {
        fullText += chunk;
        setStreamingContent(fullText);
        setMessages((prev) => {
          const updated = [...prev];
          if (!assistantStarted) {
            updated.push({ role: "assistant", content: fullText });
            assistantStarted = true;
          } else {
            updated[updated.length - 1] = { role: "assistant", content: fullText };
          }
          return updated;
        });
      }
    } catch (error) {
      console.error("Streaming error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        const fallback = {
          role: "assistant",
          content: "Sorry, something went wrong while streaming the response.",
        };

        if (updated[updated.length - 1]?.role === "assistant") {
          updated[updated.length - 1] = fallback;
        } else {
          updated.push(fallback);
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  return (
    <form
      className="chat-input-container"
      onSubmit={submitHandler}
    >
      <textarea
        value={text}
        className="chat-textarea"
        placeholder={isStreaming ? "AI is responding..." : "Type your message..."}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }
        }}
        disabled={isStreaming}
      />
      <button
        className="chat-submit-btn"
        type="submit"
        disabled={isStreaming}
      >
        <img
          src={save}
          alt="Send"
          className="chat-submit-icon"
        />
      </button>
    </form>
  );
}

export default StreamChatInput;

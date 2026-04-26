import save from "/image.png?url";
import { useContext, useState } from "react";
import { streamApi } from "../services/api";
import { ChatContext } from "../utils/ChatContext";

function StreamChatInput() {
  const [text, setText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const { messages, setMessages } = useContext(ChatContext);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!text.trim() || isStreaming) return;

    const userMsg = { role: "user", content: text.trim() };
    const currentHistory = [...messages, userMsg];
    setText("");
    setIsStreaming(true);

    // Add user message + placeholder assistant message.
    setMessages((prev) => [...prev, userMsg, { role: "assistant", content: "" }]);

    try {
      let fullText = "";
      for await (const chunk of streamApi(userMsg.content, currentHistory)) {
        fullText += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          if (!updated.length) return updated;
          updated[updated.length - 1] = { role: "assistant", content: fullText };
          return updated;
        });
      }
    } catch (error) {
      console.error("Streaming error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        if (!updated.length) return updated;
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, something went wrong while streaming the response.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <form className="chat-input-container" onSubmit={submitHandler}>
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
      <button className="chat-submit-btn" type="submit" disabled={isStreaming}>
        <img src={save} alt="Send" className="chat-submit-icon" />
      </button>
    </form>
  );
}

export default StreamChatInput;

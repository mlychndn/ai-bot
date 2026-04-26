import { useContext, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatContext } from "../utils/ChatContext";

function ChatContainer() {
  const { messages } = useContext(ChatContext);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <section className="chat-container">
      <div>
         <div className="chat-row chat-row-ai">
        <span className="ai-bot-icon" aria-label="AI">
          <svg viewBox="0 0 24 24" fill="none" className="ai-bot-icon-svg">
            <rect x="5" y="7" width="14" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 7V4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="9.5" cy="12" r="1" fill="currentColor" />
            <circle cx="14.5" cy="12" r="1" fill="currentColor" />
            <path d="M9 15.2C9.8 16 10.8 16.4 12 16.4C13.2 16.4 14.2 16 15 15.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <div className="chat-bubble chat-bubble-ai">AI message appears here</div>
      </div>
      {messages?.map((msg, index) => (
        <div key={index} className={`chat-row ${msg.role === "user" ? "chat-row-user" : "chat-row-ai"}`}>
          <div className={`chat-bubble ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}`}>
            {msg.role === "assistant" ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {String(msg.content ?? "")}
              </ReactMarkdown>
            ) : (
              msg.content ?? msg
            )}
          </div>
        </div>
      ))}
      <div ref={endRef} />
      </div>
    
    </section>
  );
}

export default ChatContainer;

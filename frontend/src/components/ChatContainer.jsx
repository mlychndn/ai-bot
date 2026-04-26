import { useContext, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatContext } from "../context/ChatContext";
import ClearModal from "./ClearModal";
import CodeBlock from "./CodeBlock";
import LoadingDots from "./LoadingDots";
import "../App.css";

function ChatContainer() {
  const { messages, clearHistory, isStreaming, streamingContent } =
    useContext(ChatContext);
  const [isOpen, setIsOpen] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <section className="chat-container">
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <h2>Start a Conversation</h2>
          <p>Ask me anthing! I'm an AI Assistant</p>
          <div className="example-prompts">
            <h3>Try asking:</h3>
            <ul>
              <li>Explain Redux in easy way</li>
              <li>What can be good roadmap to lean Agentic AI?</li>
              <li>What are the benfits od doing an hour physical activity? </li>
            </ul>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="flex justify-between bg-amber-700 mb-5 p-5 rounded-md">
        <h1 className="text-white font-bold "> 🤖 AI Chat</h1>
        <button
          onClick={() => {
            setIsOpen(true);
          }}
          className="cursor-pointer rounded-md bg-slate-800 p-2 text-white hover:bg-slate-600 hover:border-2"
        >
          🗑️ Clear Chat
        </button>
      </div>
      <section className="chat-container">
        <div>
          <div className="chat-row chat-row-ai"></div>
          {messages?.map((msg, index) => (
            <div
              key={index}
              className={`chat-row ${msg.role === "user" ? "chat-row-user" : "chat-row-ai"}`}
            >
              <div
                className={`chat-bubble ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}`}
              >
                {msg.role === "assistant" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ inline, className, children, ...props }) {
                        if (inline) {
                          return (
                            <code
                              className={className}
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }
                        return (
                          <CodeBlock className={className}>
                            {String(children).replace(/\n$/, "")}
                          </CodeBlock>
                        );
                      },
                    }}
                  >
                    {String(msg.content ?? "")}
                  </ReactMarkdown>
                ) : (
                  (msg.content ?? msg)
                )}
              </div>
            </div>
          ))}
          {isStreaming && !streamingContent && (
            <div className="chat-row chat-row-ai">
              <div className="chat-bubble chat-bubble-ai">
                <LoadingDots />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </section>
      <ClearModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        onConfirm={() => {
          clearHistory();
          setIsOpen(false);
        }}
      ></ClearModal>
    </>
  );
}

export default ChatContainer;

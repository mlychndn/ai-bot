import save from "/image.png?url"
import {useState, useContext} from "react";
import { chatApi } from "../services/api";
import { ChatContext } from "../utils/ChatContext";

function ChatInput (){
    const [text, setText] = useState("")
    const {messages, setMessages} = useContext(ChatContext)
 

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        const userMsg = {role: "user", content: text.trim()}
        setMessages((prev)=>[...prev, userMsg])
        const response = await chatApi(text, [...messages])
        const aiMsg = {role: "assistant", content: response.response}
        setMessages((prev) => [...prev, aiMsg]);

        setText("");
    }
    return (
        <form className="chat-input-container" onSubmit={submitHandler}>
            <textarea
                value={text}
                className="chat-textarea"
                placeholder="Type your message..."
                onChange={(e)=>{setText(e.target.value)}}
                onKeyDown={(e)=>{
                    if(e.key === "Enter" && !e.shiftKey){
                        e.preventDefault()
                        e.currentTarget.form?.requestSubmit();
                    }
                }}
            />
            <button className="chat-submit-btn" type="submit">
                <img src={save} alt="Send" className="chat-submit-icon" />
            </button>
        </form>
    )
}

export default ChatInput

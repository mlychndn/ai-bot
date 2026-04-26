import { createContext, useState} from "react"
/*
Context Api: Two main components:
 1. Context Provider : Creating and managing the context
 2. Context consumer : Access the context and its data from within a component

*/
export const ChatContext = createContext("");

export function ChatProvider({children}){
    const [messages, setMessages] = useState([]);

  return  <ChatContext.Provider value= {{messages, setMessages}}>
       {children} 
    </ChatContext.Provider>
}

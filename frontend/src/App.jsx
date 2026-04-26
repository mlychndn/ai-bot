import StreamChatInput from "./components/StreamChatInput"
import ChatContainer from "./components/ChatContainer"
import {ChatProvider } from "./utils/ChatContext"


import './App.css'

function App() {
  
  return (
    <main className="app-shell">
     <ChatProvider>
        <ChatContainer />
        <StreamChatInput />
     </ChatProvider>  
    </main>
  )
}

export default App

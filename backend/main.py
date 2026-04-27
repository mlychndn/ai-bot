from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, field_validator
from anthropic_client import ClaudeClient
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import json
import os

app = FastAPI()

ALLOWED_ORIGINS= os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

claude_client = ClaudeClient()

@app.get("/health")
def check_health():
    return {
        "status_code": 200,
        "message": "server is healthy"
    }

class Message(BaseModel):
    role:str
    content: str

class chatRequest(BaseModel):
    message: str
    history: Optional[List[Message]] = None

    @field_validator("message")
    @classmethod
    def message_not_empty(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("Message cannot be empty")
        if len(value) > 10000:
            raise ValueError("Message too long (max 10000 characters)")
        return value.strip()

class chatResponse(BaseModel):
    response:str


@app.post("/chat")
def start_chat(request: chatRequest):
   try: 
      user_messages = request.message
      conversation_history = request.history
  
      history_dict = None
  
      if(conversation_history):
          history_dict = [{"role" : msg.role, "content" : msg.content} for msg in conversation_history]
  
      response = claude_client.chat(user_messages, history_dict)
  
      return chatResponse(response=response)
   except Exception as e:
       raise HTTPException(status_code=500, detail=str(e))
   
@app.post("/chat/stream")
def chat_stream(request: chatRequest):
    try:
        # Conert history from Pydantic to dicts
        history = [msg.dict() for msg in request.history] if request.history else None

        # Create generator function for SSE
        def generate():
            try:
                for chunk in claude_client.chat_stream(request.message, history):
                    #format each chunk as SSE Event
                    yield f"data: {json.dumps({'chunk': chunk})}\n\n"
                
                # send completion signal after all chunks
                yield f"data: {json.dumps({'done': True})}\n\n"

            except  Exception as e:
                #send error to client
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        # Takes an gemerator(a function with yield) and streams the response body
        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection":"keep-alive",
                "X-Accel-Buffering": "no"
            }
        )


    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))
   
       

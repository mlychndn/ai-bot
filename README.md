# AI Bot (FastAPI + React + Anthropic)

A simple full-stack chatbot with:
- FastAPI backend
- React (Vite) frontend
- Anthropic Claude integration
- Streaming responses via Server-Sent Events (SSE)

## What This Project Does
- Accepts user messages from the UI
- Sends conversation history + new message to backend
- Calls Claude through Anthropic SDK
- Streams assistant response chunk-by-chunk to frontend
- Renders assistant messages as Markdown

## Tech Stack
- Backend: FastAPI, Uvicorn, Pydantic, python-dotenv, Anthropic SDK
- Frontend: React, Vite, react-markdown, remark-gfm
- Transport: JSON for normal chat, SSE for streaming chat

## Project Structure
```text
ai-bot/
├── backend/
│   ├── main.py
│   ├── anthropic_client.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatContainer.jsx
│   │   │   └── StreamChatInput.jsx
│   │   ├── services/api.js
│   │   ├── utils/ChatContext.jsx
│   │   └── constants.js
│   └── package.json
└── README.md
```

## Environment Variables (Backend)
Create `backend/.env`:

```env
ANTHROPIC_API_KEY=your_key_here
MODEL=claude-opus-4-6
MAX_TOKENS=1024
```

## Run Locally

### 1) Start backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend URL: `http://127.0.0.1:8000`

### 2) Start frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## API Endpoints

### `GET /health`
Health check.

### `POST /chat`
Non-streaming response.

Request body:
```json
{
  "message": "Hello",
  "history": [
    { "role": "user", "content": "Hi" },
    { "role": "assistant", "content": "Hello!" }
  ]
}
```

Response:
```json
{
  "response": "Full assistant reply"
}
```

### `POST /chat/stream`
Streaming response (SSE).

Each event is sent as:
```text
data: {"chunk":"..."}
```

Completion signal:
```text
data: {"done":true}
```

Error signal:
```text
data: {"error":"..."}
```

## Frontend Flow
- `ChatContainer` displays conversation
- `StreamChatInput` handles user input + live streaming updates
- `streamApi()` in `frontend/src/services/api.js` parses SSE lines and yields `chunk`
- UI appends each chunk to the latest assistant message

## Notes
- `frontend/src/constants.js` currently points to `http://127.0.0.1:8000`.
- CORS is configured for local Vite ports in backend.
- Messages are in-memory only (no DB persistence yet).

## Next Improvements
- Add persistent chat history (database or local storage)
- Add cancel/stop generation (`AbortController`)
- Add tool/function calling (weather, scores, news)
- Add tests for backend endpoints and SSE parsing

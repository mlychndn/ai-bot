# Tool Calling Integration Guide

## What This Is Called In AI Terms
This pattern is called **Tool Calling** (also known as **Function Calling**).

- The LLM decides when external data is needed.
- Your backend runs a real function/API call (weather, sports, news).
- The result is sent back to the LLM.
- The LLM returns a final natural-language answer to the user.

When combined with conversation memory + multi-step reasoning, people often call it an **agentic workflow**.

## Why You Need It
LLMs do not have guaranteed live data by default.  
For live weather, scores, and news, your app must fetch real-time data from external APIs.

## Integration Plan For Your Current Bot
You already have:
- FastAPI backend
- Streaming chat endpoint
- React frontend with streaming UI

Add tool calling in backend with these steps.

## Step 1: Define Tool Functions
Create Python functions (for example in `backend/tools.py`):
- `get_weather(city: str)`
- `get_live_scores(league: str, team: str | None = None)`
- `get_news(topic: str, limit: int = 5)`

Each function should:
- call external API
- normalize response into a clean JSON shape
- return only fields needed by UI/LLM

## Step 2: Add API Keys
Add to `.env`:

```env
WEATHER_API_KEY=...
SPORTS_API_KEY=...
NEWS_API_KEY=...
```

## Step 3: Register Tools In Anthropic Request
In `backend/anthropic_client.py`, send tool definitions in `messages.create(...)` or stream call:

- tool name
- description
- input schema (JSON schema)

Example tool schema concept:

```json
{
  "name": "get_weather",
  "description": "Get current weather for a city",
  "input_schema": {
    "type": "object",
    "properties": {
      "city": { "type": "string" }
    },
    "required": ["city"]
  }
}
```

## Step 4: Handle Tool Calls Loop
In your chat flow:

1. Send user message to LLM.
2. If LLM returns a tool-use request:
   - parse tool name + arguments
   - execute matching Python function
   - append tool result to conversation
3. Call LLM again with tool result.
4. Return final assistant text to frontend (stream or non-stream).

This is the core **tool-use loop**.

## Step 5: Keep It Reliable
Add production guards:
- request timeout (3-8 seconds per external API)
- retries (1-2 only)
- short cache (30-120 sec)
- fallback messages when provider fails
- input validation (city/team/topic)

## Step 6: Frontend UX (Optional But Useful)
- show `Fetching live data...` while tool runs
- render tool results as small cards (weather/news/scores)
- include source + timestamp for trust

## Suggested Provider Options
- Weather: OpenWeather, WeatherAPI
- Sports scores: API-Football, TheSportsDB
- News: NewsAPI, GNews

## Minimal Rollout Order
1. Weather tool first
2. News tool second
3. Live scores third

This order keeps complexity low while proving the architecture.

## Quick Glossary
- **Tool Calling / Function Calling**: LLM asks backend to execute a function.
- **Agentic Workflow**: LLM + tools + multi-step loop to complete tasks.
- **RAG**: Retrieval from your own knowledge base/documents (different from live API tools).


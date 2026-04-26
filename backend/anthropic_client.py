import os
from dotenv import load_dotenv
from anthropic import Anthropic

#Load variables from .env into the environment
load_dotenv()



class ClaudeClient:
    def __init__(self):
        self.client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
        self.max_tokens = int(os.getenv('MAX_TOKENS', "1024"))
        self.model = os.getenv('MODEL', 'claude-opus-4-6')

    def _build_messages(self, message: str, history: list=None) -> list:
        messages = []

        print(f"message: {message}")
        print(f"history: {history}")


        if history:
            for msg in history:
                if msg["role"] in ['user', 'assistant']:
                    messages.append(msg)
        
        messages.append({
            "role": "user",
            "content": message
        })

        return messages

    def chat(self, message:str, history:list =None) -> str:

        messages = self._build_messages(message, history)

        print(f"messages: {messages}")

        response = self.client.messages.create(
            max_tokens=self.max_tokens,
            messages=messages,
            model=self.model
        )

        print(f"response: {response.content[0].text}")

        return response.content[0].text
    
    def chat_stream(self, message:str, history:list=None):
        messages = self._build_messages(message, history)

        with self.client.messages.stream(
            max_tokens=self.max_tokens,
            messages=messages,
            model=self.model
        ) as stream:
            for text in stream.text_stream:
                yield text

        
    
    

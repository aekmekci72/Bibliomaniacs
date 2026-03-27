import asyncio
from huggingface_hub import AsyncInferenceClient
import os
from dotenv import load_dotenv

load_dotenv()

client = AsyncInferenceClient(
    model="mistralai/Mistral-7B-Instruct-v0.2",
    token=os.getenv("HUGGINGFACEHUB_API_TOKEN")
)

async def chat(prompt):
    response = await client.chat_completion(
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
        temperature=0.5,
    )
    return response.choices[0].message["content"]
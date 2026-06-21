import httpx
import json
import os
import re

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

async def call_ollama(prompt: str) -> str:
    async with httpx.AsyncClient(timeout=180.0) as client:
        response = await client.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.1}
            }
        )
        response.raise_for_status()
        return response.json()["response"].strip()

async def analyze_with_ollama(prompt: str) -> dict:
    raw = await call_ollama(prompt)

    # Try to extract JSON
    json_match = re.search(r'\{[\s\S]*\}', raw)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError:
            pass

    # Return raw string if not JSON
    return raw

async def generate_text_with_ollama(prompt: str) -> str:
    return await call_ollama(prompt)

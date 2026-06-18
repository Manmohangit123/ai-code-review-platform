import httpx
import json
import os
import re

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

async def analyze_with_ollama(prompt: str) -> dict:
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1
                }
            }
        )
        response.raise_for_status()
        raw = response.json()["response"]

        # Extract JSON from the response
        raw = raw.strip()

        # Try to find JSON block if model wrapped it in markdown
        json_match = re.search(r'\{[\s\S]*\}', raw)
        if json_match:
            raw = json_match.group(0)

        return json.loads(raw)

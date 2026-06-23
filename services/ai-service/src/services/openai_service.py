import httpx
import json
import os
import re

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

async def call_openai(prompt: str) -> str:
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": OPENAI_MODEL,
                "messages": [
                    {"role": "system", "content": "You are an expert code reviewer. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.1,
                "max_tokens": 1500
            }
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"].strip()

async def analyze_with_openai(prompt: str) -> dict:
    raw = await call_openai(prompt)

    json_match = re.search(r'\{[\s\S]*\}', raw)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError:
            pass

    return {"overall_score": 70, "summary": raw, "findings": []}

async def generate_text_with_openai(prompt: str) -> str:
    return await call_openai(prompt)

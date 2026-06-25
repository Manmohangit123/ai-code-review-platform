import asyncio
import httpx
import json
import os
import re

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

async def call_gemini(prompt: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    retry_delays = [10, 20, 30]
    for attempt in range(3):
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(
                url,
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.3, "maxOutputTokens": 8192}
                }
            )
            if response.status_code == 429 and attempt < 2:
                print(f"Rate limited, retrying in {retry_delays[attempt]}s... (attempt {attempt + 1})")
                await asyncio.sleep(retry_delays[attempt])
                continue
            response.raise_for_status()
            return response.json()["candidates"][0]["content"]["parts"][0]["text"].strip()

async def analyze_with_gemini(prompt: str) -> dict:
    raw = await call_gemini(prompt)
    json_match = re.search(r'\{[\s\S]*\}', raw)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError:
            pass
    return {"overall_score": 70, "summary": raw, "findings": []}

async def generate_text_with_gemini(prompt: str) -> str:
    return await call_gemini(prompt)

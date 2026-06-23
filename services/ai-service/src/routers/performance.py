from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from src.services.gemini_service import analyze_with_gemini as analyze_with_ollama
from src.services.prompt_builder import PERFORMANCE_SCAN_PROMPT

router = APIRouter()

class PerformanceScanRequest(BaseModel):
    file_path: str
    code: str
    language: Optional[str] = "unknown"

@router.post("/")
async def scan_performance(request: PerformanceScanRequest):
    try:
        code = request.code[:8000]
        prompt = PERFORMANCE_SCAN_PROMPT.format(
            language=request.language,
            file_path=request.file_path,
            code=code
        )
        result = await analyze_with_ollama(prompt)
        return {
            "performance_score": result.get("performance_score", 70),
            "summary": result.get("summary", "Analysis complete."),
            "issues": result.get("issues", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Performance scan failed: {str(e)}")

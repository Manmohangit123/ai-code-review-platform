from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from src.services.gemini_service import analyze_with_gemini as analyze_with_ollama
from src.services.prompt_builder import SECURITY_SCAN_PROMPT

router = APIRouter()

class SecurityScanRequest(BaseModel):
    file_path: str
    code: str
    language: Optional[str] = "unknown"

@router.post("/")
async def scan_security(request: SecurityScanRequest):
    try:
        code = request.code[:4000]
        prompt = SECURITY_SCAN_PROMPT.format(
            language=request.language,
            file_path=request.file_path,
            code=code
        )
        result = await analyze_with_ollama(prompt)
        return {
            "risk_level": result.get("risk_level", "none"),
            "summary": result.get("summary", "No vulnerabilities detected."),
            "vulnerabilities": result.get("vulnerabilities", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Security scan failed: {str(e)}")

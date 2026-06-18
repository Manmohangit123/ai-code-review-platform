from pydantic import BaseModel
from typing import List, Optional

class CodeReviewRequest(BaseModel):
    file_path: str
    code: str
    language: Optional[str] = "unknown"

class Finding(BaseModel):
    line_start: Optional[int] = None
    line_end: Optional[int] = None
    severity: str        # critical | high | medium | low | info
    category: str        # bug | security | performance | style | complexity
    title: str
    description: str
    suggestion: str

class CodeReviewResponse(BaseModel):
    overall_score: int
    summary: str
    findings: List[Finding]

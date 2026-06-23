from fastapi import APIRouter, HTTPException
from src.models.schemas import CodeReviewRequest, CodeReviewResponse
from src.services.openai_service import analyze_with_openai as analyze_with_ollama
from src.services.prompt_builder import CODE_REVIEW_PROMPT

router = APIRouter()

@router.post("/", response_model=CodeReviewResponse)
async def review_code(request: CodeReviewRequest):
    try:
        # Limit code size to avoid token overload
        code = request.code[:8000]

        prompt = CODE_REVIEW_PROMPT.format(
            language=request.language,
            file_path=request.file_path,
            code=code
        )

        result = await analyze_with_ollama(prompt)

        return {
            "overall_score": result.get("overall_score", 70),
            "summary": result.get("summary", "Analysis complete."),
            "findings": result.get("findings", [])
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

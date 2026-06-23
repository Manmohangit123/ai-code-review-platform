from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from src.services.openai_service import generate_text_with_openai as generate_text_with_ollama
from src.services.prompt_builder import README_GENERATOR_PROMPT

router = APIRouter()

class FileItem(BaseModel):
    path: str
    content: Optional[str] = ""

class ReadmeRequest(BaseModel):
    project_name: str
    file_tree: List[str]
    code_samples: List[FileItem]

@router.post("/readme")
async def generate_readme(request: ReadmeRequest):
    try:
        file_tree_str = "\n".join(request.file_tree[:100])

        samples_str = ""
        for f in request.code_samples[:3]:
            samples_str += f"\n--- {f.path} ---\n{f.content[:2000]}\n"

        prompt = README_GENERATOR_PROMPT.format(
            project_name=request.project_name,
            file_tree=file_tree_str,
            code_samples=samples_str
        )

        readme = await generate_text_with_ollama(prompt)
        return {"readme": readme}

    except Exception as e:
        import traceback
        print("README error:", str(e))
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"README generation failed: {str(e)}")

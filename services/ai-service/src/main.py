from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routers import review, security, performance, docs_gen

app = FastAPI(title="AI Code Review Service", version="1.0.0")

import os
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(review.router, prefix="/ai/review", tags=["review"])
app.include_router(security.router, prefix="/ai/security", tags=["security"])
app.include_router(performance.router, prefix="/ai/performance", tags=["performance"])
app.include_router(docs_gen.router, prefix="/ai/docs", tags=["docs"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-service"}

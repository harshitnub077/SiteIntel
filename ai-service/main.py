from fastapi import FastAPI
from pydantic import BaseModel
import asyncio

app = FastAPI()

class VisionRequest(BaseModel):
    image_base64: str

class AnalyzeRequest(BaseModel):
    photo_url: str

@app.get("/")
def read_root():
    return {"status": "online", "service": "FieldAI Python AI Engine", "version": "1.0.0"}

@app.get("/ping")
def ping():
    return {"status": "ok"}

@app.post("/api/ai/analyze-defect")
def ping():
    return {"status": "ok"}

@app.post("/analyze")
async def analyze_defect(request: AnalyzeRequest):
    print(f"[AI Service] Analyzing photo: {request.photo_url}")
    await asyncio.sleep(0.5)
    
    return {
        "label": "Concrete hairline crack",
        "severity": "med",
        "suggested_location": "Unknown"
    }

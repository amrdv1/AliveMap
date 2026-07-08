from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import uvicorn
from parser import parse_telegram_text, ParsedThreat

app = FastAPI(title="AliveMap Python Parser")

class ParseRequest(BaseModel):
    text: str

class ParseResponse(BaseModel):
    threats: List[ParsedThreat]

@app.post("/parse", response_model=ParseResponse)
async def parse_text(req: ParseRequest):
    try:
        results = parse_telegram_text(req.text)
        return ParseResponse(threats=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

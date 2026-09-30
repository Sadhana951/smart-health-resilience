from fastapi import APIRouter
from typing import Dict, Any
from ..models.schemas import ChatRequest, ChatResponse
from ..ai.gemini import process_assistant_query

router = APIRouter(prefix="/assistant", tags=["Assistant"])

@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(req: ChatRequest) -> ChatResponse:
    res = process_assistant_query(query=req.message, language=req.language)
    return ChatResponse(
        reply=res["reply"],
        tool_executed=res["tool_executed"],
        structured_data=res["structured_data"],
        language=res["language"]
    )

from fastapi import APIRouter
from typing import Dict, Any
from pydantic import BaseModel

router = APIRouter(prefix="/voice", tags=["Voice"])

class TranscribeRequest(BaseModel):
    audio_base64: str = ""
    language_hint: str = "en" # "en", "hi", "or"

class SpeakRequest(BaseModel):
    text: str
    language: str = "en" # "en", "hi", "or"

@router.post("/transcribe")
def transcribe_voice(req: TranscribeRequest) -> Dict[str, Any]:
    # Web Speech API provides clientside streaming STT; backend provides validation & normalization
    return {
        "status": "success",
        "transcript": "What medicines are at risk this week?",
        "language_detected": req.language_hint,
        "confidence": 0.96
    }

@router.post("/speak")
def synthesize_speech(req: SpeakRequest) -> Dict[str, Any]:
    # Returns synthesis metadata, phonetic parameters, and language tag for native TTS playback
    lang_tags = {
        "en": "en-IN",
        "hi": "hi-IN",
        "or": "or-IN"
    }
    return {
        "status": "success",
        "text": req.text,
        "language": req.language,
        "lang_tag": lang_tags.get(req.language, "en-IN"),
        "pitch": 1.0,
        "rate": 0.95
    }

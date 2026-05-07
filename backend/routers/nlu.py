import os
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ibm_watson import NaturalLanguageUnderstandingV1
from ibm_watson.natural_language_understanding_v1 import Features, EntitiesOptions, KeywordsOptions, SentimentOptions, EmotionOptions, ConceptsOptions
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/nlu", tags=["Natural Language Understanding"])

# Load configurations
NLU_APIKEY = os.environ.get("IBM_NLU_API_KEY")
NLU_URL = os.environ.get("IBM_NLU_URL")

nlu_service = None

def get_nlu_service():
    global nlu_service
    if nlu_service:
        return nlu_service
        
    if not NLU_APIKEY or not NLU_URL:
        return None
        
    try:
        authenticator = IAMAuthenticator(NLU_APIKEY)
        nlu_service = NaturalLanguageUnderstandingV1(
            version='2022-04-07',
            authenticator=authenticator
        )
        nlu_service.set_service_url(NLU_URL)
        return nlu_service
    except Exception as e:
        logger.error(f"Failed to initialize IBM NLU: {e}")
        return None

class NLURequest(BaseModel):
    text: str

@router.post("/analyze")
async def analyze_text(request: NLURequest):
    """
    Analyzes text using IBM Watson NLU.
    Extracts Sentiment, Emotion, Keywords, Entities, and Concepts.
    This acts as a non-intrusive sidecar analysis layer.
    """
    service = get_nlu_service()
    if not service:
        # Gracefully degrade if IBM NLU isn't configured
        return {"error": "IBM NLU is not configured or disabled.", "insights": None}

    # Text must be at least 15 characters for some NLU features to work well, 
    # but we'll pass whatever we have and let IBM handle it safely.
    clean_text = request.text.strip()
    if not clean_text:
        return {"error": "Empty text provided.", "insights": None}

    try:
        response = service.analyze(
            text=clean_text,
            features=Features(
                sentiment=SentimentOptions(),
                emotion=EmotionOptions(),
                keywords=KeywordsOptions(limit=5),
                entities=EntitiesOptions(limit=5),
                concepts=ConceptsOptions(limit=3)
            )
        ).get_result()

        # Simplify the response for the frontend
        insights = {
            "sentiment": response.get("sentiment", {}).get("document", {}),
            "emotion": response.get("emotion", {}).get("document", {}).get("emotion", {}),
            "keywords": [k.get("text") for k in response.get("keywords", [])],
            "entities": [{"text": e.get("text"), "type": e.get("type")} for e in response.get("entities", [])],
            "concepts": [c.get("text") for c in response.get("concepts", [])]
        }
        
        return {"error": None, "insights": insights}

    except Exception as e:
        logger.error(f"IBM NLU Analysis failed: {e}")
        # Return a graceful error so the frontend doesn't crash
        return {"error": str(e), "insights": None}

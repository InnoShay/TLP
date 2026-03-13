import asyncio
from services.evidence_analyzer import analyze_evidence
from services.source_aggregator import RawEvidence
from models import SourceType
from config import GEMINI_API_KEY
import google.generativeai as genai

async def main():
    evidences = [
        RawEvidence(
            source_name="Wikipedia",
            source_type=SourceType.WIKIPEDIA,
            content="The Earth is not flat, it is a roughly spherical object.",
            url="https://en.wikipedia.org"
        )
    ]
    res = await analyze_evidence("The Earth is flat", evidences)
    print("Result:", [r.model_dump() for r in res])

if __name__ == "__main__":
    asyncio.run(main())

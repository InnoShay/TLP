import asyncio
import logging
from config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_TEMPERATURE
import google.generativeai as genai
from services.claim_extractor import EXTRACTION_PROMPT

logging.basicConfig(level=logging.INFO)
genai.configure(api_key=GEMINI_API_KEY)

async def main():
    text = "Many of the records and files belong to Epstein's estate, which is run by lawyer Darren Indyke and accountan"
    model = genai.GenerativeModel(GEMINI_MODEL)
    response = model.generate_content(
        EXTRACTION_PROMPT.format(text=text),
        generation_config=genai.types.GenerationConfig(
            temperature=GEMINI_TEMPERATURE,
        ),
    )
    print("RAW:\n", response.text)

if __name__ == "__main__":
    asyncio.run(main())

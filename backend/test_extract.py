import asyncio
import logging
from config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_TEMPERATURE
import google.generativeai as genai
from services.claim_extractor import EXTRACTION_PROMPT

logging.basicConfig(level=logging.INFO)
genai.configure(api_key=GEMINI_API_KEY)

async def main():
    text = "The Earth is flat."
    model = genai.GenerativeModel(GEMINI_MODEL)
    response = model.generate_content(
        EXTRACTION_PROMPT.format(text=text),
        generation_config=genai.types.GenerationConfig(
            temperature=GEMINI_TEMPERATURE,
            max_output_tokens=2048,
        ),
    )
    print("RAW OUTPUT:\n", repr(response.text))

if __name__ == "__main__":
    asyncio.run(main())

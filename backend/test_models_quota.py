import asyncio
import logging
from config import GEMINI_API_KEY
import google.generativeai as genai

logging.basicConfig(level=logging.INFO)
genai.configure(api_key=GEMINI_API_KEY)

async def test_model(m):
    print(f"Testing {m}...")
    try:
        model = genai.GenerativeModel(m)
        r = model.generate_content("Hello")
        print(f"SUCCESS: {m}")
        return True
    except Exception as e:
        print(f"FAIL {m}: {str(e)[:150]}")
        return False

async def main():
    models = [
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash-lite-001",
        "gemini-2.5-flash",
        "gemini-1.5-flash"
    ]
    for m in models:
        await test_model(m)

if __name__ == "__main__":
    asyncio.run(main())

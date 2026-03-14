import asyncio
import logging
from config import GEMINI_API_KEY
import google.generativeai as genai

logging.basicConfig(level=logging.INFO)
genai.configure(api_key=GEMINI_API_KEY)

def main():
    for m in genai.list_models():
        if "generateContent" in m.supported_generation_methods:
            print(m.name)

if __name__ == "__main__":
    main()

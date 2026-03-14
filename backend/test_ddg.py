import asyncio
from duckduckgo_search import DDGS
import logging

def search():
    try:
        with DDGS() as ddgs:
            # use html backend instead of default (which uses bing now)
            results = [r for r in ddgs.text("The Earth is flat", max_results=3, backend="html")]
            print("RESULTS:", results)
    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    search()

import asyncio
from services.source_aggregator import search_wikipedia, search_factcheck
from models import Claim

async def main():
    c = Claim(subject="The Earth", predicate="is", object="flat", original_text="The Earth is flat", temporal=None, claim_type="factual")
    w = await search_wikipedia(c)
    f = await search_factcheck(c)
    print("WIKI:", w)
    print("FACT:", f)

if __name__ == "__main__":
    asyncio.run(main())

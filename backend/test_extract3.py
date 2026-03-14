import asyncio
from services.claim_extractor import extract_claims

async def main():
    text = "Yes, there is water on Mars, primarily in the form of polar ice and deep subsurface ice. Recent 2024 studies from NASA’s InSight lander found evidence of a large reservoir of liquid water trapped in fractured rock within the Martian crust, roughly 11.5 to 20 kilometers deep, offering a new target for potential microbial life."
    claims = await extract_claims(text)
    for c in claims:
        print(f"SUBJ: {c.subject} | PRED: {c.predicate} | OBJ: {c.object}")

if __name__ == "__main__":
    asyncio.run(main())

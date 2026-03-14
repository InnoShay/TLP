from duckduckgo_search import DDGS

def test_ddg_chat():
    try:
        ddgs = DDGS()
        response = ddgs.chat("Extract the subject, predicate, and object from this claim: 'The earth revolves around the sun'. Return ONLY valid JSON.", model='gpt-4o-mini')
        print("DDG CHAT RESPONSE:")
        print(response)
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_ddg_chat()

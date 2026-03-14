from duckduckgo_search import DDGS
query = "Many of the records and files belong to Epstein's estate, which is run by lawyer Darren Indyke and accountan"
with DDGS() as ddgs:
    results = ddgs.text(query[:100], max_results=3, backend="lite")
    print("RESULTS LITE:", len(results))

    results_api = ddgs.text(query[:100], max_results=3, backend="api")
    print("RESULTS API:", len(results_api))

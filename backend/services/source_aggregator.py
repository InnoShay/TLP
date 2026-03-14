"""TrustLayer Source Aggregator — Queries multiple free knowledge sources in parallel."""

import asyncio
import logging
import re
from typing import Optional

import httpx
from duckduckgo_search import DDGS

from models import Claim, SourceType

logger = logging.getLogger(__name__)


# ── Raw evidence container (before stance analysis) ──

class RawEvidence:
    """Raw evidence from a source, before stance analysis."""

    def __init__(self, source_name: str, source_type: SourceType, content: str,
                 url: Optional[str] = None):
        self.source_name = source_name
        self.source_type = source_type
        self.content = content
        self.url = url

    def to_dict(self):
        return {
            "source_name": self.source_name,
            "source_type": self.source_type.value,
            "content": self.content,
            "url": self.url,
        }


# ── DuckDuckGo Search (Free, No API Key) ──

async def search_duckduckgo(claim: Claim, max_results: int = 5) -> list[RawEvidence]:
    """Search DuckDuckGo for evidence related to the claim."""
    # Construct an optimized search query
    if claim.subject != "Unknown":
        query = f"{claim.subject} {claim.predicate} {claim.object}"
    else:
        # Fallback: Truncate long paragraphs to 5 words without punctuation
        # to prevent strict search engines from returning 0 results
        clean_text = re.sub(r'[^a-zA-Z0-9\s]', '', claim.original_text)
        words = clean_text.split()
        query = " ".join(words[:5])
        
    evidences = []
    try:
        ddgs = DDGS()
        # Try default backend (Bing wrapper)
        results = ddgs.text(query, max_results=max_results)
        
        # If Bing wrapper is blocked (returns []), fallback to HTML backend
        if not results:
            logger.warning("DuckDuckGo default backend returned 0 results. Falling back to HTML backend.")
            results = ddgs.text(query, max_results=max_results, backend="html")
            
        for r in results:
            evidences.append(
                RawEvidence(
                    source_name=_extract_domain(r.get("href", "")),
                    source_type=_classify_source(r.get("href", "")),
                    content=f"{r.get('title', '')}. {r.get('body', '')}",
                    url=r.get("href"),
                )
            )
        logger.info(f"🔍 DuckDuckGo: found {len(evidences)} results")
    except Exception as e:
        logger.error(f"DuckDuckGo search failed: {e}")
    return evidences


# ── Wikipedia API (Free, No API Key) ──

async def search_wikipedia(claim: Claim) -> list[RawEvidence]:
    """Search Wikipedia for information related to the claim."""
    evidences = []
    
    # Use original text for the search query, it's safer than extracted subject/object
    # Clean it first to remove leading/trailing quotes and conversational filler
    search_query = re.sub(r'^[“"\'\s]+|[”"\'\s]+$', '', claim.original_text)
    if len(search_query) > 100:
        clean_text = re.sub(r'[^a-zA-Z0-9\s]', '', search_query)
        search_query = " ".join(clean_text.split()[:8])

    # Stopwords to skip for direct article lookup
    stopwords = {"the", "a", "an", "our", "is", "are", "was", "were", "in", "on", "at", "by", "for", "with", "about", "to", "this", "that", "it"}
    
    # Extract just the first significant noun/keyword for the summary article lookup
    potential_keywords = [w for w in search_query.lower().split() if w not in stopwords and len(w) > 3]
    article_lookup = potential_keywords[0] if potential_keywords else search_query.split()[0]
    
    try:
        headers = {"User-Agent": "TrustLayerMVP/1.0 (https://github.com/test/TLP; test@example.com) httpx/0.28.1"}
        async with httpx.AsyncClient(headers=headers, timeout=15) as client:
            # 1. Try the search endpoint for broader coverage
            search_api = "https://en.wikipedia.org/w/api.php"
            params = {
                "action": "query",
                "list": "search",
                "srsearch": search_query,
                "format": "json",
                "srlimit": 3,
            }
            resp = await client.get(search_api, params=params)
            if resp.status_code == 200:
                results = resp.json().get("query", {}).get("search", [])
                for r in results:
                    snippet = r.get("snippet", "").replace("<span class=\"searchmatch\">", "").replace("</span>", "")
                    if snippet and len(snippet) > 30:
                        evidences.append(
                            RawEvidence(
                                source_name="Wikipedia",
                                source_type=SourceType.WIKIPEDIA,
                                content=f"{r.get('title', '')}: {snippet}",
                                url=f"https://en.wikipedia.org/wiki/{r.get('title', '').replace(' ', '_')}",
                            )
                        )

            # 2. Add the direct article summary if possible
            if article_lookup:
                summary_url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + article_lookup.replace(" ", "_")
                resp = await client.get(summary_url)
                if resp.status_code == 200:
                    data = resp.json()
                    extract = data.get("extract", "")
                    if extract:
                        evidences.append(
                            RawEvidence(
                                source_name="Wikipedia",
                                source_type=SourceType.WIKIPEDIA,
                                content=extract[:500],
                                url=data.get("content_urls", {}).get("desktop", {}).get("page"),
                            )
                        )

        logger.info(f"📚 Wikipedia: found {len(evidences)} results")
    except Exception as e:
        logger.error(f"Wikipedia search failed: {e}")
    return evidences


# ── Google Fact Check API (Free) ──

async def search_factcheck(claim: Claim) -> list[RawEvidence]:
    """Search Google Fact Check Tools API for existing fact-checks."""
    evidences = []
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
            params = {"query": claim.original_text, "pageSize": 5}
            resp = await client.get(url, params=params)

            if resp.status_code == 200:
                data = resp.json()
                for item in data.get("claims", []):
                    for review in item.get("claimReview", []):
                        evidences.append(
                            RawEvidence(
                                source_name=review.get("publisher", {}).get("name", "Fact Checker"),
                                source_type=SourceType.FACT_CHECK,
                                content=f"Claim: {item.get('text', '')}. Rating: {review.get('textualRating', 'Unknown')}",
                                url=review.get("url"),
                            )
                        )

        logger.info(f"✅ Fact Check API: found {len(evidences)} results")
    except Exception as e:
        logger.error(f"Fact Check API failed: {e}")
    return evidences


# ── Aggregate All Sources ──

async def search_all_sources(claim: Claim) -> list[RawEvidence]:
    """Query all knowledge sources in parallel and aggregate results."""
    results = await asyncio.gather(
        search_duckduckgo(claim),
        search_wikipedia(claim),
        search_factcheck(claim),
        return_exceptions=True,
    )

    all_evidence = []
    for result in results:
        if isinstance(result, list):
            all_evidence.extend(result)
        elif isinstance(result, Exception):
            logger.error(f"Source query failed: {result}")

    logger.info(f"📊 Total raw evidence gathered: {len(all_evidence)} from all sources")
    return all_evidence


# ── Helpers ──

def _extract_domain(url: str) -> str:
    """Extract clean domain name from URL."""
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        domain = parsed.netloc.replace("www.", "")
        return domain or "Unknown"
    except Exception:
        return "Unknown"


def _classify_source(url: str) -> SourceType:
    """Classify source type based on the domain."""
    url_lower = url.lower()

    gov_indicators = [".gov", ".gov.", "government", "nic.in", "europa.eu"]
    if any(ind in url_lower for ind in gov_indicators):
        return SourceType.GOVERNMENT

    news_domains = ["reuters.", "apnews.", "bbc.", "nytimes.", "washingtonpost.",
                    "theguardian.", "aljazeera.", "cnn.", "ndtv.", "thehindu."]
    if any(d in url_lower for d in news_domains):
        return SourceType.NEWS_AGENCY

    science_indicators = ["nature.com", "science.org", "pubmed", "arxiv.",
                          "springer.", "wiley.", "sciencedirect.", "scholar.google"]
    if any(ind in url_lower for ind in science_indicators):
        return SourceType.SCIENTIFIC_JOURNAL

    factcheck_indicators = ["factcheck", "snopes.", "politifact.", "fullfact.",
                            "altnews.", "boomlive."]
    if any(ind in url_lower for ind in factcheck_indicators):
        return SourceType.FACT_CHECK

    if "wikipedia." in url_lower:
        return SourceType.WIKIPEDIA

    return SourceType.WEB_SEARCH

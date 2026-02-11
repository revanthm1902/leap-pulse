"""
LeapPulse — Sentiment Analysis & Priority Classification
Uses TextBlob for quick polarity scoring.
Falls back to keyword heuristics when TextBlob returns neutral.
Priority is determined by sentiment + engagement + contextual signals.
"""

from textblob import TextBlob

# Weighted keywords for domain-specific sentiment
_NEGATIVE_KEYWORDS = [
    "frustrated", "terrible", "worst", "scam", "fraud", "disappointing",
    "hidden fees", "mediocre", "poor", "delayed", "no response", "avoid",
    "waste", "misleading", "unprofessional", "rude", "confusing",
]
_POSITIVE_KEYWORDS = [
    "amazing", "excellent", "game-changing", "seamless", "recommend",
    "love", "best", "outstanding", "helpful", "incredible", "smooth",
    "fantastic", "great", "perfect", "wonderful",
]

# Keywords that signal marketing opportunities (testimonials, success stories)
_GOLD_KEYWORDS = [
    "acceptance letter", "got admitted", "got accepted", "offered admission",
    "scored 8", "scored 9", "band 8", "band 9", "ielts 8", "ielts 9",
    "highly recommend", "game-changer", "life-changing", "best decision",
    "dream university", "scholarship", "success story", "thank you",
    "grateful", "appreciate", "5 star", "five star",
]

# Keywords that signal a PR crisis / critical issue
_CRISIS_KEYWORDS = [
    "scam", "fraud", "lawsuit", "police", "legal action", "consumer court",
    "viral", "trending", "boycott", "expose", "warning", "do not use",
    "stolen", "data breach", "leaked",
]


def _keyword_boost(text: str) -> float:
    """Return a small sentiment nudge based on domain keywords."""
    lower = text.lower()
    neg = sum(1 for kw in _NEGATIVE_KEYWORDS if kw in lower)
    pos = sum(1 for kw in _POSITIVE_KEYWORDS if kw in lower)
    return (pos - neg) * 0.15


def analyze_sentiment(text: str) -> float:
    """
    Returns a sentiment score in the range [-1.0, 1.0].
    Combines TextBlob polarity with domain keyword boosting.
    """
    blob = TextBlob(text)
    base = blob.sentiment.polarity  # -1.0 to 1.0
    boost = _keyword_boost(text)
    score = max(-1.0, min(1.0, base + boost))
    return round(score, 3)


def compute_priority(sentiment: float, likes: int) -> str:
    """
    Context-aware priority classification:

      1. CRITICAL ALERT  — strong negative sentiment with high reach,
                           OR contains crisis keywords with any negative sentiment
      2. MARKETING GOLD  — strong positive sentiment,
                           OR contains gold keywords with any positive sentiment
      3. HIGH PRIORITY   — moderately negative sentiment
      4. NEUTRAL         — everything else
    """
    return "NEUTRAL"  # Placeholder — real logic below


def compute_priority_contextual(sentiment: float, likes: int, content: str) -> str:
    """
    Full contextual priority classification using sentiment + engagement + keywords.
    """
    lower = content.lower()

    has_crisis = any(kw in lower for kw in _CRISIS_KEYWORDS)
    has_gold = any(kw in lower for kw in _GOLD_KEYWORDS)

    # CRITICAL: crisis keywords + negative, or very negative + viral
    if has_crisis and sentiment < -0.2:
        return "CRITICAL ALERT"
    if sentiment < -0.5 and likes > 50:
        return "CRITICAL ALERT"

    # MARKETING GOLD: gold keywords + positive, or very positive
    if has_gold and sentiment > 0.2:
        return "MARKETING GOLD"
    if sentiment > 0.6:
        return "MARKETING GOLD"

    # HIGH PRIORITY: moderately negative
    if sentiment < -0.3:
        return "HIGH PRIORITY"

    return "NEUTRAL"

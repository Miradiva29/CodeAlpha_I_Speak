"""Transparent FAQ preprocessing and cosine-similarity matching."""

from __future__ import annotations

import math
import re
from collections import Counter
from dataclasses import dataclass
from typing import Iterable, Mapping

from nltk.stem import PorterStemmer
from nltk.tokenize import wordpunct_tokenize


STOP_WORDS = {
    "a",
    "an",
    "and",
    "are",
    "can",
    "do",
    "for",
    "how",
    "i",
    "in",
    "is",
    "it",
    "me",
    "my",
    "of",
    "on",
    "or",
    "the",
    "to",
    "what",
    "when",
    "where",
    "which",
    "with",
    "you",
    "your",
}

stemmer = PorterStemmer()


def preprocess(text: str) -> list[str]:
    """Lowercase, tokenize with NLTK, remove noise/stop words, then stem."""

    tokens = []
    for token in wordpunct_tokenize(text.lower()):
        if not re.fullmatch(r"[a-z0-9]+", token) or token in STOP_WORDS:
            continue
        tokens.append(stemmer.stem(token))
    return tokens


def cosine_similarity(left: Mapping[str, float], right: Mapping[str, float]) -> float:
    """Return cosine similarity for two sparse vectors."""

    if not left or not right:
        return 0.0
    dot_product = sum(value * right.get(term, 0.0) for term, value in left.items())
    left_norm = math.sqrt(sum(value * value for value in left.values()))
    right_norm = math.sqrt(sum(value * value for value in right.values()))
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return dot_product / (left_norm * right_norm)


@dataclass(frozen=True)
class FAQMatch:
    question: str
    answer: str
    score: float


class FAQMatcher:
    """Build TF-IDF vectors for editable FAQ entries and find the closest one."""

    def __init__(
        self,
        faqs: Iterable[Mapping[str, object]],
        minimum_score: float = 0.18,
    ) -> None:
        self.minimum_score = minimum_score
        self.faqs = list(faqs)
        self.documents = [
            " ".join(
                [
                    str(faq["question"]),
                    *[str(example) for example in faq.get("examples", [])],
                ]
            )
            for faq in self.faqs
        ]
        self.tokens = [preprocess(document) for document in self.documents]
        self.idf = self._build_idf(self.tokens)
        self.vectors = [self._tfidf_vector(document) for document in self.tokens]

    @staticmethod
    def _build_idf(documents: list[list[str]]) -> dict[str, float]:
        document_frequency = Counter(
            term for document in documents for term in set(document)
        )
        total_documents = max(len(documents), 1)
        return {
            term: math.log((1 + total_documents) / (1 + frequency)) + 1
            for term, frequency in document_frequency.items()
        }

    def _tfidf_vector(self, tokens: list[str]) -> dict[str, float]:
        if not tokens:
            return {}
        counts = Counter(tokens)
        total = len(tokens)
        return {
            term: (count / total) * self.idf.get(term, 1.0)
            for term, count in counts.items()
        }

    def find_best_match(self, question: str) -> FAQMatch | None:
        query_tokens = preprocess(question)
        query_vector = self._tfidf_vector(query_tokens)
        if not query_vector:
            return None

        scores = [
            cosine_similarity(query_vector, faq_vector)
            for faq_vector in self.vectors
        ]
        best_index = max(range(len(scores)), key=scores.__getitem__)
        best_score = scores[best_index]
        if best_score < self.minimum_score:
            return None

        best_faq = self.faqs[best_index]
        return FAQMatch(
            question=str(best_faq["question"]),
            answer=str(best_faq["answer"]),
            score=best_score,
        )
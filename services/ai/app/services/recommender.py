from __future__ import annotations

from typing import Any

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from app.services.embedder import encode_texts


def _compose_text(item: dict[str, Any]) -> str:
    tags = item.get("tags") or item.get("skills") or []
    title = str(item.get("title") or item.get("role") or item.get("company") or "Untitled")
    description = str(item.get("description") or "")
    tag_text = " ".join(str(tag) for tag in tags)
    return f"{title}. {description}. {tag_text}".strip()


def score_personalized(items: list[dict[str, Any]], interests: list[str]) -> list[dict[str, Any]]:
    if not items:
        return []

    user_query = " ".join(interests).strip() or "campus growth leadership hackathon internship"
    corpus = [_compose_text(item) for item in items]

    corpus_embeddings = encode_texts(corpus)
    user_embedding = encode_texts([user_query])

    similarities = cosine_similarity(user_embedding, corpus_embeddings).flatten()

    ranked: list[dict[str, Any]] = []
    for index, score in enumerate(similarities):
        item = items[index]
        title = str(item.get("title") or item.get("role") or "Campus Opportunity")
        ranked.append(
            {
                "id": str(item.get("id") or index),
                "title": title,
                "type": str(item.get("type") or "event"),
                "score": float(score),
                "reason": f"Matched with interests: {', '.join(interests[:3]) or 'growth'}"
            }
        )

    ranked.sort(key=lambda entry: entry["score"], reverse=True)
    return ranked[:10]


def semantic_search(items: list[dict[str, Any]], query: str) -> list[dict[str, Any]]:
    if not items:
        return []

    corpus = [_compose_text(item) for item in items]
    corpus_embeddings = encode_texts(corpus)
    query_embedding = encode_texts([query])

    scores = cosine_similarity(query_embedding, corpus_embeddings).flatten()

    results: list[dict[str, Any]] = []
    for index, score in enumerate(scores):
        results.append(
            {
                "item": items[index],
                "score": float(score)
            }
        )

    results.sort(key=lambda entry: entry["score"], reverse=True)
    return results[:10]

from fastapi import APIRouter

from app.schemas.recommendations import (
    CopilotChatRequest,
    PersonalizedRecommendationRequest,
    SearchRequest,
)
from app.services.copilot import generate_copilot_response
from app.services.recommender import score_personalized, semantic_search

router = APIRouter(prefix="/api/v1")


@router.get("/health")
def health() -> dict[str, object]:
    return {
        "success": True,
        "data": {"service": "campus-bandhu-ai", "status": "ok"},
    }


@router.post("/recommendations/personalized")
def personalized_recommendations(payload: PersonalizedRecommendationRequest) -> dict[str, object]:
    ranked = score_personalized(payload.items, payload.interests)
    return {
        "success": True,
        "data": ranked,
        "meta": {"user_id": payload.user_id, "count": len(ranked)},
    }


@router.post("/search/semantic")
def semantic_search_endpoint(payload: SearchRequest) -> dict[str, object]:
    results = semantic_search(payload.items, payload.query)
    return {
        "success": True,
        "data": results,
        "meta": {"count": len(results)},
    }


@router.post("/copilot/chat")
def copilot_chat(payload: CopilotChatRequest) -> dict[str, str]:
    answer = generate_copilot_response(payload.prompt)
    return {"response": answer}

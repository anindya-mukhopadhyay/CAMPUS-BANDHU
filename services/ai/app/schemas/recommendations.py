from typing import Any, Literal

from pydantic import BaseModel, Field


class RecommendationItem(BaseModel):
    id: str
    type: Literal["event", "opportunity", "club"] = "event"
    title: str
    description: str = ""
    tags: list[str] = Field(default_factory=list)


class PersonalizedRecommendationRequest(BaseModel):
    user_id: str
    interests: list[str] = Field(default_factory=list)
    items: list[dict[str, Any]] = Field(default_factory=list)


class SearchRequest(BaseModel):
    query: str
    items: list[dict[str, Any]] = Field(default_factory=list)


class CopilotChatRequest(BaseModel):
    prompt: str

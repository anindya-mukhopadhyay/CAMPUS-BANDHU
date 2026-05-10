from __future__ import annotations

from openai import OpenAI

from app.core.settings import settings


SYSTEM_PROMPT = (
    "You are Campus-Bandhu Copilot, an AI assistant for smart campus ecosystem strategy, "
    "student growth, event planning, and recruiter readiness. Give concise, actionable suggestions."
)


def generate_copilot_response(prompt: str) -> str:
    if not settings.openai_api_key:
        return (
            "OpenAI key is not configured. Suggested quick plan: 1) Join one technical event and one leadership "
            "event this week, 2) publish two campus network posts, 3) mint verified achievements for completed work."
        )

    client = OpenAI(base_url=settings.openai_base_url, api_key=settings.openai_api_key)
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.4
    )

    return response.choices[0].message.content or "No response generated."

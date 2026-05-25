from __future__ import annotations

import re
from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, Field
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

app = FastAPI(title="Sentiment Analysis Service", version="1.0.0")
analyzer = SentimentIntensityAnalyzer()


class AnalyzeRequest(BaseModel):
    text: str = Field(default="", max_length=1000)


class AnalyzeResponse(BaseModel):
    label: Literal["positive", "neutral", "negative"]
    score: float
    compound: float


def normalize_text(text: str) -> str:
    cleaned = re.sub(r"\s+", " ", text or "").strip()
    return cleaned


def label_from_compound(compound: float) -> Literal["positive", "neutral", "negative"]:
    if compound >= 0.05:
        return "positive"
    if compound <= -0.05:
        return "negative"
    return "neutral"


@app.get("/health")
def health():
    return {"status": "ok", "service": "sentiment"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest):
    text = normalize_text(payload.text)

    if not text:
        return AnalyzeResponse(label="neutral", score=0.0, compound=0.0)

    scores = analyzer.polarity_scores(text)
    compound = float(scores["compound"])
    label = label_from_compound(compound)

    return AnalyzeResponse(
        label=label,
        score=round(abs(compound), 4),
        compound=round(compound, 4),
    )

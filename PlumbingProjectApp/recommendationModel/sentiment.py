import torch
from transformers import pipeline

class ReviewSentimentAnalyzer:
    def __init__(self):
        self.pipeline = pipeline(
            "sentiment-analysis",
            model="siebert/sentiment-roberta-large-english",
            device="cpu"
        )

    def score(self, text: str) -> float:
        #returns [0, 1]
        if not text or not text.strip():
            return 0.5

        result = self.pipeline(text[:512])[0]
        label = result["label"]
        confidence = result["score"]

        if label == "POSITIVE":
            return confidence
        else:
            return 1 - confidence

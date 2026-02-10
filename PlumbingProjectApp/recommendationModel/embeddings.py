import numpy as np
from sentence_transformers import SentenceTransformer

class EmbeddingBuilder:
    def __init__(self, model_name="all-mpnet-base-v2"):
        self.model = SentenceTransformer(model_name)

    def embed_texts(self, texts):
        if not texts:
            return None
        return self.model.encode(texts, normalize_embeddings=True)

    def build_book_embeddings(self, books, max_reviews=5):
        book_embeddings = {}

        for book_id, book in books.items():
            reviews = [r for r in book["reviews"] if r["text"]]

            if not reviews:
                continue

            reviews = sorted(
                reviews,
                key=lambda r: (r["stars"] or 3),
                reverse=True
            )[:max_reviews]

            combined_text = " ".join(r["text"] for r in reviews)

            embedding = self.model.encode(
                combined_text,
                normalize_embeddings=True
            )

            book_embeddings[book_id] = embedding

        return book_embeddings

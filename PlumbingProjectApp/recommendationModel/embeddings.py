import numpy as np
from sentence_transformers import SentenceTransformer

class EmbeddingBuilder:
    def __init__(self, model_name="all-mpnet-base-v2"):
        self.model = SentenceTransformer(model_name)

    def embed_texts(self, texts):
        if not texts:
            return None
        return self.model.encode(
            texts,
            normalize_embeddings=True,
            show_progress_bar=False
        )
    def build_book_embeddings(self, books, max_reviews=5):
        book_embeddings = {}

        for book_id, book in books.items():
            reviews = [r for r in book["reviews"] if r["text"]]

            if not reviews:
                continue

            reviews = sorted(
                reviews,
                key=lambda r: (r.get("stars", 3), r.get("sentiment", 0.5)),
                reverse=True
            )[:max_reviews]

            texts = [r["text"] for r in reviews]

            vecs = self.embed_texts(texts)

            centroid = np.mean(vecs, axis=0)

            variance = float(np.mean(
                np.linalg.norm(vecs - centroid, axis=1)
            ))

            book_embeddings[book_id] = {
                "review_vectors": vecs,
                "centroid": centroid,
                "variance": variance
            }

        return book_embeddings

import numpy as np
from sentence_transformers import SentenceTransformer

class EmbeddingBuilder:
    def __init__(self, model_name="all-mpnet-base-v2"):
        self.model = SentenceTransformer(model_name)

    def embed_texts(self, texts):
        if not texts:
            return None
        return self.model.encode(texts, normalize_embeddings=True)

    def build_book_embeddings(self, books):
        book_embeddings = {}

        for book_id, book in books.items():
            review_texts = [r["text"] for r in book["reviews"] if r["text"]]

            if not review_texts:
                continue

            embeddings = self.embed_texts(review_texts)
            book_embeddings[book_id] = np.mean(embeddings, axis=0)

        return book_embeddings

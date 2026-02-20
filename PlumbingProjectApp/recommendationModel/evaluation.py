import numpy as np
from sklearn.metrics import silhouette_score, pairwise_distances
from sklearn.metrics.pairwise import cosine_similarity
import random


class RecommenderEvaluator:
    def __init__(self, recommender, books, book_embeddings):
        self.recommender = recommender
        self.books = books
        self.book_embeddings = book_embeddings

    def _dict_to_vector(self, d, vocabulary):
        return np.array([d.get(term, 0.0) for term in vocabulary])


    def genre_match(self, target, genres):
        return any(target in g for g in genres)

    def synthetic_user_test(self, genre, n_samples=20, k=10):
        genre_books = [
            bid for bid, b in self.books.items()
            if any(genre in g for g in b["genres"])

        ]

        if len(genre_books) < 5:
            return None

        hits = 0
        valid_trials = 0

        for _ in range(n_samples):
            liked = random.sample(genre_books, 3)
            heldout = random.choice(genre_books)

            user_reviews = [{"book_id": bid, "stars": 5} for bid in liked]

            profile = self.recommender.build_user_profile(user_reviews)
            if profile is None:
                continue

            valid_trials += 1

            recs = self.recommender.recommend(
                user_profile=profile,
                user_reviews=user_reviews,
                user_genres=[genre],
                user_grade=8,
                top_k=k
            )

            recommended_ids = [bid for bid, _ in recs]

            if heldout in recommended_ids:
                hits += 1

        if valid_trials == 0:
            return None

        return hits / valid_trials

    def embedding_silhouette(self, min_books_per_genre=10):
        scores = []

        vocab = set()
        for emb in self.book_embeddings.values():
            if isinstance(emb, dict):
                vocab.update(emb.keys())

        vocab = sorted(vocab)

        # group book vectors by genre
        genre_to_vecs = {}

        for bid, emb in self.book_embeddings.items():
            if bid not in self.books:
                continue

            if isinstance(emb, dict):
                vec = emb["centroid"]
            else:
                vec = emb

            for genre in self.books[bid].get("genres", []):
                genre_to_vecs.setdefault(genre, []).append(vec)

        for genre, vecs in genre_to_vecs.items():
            if len(vecs) < min_books_per_genre:
                continue

            other_vecs = [
                v for g, vs in genre_to_vecs.items()
                if g != genre for v in vs
            ]

            if len(other_vecs) < min_books_per_genre:
                continue

            X_all = np.vstack(vecs + other_vecs)
            y_all = [1]*len(vecs) + [0]*len(other_vecs)

            try:
                score = silhouette_score(X_all, y_all)
                scores.append(score)
            except Exception:
                continue

        return float(np.mean(scores)) if scores else None

    def diversity(self, recommendations):
        if len(recommendations) < 2:
            return 0.0

        centroids = []

        for bid, _ in recommendations:
            emb = self.book_embeddings.get(bid)
            if emb is None:
                continue
            centroids.append(emb["centroid"])

        if len(centroids) < 2:
            return 0.0

        vecs = np.vstack(centroids)

        distances = pairwise_distances(vecs, metric="cosine")
        upper = distances[np.triu_indices_from(distances, k=1)]

        return float(np.mean(upper))


    def coverage(self, all_recommendations):
        recommended_ids = set()

        for recs in all_recommendations:
            for bid, _ in recs:
                recommended_ids.add(bid)

        return len(recommended_ids) / len(self.books)

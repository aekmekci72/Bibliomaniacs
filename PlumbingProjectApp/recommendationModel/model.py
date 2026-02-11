import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class HybridRecommender:
    def __init__(self, book_embeddings, books):
        self.book_embeddings = book_embeddings
        self.books = books

    def build_user_profile(self, user_reviews):
        vectors = []
        weights = []

        for r in user_reviews:
            book_id = r["book_id"]
            stars = r.get("stars", 3)

            if book_id not in self.book_embeddings:
                continue

            book = self.books[book_id]

            sentiments = [
                rev.get("sentiment", 0)
                for rev in book["reviews"]
                if rev.get("sentiment") is not None
            ]

            avg_sentiment = np.mean(sentiments) if sentiments else 0

            sentiment_weight = avg_sentiment

            final_weight = stars * sentiment_weight

            vectors.append(self.book_embeddings[book_id])
            weights.append(final_weight)

        if not vectors:
            return None

        vectors = np.vstack(vectors)
        weights = np.array(weights).reshape(-1, 1)

        return np.sum(vectors * weights, axis=0) / np.sum(weights)

    def book_sentiment_score(self, book):
        sentiments = [
            r.get("sentiment")
            for r in book["reviews"]
            if r.get("sentiment") is not None
        ]

        if not sentiments:
            return 0.0

        avg = np.mean(sentiments)

        return avg


    def genre_overlap(self, user_genres, book_genres):
        if not user_genres or not book_genres:
            return 0.0
        return len(set(user_genres) & set(book_genres)) / len(set(user_genres))

    def grade_score(self, user_grade, book):
        grades = []
        for r in book["reviews"]:
            grades.extend(r["recommended_grades"])

        if not grades:
            return 0.5

        avg = sum(grades) / len(grades)
        return max(0, 1 - abs(user_grade - avg) / 6)

    def recommend(self, user_profile, user_genres, user_grade, top_k=10):
        scores = []

        for book_id, book_vec in self.book_embeddings.items():
            book = self.books[book_id]

            sim = cosine_similarity(
                user_profile.reshape(1, -1),
                book_vec.reshape(1, -1)
            )[0][0]

            genre_score = self.genre_overlap(user_genres, book["genres"])
            grade_score = self.grade_score(user_grade, book)

            book_sentiment = self.book_sentiment_score(book)

            # print(book["title"], "sentiment score:", book_sentiment)

            final_score = (
                0.55 * sim +
                0.20 * genre_score +
                0.15 * grade_score +
                0.10 * book_sentiment
            )

            scores.append((book_id, final_score))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]
    def cold_start_recommend(self, user_genres, user_grade, top_k=10):
        scores = []

        for book_id, book in self.books.items():
            genre_score = self.genre_overlap(user_genres, book["genres"])
            grade_score = self.grade_score(user_grade, book)

            final_score = (
                0.7 * genre_score +
                0.3 * grade_score
            )

            scores.append((book_id, final_score))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]

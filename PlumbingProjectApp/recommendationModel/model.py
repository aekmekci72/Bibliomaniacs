# sorry i'll write some of my thoughts here about what approach we should take
# if anybody has other ideas let's see what could be better!

#im thinking:
# stars -> target/weight
# sentiment score of review text -> feature
# review embedding -> feature

#represent the books like
# - genre features tokenized
# - review text embeddings
# - grade suitability

# and we represent users like
# user vector is the weighted average of books they liked based on past reviews
# e.g. star rating, sentiment score, recency(?) as weights
# also include preferred genres
# user grade


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

            if book_id in self.book_embeddings:
                vectors.append(self.book_embeddings[book_id])
                weights.append(stars)

        if not vectors:
            return None

        vectors = np.vstack(vectors)
        weights = np.array(weights).reshape(-1, 1)

        return np.sum(vectors * weights, axis=0) / np.sum(weights)

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

            final_score = (
                0.6 * sim +
                0.25 * genre_score +
                0.15 * grade_score
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

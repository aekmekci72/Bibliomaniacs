from parsing import load_books, load_reviews
from embeddings import EmbeddingBuilder
from model import HybridRecommender

books = load_books("reviewedBooks.csv")
books = load_reviews("bigReviews.csv", books)

embedder = EmbeddingBuilder()
book_embeddings = embedder.build_book_embeddings(books)

print("Books loaded:", len(books))
print("Books with embeddings:", len(book_embeddings))
print(list(book_embeddings.keys())[:10])

recommender = HybridRecommender(book_embeddings, books)

user_reviews = [
    {
        "book_id": "six of crows bardugo leigh",
        "stars": 5
    },
    {
        "book_id": "red queen aveyard victoria",
        "stars": 4
    }
]

user_profile = recommender.build_user_profile(user_reviews)
print("User profile built:", user_profile is not None)

user_genres = ["fantasy", "adventure", "action"]
user_grade = 8

if user_profile is None:
    print("No user profile could be built — falling back to popular / genre-based recommendations.")
    recommendations = recommender.cold_start_recommend(
        user_genres=user_genres,
        user_grade=user_grade
    )
else:
    recommendations = recommender.recommend(
        user_profile=user_profile,
        user_genres=user_genres,
        user_grade=user_grade
    )


for book_id, score in recommendations:
    book = books[book_id]
    print(f"{book['title']} by {book['author']} — score: {score:.3f}")

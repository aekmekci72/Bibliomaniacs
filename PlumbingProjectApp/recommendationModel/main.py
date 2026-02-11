from parsing import load_books, load_reviews
from embeddings import EmbeddingBuilder
from model import HybridRecommender
from evaluation import RecommenderEvaluator

books = load_books("reviewedBooks.csv")
books = load_reviews("bigReviews.csv", books)


all_genres = set()

for book in books.values():
    all_genres.update(book["genres"])

print("Total unique genres:", len(all_genres))
for genre in sorted(all_genres):
    print(genre)

embedder = EmbeddingBuilder()
book_embeddings = embedder.build_book_embeddings(books)

# print("Books loaded:", len(books))
# print("Books with embeddings:", len(book_embeddings))
# print(list(book_embeddings.keys())[:10])

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


evaluator = RecommenderEvaluator(
    recommender=recommender,
    books=books,
    book_embeddings=book_embeddings
)

fantasy_hit_rate = evaluator.synthetic_user_test(
    genre="fantasy",
    n_samples=50,
    k=10
)

s=0
for genre in all_genres:
    score = evaluator.synthetic_user_test(genre)
    if score:
        s+=score
    print(f"{genre} hit rate:", score)

print("average hit rate: "+ (score/len(all_genres)))

silhouette = evaluator.embedding_silhouette()
print("Embedding silhouette score:", silhouette)

div = evaluator.diversity(recommendations)
print("Recommendation diversity:", div)

all_recommendations = []

for _ in range(100):
    recs = recommender.cold_start_recommend(
        user_genres=["fantasy"],
        user_grade=8,
        top_k=10
    )
    all_recommendations.append(recs)

coverage = evaluator.coverage(all_recommendations)
print("Catalog coverage:", coverage)



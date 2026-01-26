import pandas as pd
import re

def tokenize_genres(raw_genre):
    if pd.isna(raw_genre) or not str(raw_genre).strip():
        return []

    raw = raw_genre.lower()

    parts = re.split(r"[,/&]", raw)

    tokens = set()

    for part in parts:
        part = re.sub(r"[^\w\s]", "", part).strip()

        if not part:
            continue

        for token in part.split():
            tokens.add(token)

    return sorted(tokens)

def books_csv_to_dict(csv_path):
    df = pd.read_csv(csv_path)
    df = df[["AUTHOR", "TITLE", "GENRE"]].dropna(subset=["TITLE", "AUTHOR"])

    books = {}

    for _, row in df.iterrows():
        title = str(row["TITLE"]).strip()
        author = str(row["AUTHOR"]).strip()
        genres = tokenize_genres(row["GENRE"])

        books[title] = {
            "author": author,
            "genres": genres
        }

    return books

def reviews_csv_to_dict(csv_path):
    df = pd.read_csv(csv_path)

    df = df.rename(columns={
        "Title of book": "TITLE",
        "Author of book": "AUTHOR",
        "Grade": "GRADE",
        "What grade level would you recommend this book to?": "RECOMMENDED_GRADES",
        "How many stars would you give this book?": "STARS",
        "Submit your review below (200-400 word count)": "REVIEW"
    })

    df = df.dropna(subset=["TITLE", "AUTHOR", "REVIEW"])

    books = {}

    for _, row in df.iterrows():
        title = str(row["TITLE"]).strip()
        author = str(row["AUTHOR"]).strip()

        if title not in books:
            books[title] = {
                "author": author,
                "reviews": []
            }

        review_data = {
            "grade": int(row["GRADE"]) if not pd.isna(row["GRADE"]) else None,
            "recommended_grades": (
                [g.strip() for g in str(row["RECOMMENDED_GRADES"]).split(",")]
                if not pd.isna(row["RECOMMENDED_GRADES"])
                else []
            ),
            "stars": int(row["STARS"]) if not pd.isna(row["STARS"]) else None,
            "review_text": str(row["REVIEW"]).strip()
        }

        books[title]["reviews"].append(review_data)

    return books

def normalize_for_search(text):
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def search_books(reviews_dict, query):
    query_norm = normalize_for_search(query)
    results = {}

    for title, data in reviews_dict.items():
        title_norm = normalize_for_search(title)

        if query_norm in title_norm:
            results[title] = data

    return results

books = books_csv_to_dict("reviewedBooks.csv")
reviews = reviews_csv_to_dict("bigReviews.csv")
book = search_books(reviews, "My Hero Academia")

for title, data in book.items():
    print(f"\n{title} by {data['author']}")
    print("Reviews:", len(data["reviews"]))
    for i, r in enumerate(data["reviews"], 1):
        print(f"\nReview {i}")
        print("Stars:", r["stars"])
        print("Recommended grades:", r["recommended_grades"])
        print(r["review_text"][:300], "...")
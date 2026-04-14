from housedBooks.availability import avail
from housedBooks.modelIncorp import AvailabilityCache
from parsing import load_books

import time

cache = AvailabilityCache()

books = load_books("reviewedBooks.csv")
def update_availability_for_books(book_titles):
    for i, title in enumerate(book_titles):
        try:
            print(f"[{i+1}/{len(book_titles)}] Checking: {title}")

            is_available = avail(title)
            cache.set(title, is_available)

            time.sleep(2)

        except Exception as e:
            print(f"Error with {title}: {e}")

def select_books_to_update(books):
    titles = [b["title"] for b in books.values()]

    return titles[:500]   # start with 500/day

if __name__ == "__main__":
    selected_titles = select_books_to_update(books)
    update_availability_for_books(selected_titles)
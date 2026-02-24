# some things i realized
# scraping availability into core preference model is probably not the best idea and it should be more of a contextual, dynamic re-ranking layer on top of recommendations
# basically not a preference signal, but a context constraint
# architecturally:
# rec model -> candidate list -> availability re-ranker -> final output
import redis
import json
from typing import List, Tuple
from housedBooks.availability import avail

class AvailabilityCache:
    def __init__(self, redis_host="localhost", redis_port=6379, ttl_seconds=36000):
        self.redis = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)
        self.ttl = ttl_seconds

    def _key(self, title: str) -> str:
        return f"availability:{title.lower()}"

    def get(self, title: str):
        value = self.redis.get(self._key(title))
        if value is None:
            return None
        return value == "1"

    def set(self, title: str, value: bool):
        self.redis.setex(
            self._key(title),
            self.ttl,
            "1" if value else "0"
        )


class AvailabilityService:
    def __init__(self, cache: AvailabilityCache):
        self.cache = cache

    def check(self, title: str) -> bool:
        cached = self.cache.get(title)
        if cached is not None:
            print(f"CACHED: Title {title} is {cached} for availability")
            return cached

        is_available = avail(title)
        print(f"Title {title} is {is_available} for availability")
        self.cache.set(title, is_available)
        return is_available

    def check_bulk(self, titles: List[str]) -> dict:
        results = {}

        for title in titles:
            results[title] = self.check(title)

        return results


class ContextAwareRecommender:
    def __init__(self, base_recommender, books, availability_service, initial_pool=50, expansion_step=50, max_pool=300):
        self.base = base_recommender
        self.books = books
        self.availability_service = availability_service

        self.initial_pool = initial_pool
        self.expansion_step = expansion_step
        self.max_pool = max_pool

    def _get_candidates(self, user_profile, user_reviews, user_genres, user_grade, pool_size):
        if user_profile is None:
            return self.base.cold_start_recommend(
                user_genres=user_genres,
                user_grade=user_grade,
                top_k=pool_size
            )
        else:
            return self.base.recommend(
                user_profile=user_profile,
                user_reviews=user_reviews,
                user_genres=user_genres,
                user_grade=user_grade,
                top_k=pool_size
            )

    def recommend(self, user_profile, user_reviews, user_genres, user_grade, top_k=10) -> List[Tuple[str, float]]:
        pool_size = self.initial_pool

        while pool_size <= self.max_pool:
            candidates = self._get_candidates(user_profile, user_reviews, user_genres, user_grade, pool_size)

            titles = [self.books[bid]["title"] for bid, _ in candidates]

            availability_map = self.availability_service.check_bulk(titles)

            available = []
            unavailable = []

            for (book_id, score), title in zip(candidates, titles):
                if availability_map.get(title):
                    available.append((book_id, score))
                else:
                    unavailable.append((book_id, score))
            
            if len(available) >= top_k:
                break

            pool_size += self.expansion_step

        available.sort(key=lambda x: x[1], reverse=True)
        unavailable.sort(key=lambda x: x[1], reverse=True)
        final = available + unavailable
        
        return final[:top_k]
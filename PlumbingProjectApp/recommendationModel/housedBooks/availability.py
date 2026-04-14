import urllib.parse
import time
import re
from difflib import SequenceMatcher
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

SEARCH_BASE = "https://rgwd.search.bccls.org/search"
MATCH_THRESHOLD = 0.85

STOPWORDS = {"the", "a", "an", "in", "on", "of", "and"}

def normalize_title(title: str) -> str:
    title = title.lower()

    #  punctuation
    title = re.sub(r"[^\w\s]", "", title)

    # whitespace
    title = re.sub(r"\s+", " ", title).strip()

    # weak words
    words = title.split()
    words = [w for w in words if w not in STOPWORDS]

    return " ".join(words)


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()

class LibraryAvailabilityChecker:
    def __init__(self):
        chrome_options = Options()
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--blink-settings=imagesEnabled=false")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument(
            "user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option("useAutomationExtension", False)

        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.execute_script(
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
        )
        self.wait = WebDriverWait(self.driver, 10)

    def _build_url(self, title: str) -> str:
        encoded = urllib.parse.quote(title)
        return (
            f"{SEARCH_BASE}"
            "?universalLimiterIds=at_library"
            "&materialTypeIds=1"
            "&locationIds=119"
            f"&query={encoded}"
            "&searchType=everything"
            "&pageSize=10"
            "&mode=advanced"
        )

    def accept_cookies(self):
        try:
            accept_button = self.wait.until(
                EC.element_to_be_clickable(
                    (By.CSS_SELECTOR, "#onetrust-close-btn-container > button")
                )
            )
            accept_button.click()
            print("Accepted cookies.")
        except:
            print("No cookie popup found or already accepted.")

    def availability(self, title: str) -> bool:
        try:
            url = self._build_url(title)
            print("\nSearching:", url)

            self.driver.get(url)
            self.accept_cookies()

            self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div.card.py-4.px-4"))
            )

            cards = self.driver.find_elements(By.CSS_SELECTOR, "div.card.py-4.px-4")
            print(f"Found {len(cards)} book cards")

            norm_query = normalize_title(title)

            best_score = 0
            best_match = None

            for card in cards:
                try:
                    link = card.find_element(
                        By.CSS_SELECTOR, "h2.card-title a.notranslate"
                    )
                    card_title = link.text.strip()

                    if not card_title:
                        continue

                    norm_card = normalize_title(card_title)

                    score = similarity(norm_query, norm_card)

                    print(f"\nComparing:")
                    print(f"  Query: {norm_query}")
                    print(f"  Card : {norm_card}")
                    print(f"  Score: {score:.3f}")

                    if score > best_score:
                        best_score = score
                        best_match = card_title

                except Exception as e:
                    print("Error reading card:", e)
                    continue

            if best_score >= MATCH_THRESHOLD:
                print(f"\nMatch found: '{best_match}' (score={best_score:.3f})")
                return True
            else:
                print(f"\nNo good match (best score={best_score:.3f})")
                return False

        except Exception as e:
            print("Error:", e)
            return False

    def close(self):
        self.driver.quit()

_checker = LibraryAvailabilityChecker()

def avail(title: str) -> bool:
    return _checker.availability(title)
import urllib.parse
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

SEARCH_BASE = "https://rgwd.search.bccls.org/search"

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
                EC.element_to_be_clickable((By.CSS_SELECTOR, "#onetrust-close-btn-container > button"))
            )
            accept_button.click()
            print("Accepted cookies.")
            time.sleep(1)
        except:
            print("No cookie popup found or already accepted.")

    def availability(self, title: str) -> bool:
        url = self._build_url(title)
        print("Searching:", url)
        self.driver.get(url)
        self.accept_cookies()

        self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "div.card.py-4.px-4")))
        cards = self.driver.find_elements(By.CSS_SELECTOR, "div.card.py-4.px-4")
        print(f"Found {len(cards)} book cards")

        for card in cards:
            try:
                link = card.find_element(By.CSS_SELECTOR, "h2.card-title a.notranslate")
                card_title = link.text.strip()
                print("Card title:", card_title)
                if card_title.lower() == title.lower():
                    print("Exact title match found!")
                    return True
            except Exception as e:
                print("Error reading card:", e)
                continue

        print("No exact title match found")
        return False


    def close(self):
        self.driver.quit()


_checker = LibraryAvailabilityChecker()

def avail(title: str) -> bool:
    return _checker.availability(title)


print(avail("Harry Potter and the Sorcerer's Stone"))
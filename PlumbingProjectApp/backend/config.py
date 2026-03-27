import os
from dotenv import load_dotenv

load_dotenv()

ADMIN_EMAILS = [
    email.strip()
    for email in os.getenv("ADMIN_EMAILS", "").split(",")
    if email.strip()
]
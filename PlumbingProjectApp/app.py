from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, auth, firestore
from flask_cors import CORS
import asyncio
from modelsetup import chat
from cache import get_cache, set_cache, make_prompt_key
from config import ADMIN_EMAILS
from fireo import connection
from fireo.models import Model
from fireo.fields import TextField, IDField


app = Flask(__name__)
CORS(app)

cred = credentials.Certificate("serviceKey.json")
firebase_admin.initialize_app(cred)
connection(from_file="serviceKey.json")
db = firestore.client()

class Book(Model):
    id = IDField()
    title = TextField()
    added_by = TextField()


def verify_firebase_token(id_token):
    """Verify Firebase ID token"""
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception:
        return None

def get_user_role(uid, email=None):
    user_ref = db.collection("users").document(uid)
    doc = user_ref.get()

    # If user exists but should be admin → upgrade them
    if doc.exists:
        data = doc.to_dict()
        if email in ADMIN_EMAILS and data.get("role") != "admin":
            user_ref.update({"role": "admin"})
            print("DEBUG: Upgraded user to admin")
            return "admin"
        return data.get("role", "user")

    # If new user → assign role
    role = "admin" if email in ADMIN_EMAILS else "user"
    user_ref.set({"email": email, "role": role})
    print("DEBUG: New user assigned role:", role)
    return role

@app.route("/verify_token", methods=["POST"])
def verify_token():
    data = request.json
    id_token = data.get("idToken")
    if not id_token:
        return jsonify({"error": "Missing ID token"}), 401

    decoded_token = verify_firebase_token(id_token)
    if not decoded_token:
        return jsonify({"error": "Invalid or expired ID token"}), 401

    uid = decoded_token["uid"]
    email = decoded_token.get("email")
    role = get_user_role(uid, email)
    return jsonify({"uid": uid, "email": email, "role": role}), 200

@app.route("/add_book", methods=["POST"])
def add_book():
    data = request.json
    id_token = data.get("idToken")
    title = data.get("title")

    if not id_token:
        return jsonify({"error": "Missing ID token"}), 401

    decoded_token = verify_firebase_token(id_token)
    if not decoded_token:
        return jsonify({"error": "Invalid ID token"}), 401

    uid = decoded_token["uid"]
    email = decoded_token.get("email")
    role = get_user_role(uid, email)
    print(f"User {email} has role {role}")

    if role != "admin":
        return jsonify({"error": "Permission denied"}), 403

    if not title:
        return jsonify({"error": "Missing title"}), 400

    book = Book(title=title, added_by=uid)
    saved_book = book.save()
    
    set_cache("books", None, ttl=1)
    return jsonify({"message": "Book added", "id": saved_book.id}), 200

@app.route("/get_books", methods=["GET"])
def get_books():
    cached_books = get_cache("books")
    if cached_books:
        return jsonify(cached_books), 200

    books_query = Book.collection.fetch()

    books = []
    for b in books_query:
        books.append({
            "id": b.id,
            "title": b.title,
            "added_by": b.added_by,
        })

    set_cache("books", books, ttl=3600)
    return jsonify(books), 200

@app.route("/ask_question", methods=["POST"])
def ask_question():
    data = request.json
    question = data.get("question")
    if not question:
        return jsonify({"error": "Missing 'question' field"}), 400

    cache_key = make_prompt_key(question)
    cached_response = get_cache(cache_key)
    if cached_response:
        return jsonify({"response": cached_response}), 200

    try:
        response = asyncio.run(chat(question))
        set_cache(cache_key, response, ttl=3600)
        return jsonify({"response": response}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)

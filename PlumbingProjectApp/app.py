from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, auth, firestore
from flask_cors import CORS
import asyncio
from modelsetup import chat
from cache import get_cache, set_cache, make_prompt_key

app = Flask(__name__)
CORS(app)

cred = credentials.Certificate("serviceKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()


def verify_firebase_token(id_token):
    """Verify the Firebase ID token from the frontend"""
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        return None


def get_user_role(uid):
    """Fetch the user's role from Firestore (default: 'user')"""
    user_ref = db.collection("users").document(uid)
    doc = user_ref.get()
    if doc.exists:
        return doc.to_dict().get("role", "user")
    return "user"


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

    user_ref = db.collection("users").document(uid)
    if not user_ref.get().exists:
        user_ref.set({"email": email, "role": "user"})

    role = get_user_role(uid)
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
    role = get_user_role(uid)

    if role != "admin":
        return jsonify({"error": "Permission denied"}), 403

    if not title:
        return jsonify({"error": "Missing title"}), 400

    doc_ref = db.collection("books").document()
    doc_ref.set({"title": title, "added_by": uid})

    set_cache("books", None, ttl=1)
    return jsonify({"message": "Book added", "id": doc_ref.id}), 200


@app.route("/get_books", methods=["GET"])
def get_books():
    cached_books = get_cache("books")
    if cached_books:
        return jsonify(cached_books), 200
    
    books_ref = db.collection("books")
    docs = books_ref.stream()
    books = [{**doc.to_dict(), "id": doc.id} for doc in docs]

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
    app.run(debug=True)

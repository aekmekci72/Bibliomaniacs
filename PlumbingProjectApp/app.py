from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, auth, firestore
from flask_cors import CORS

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
    return jsonify({"message": "Book added", "id": doc_ref.id}), 200


@app.route("/get_books", methods=["GET"])
def get_books():
    books_ref = db.collection("books")
    docs = books_ref.stream()
    books = [{**doc.to_dict(), "id": doc.id} for doc in docs]
    return jsonify(books), 200


if __name__ == "__main__":
    app.run(debug=True)

from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore
from flask_cors import CORS
import asyncio
from modelsetup import chat

app = Flask(__name__)
CORS(app)

cred = credentials.Certificate("serviceKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

@app.route("/add_book", methods=["POST"])
def add_book():
    data = request.json
    title = data.get("title")
    
    if not title:
        return jsonify({"error": "Missing fields"}), 400
    
    doc_ref = db.collection("books").document()
    doc_ref.set({"title": title})
    return jsonify({"message": "Book added", "id": doc_ref.id}), 200

@app.route("/get_books", methods=["GET"])
def get_books():
    books_ref = db.collection("books")
    docs = books_ref.stream()
    books = [{**doc.to_dict(), "id": doc.id} for doc in docs]
    return jsonify(books), 200

@app.route("/ask_question", methods=["POST"])
def ask_question():
    data = request.json
    question = data.get("question")

    if not question:
        return jsonify({"error": "Missing 'question' field"}), 400

    try:
        response = asyncio.run(chat(question))
        return jsonify({"response": response}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)

from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, auth, firestore
from flask_cors import CORS
import asyncio
from datetime import datetime
import hashlib
from modelsetup import chat
from cache import get_cache, set_cache, make_prompt_key
from config import ADMIN_EMAILS
from fireo import connection
from fireo.models import Model
from fireo.fields import TextField, IDField
from review_model import Review, create_review, process_review, calculate_user_hours


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
    
@app.route("/get_user_role", methods=["POST"])
def get_user_role_route():
    data = request.json
    id_token = data.get("idToken")

    if not id_token:
        return jsonify({"error": "Missing ID token"}), 401

    decoded = auth.verify_id_token(id_token)
    uid = decoded["uid"]
    email = decoded.get("email")

    role = get_user_role(uid, email)

    return role, 200


def get_user_role(uid, email=None):
    user_ref = db.collection("users").document(uid)
    doc = user_ref.get()

    if doc.exists:
        data = doc.to_dict()
        if email in ADMIN_EMAILS and data.get("role") != "admin":
            user_ref.update({"role": "admin"})
            print("DEBUG: Upgraded user to admin")
            return "admin"
        return data.get("role", "user")

    role = "admin" if email in ADMIN_EMAILS else "user"
    user_ref.set({"email": email, "role": role})
    print("DEBUG: New user assigned role:", role)
    print(role)
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
    

@app.route("/submit_review", methods=["POST"])
def submit_review():
    data = request.json
    id_token = data.get("idToken")
    
    if not id_token:
        return jsonify({"error": "Missing ID token"}), 401
    
    decoded_token = verify_firebase_token(id_token)
    if not decoded_token:
        return jsonify({"error": "Invalid ID token"}), 401
    
    required = ["first_name", "last_name", "email", "book_title", 
                "author", "rating", "review", "grade"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    entry_id = f"{int(datetime.now().timestamp())}_{hashlib.md5(data['email'].encode()).hexdigest()[:8]}"
    data['entry_id'] = entry_id
    
    try:
        review = create_review(data)
        
        set_cache("all_reviews", None, ttl=1)
        
        return jsonify({
            "message": "Review submitted successfully",
            "id": review.id,
            "entry_id": entry_id
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/bulk_import_reviews", methods=["POST"])
def bulk_import_reviews():
    data = request.json
    id_token = data.get("idToken")
    reviews_data = data.get("reviews", [])
    
    if not id_token:
        return jsonify({"error": "Missing ID token"}), 401
    
    decoded_token = verify_firebase_token(id_token)
    if not decoded_token:
        return jsonify({"error": "Invalid ID token"}), 401
    
    uid = decoded_token["uid"]
    email = decoded_token.get("email")
    role = get_user_role(uid, email)
    
    if role != "admin":
        return jsonify({"error": "Permission denied - Admin access required"}), 403
    
    if not reviews_data:
        return jsonify({"error": "No reviews provided"}), 400
    
    successful_imports = []
    failed_imports = []
    
    for idx, review_data in enumerate(reviews_data):
        try:
            if 'date_received' in review_data:
                review_data['date_received'] = datetime.fromisoformat(review_data['date_received'])
            else:
                review_data['date_received'] = datetime.now()
            
            if 'date_processed' in review_data and review_data['date_processed']:
                review_data['date_processed'] = datetime.fromisoformat(review_data['date_processed'])
            
            if 'anonymous' in review_data:
                if isinstance(review_data['anonymous'], bool):
                    review_data['anonymous'] = 'yes' if review_data['anonymous'] else 'first name only'
            
            if 'entry_id' not in review_data or not review_data['entry_id']:
                email_hash = hashlib.md5(review_data.get('email', 'unknown').encode()).hexdigest()[:8]
                review_data['entry_id'] = f"{int(review_data['date_received'].timestamp())}_{email_hash}"
            
            review_data.setdefault('approved', True)
            review_data.setdefault('time_earned', 0.5)
            review_data.setdefault('added_to_reviewed_book_list', False)
            review_data.setdefault('on_volgistics', False)
            review_data.setdefault('label_created', False)
            review_data.setdefault('label_applied', False)
            review_data.setdefault('sent_confirmation_email', False)
            
            review = Review()
            for key, value in review_data.items():
                if hasattr(review, key) and value is not None:
                    setattr(review, key, value)
            
            saved_review = review.save()
            
            if review_data.get('email') and review_data.get('approved'):
                calculate_user_hours(review_data['email'])
            
            successful_imports.append({
                "index": idx,
                "id": saved_review.id,
                "entry_id": review_data['entry_id'],
                "book_title": review_data.get('book_title', 'N/A')
            })
            
        except Exception as e:
            failed_imports.append({
                "index": idx,
                "error": str(e),
                "data": review_data
            })
    
    # Clear cache
    set_cache("all_reviews", None, ttl=1)
    
    return jsonify({
        "message": f"Imported {len(successful_imports)} reviews successfully",
        "successful": successful_imports,
        "failed": failed_imports,
        "total_attempted": len(reviews_data)
    }), 201 if not failed_imports else 207


@app.route("/get_reviews", methods=["GET"])
def get_reviews():
    # cache_key = f"reviews_{request.args.to_dict()}"
    # cached = get_cache(cache_key)
    # if cached:
    #     return jsonify(cached), 200
    
    status = request.args.get("status")
    grade = request.args.get("grade", type=int)
    school = request.args.get("school")
    search = request.args.get("search")
    sort_by = request.args.get("sort_by", "date_received")
    sort_order = request.args.get("sort_order", "desc")
    
    query = Review.collection
    
    if status == "approved":
        query = query.filter('approved', '==', True)
    elif status == "pending":
        query = query.filter('approved', '==', False).filter('date_processed', '==', None)
    elif status == "rejected":
        query = query.filter('approved', '==', False)
    
    if grade is not None:
        query = query.filter('grade', '==', grade)
    
    if school:
        query = query.filter('school', '==', school)
    
    reviews = list(query.fetch())
    
    results = []
    for r in reviews:
        review_dict = {
            "id": r.id,
            "entry_id": r.entry_id,
            "date_received": r.date_received.isoformat() if r.date_received else None,
            "date_processed": r.date_processed.isoformat() if r.date_processed else None,
            "first_name": r.first_name,
            "last_name": r.last_name,
            "grade": r.grade,
            "school": r.school,
            "email": r.email,
            "phone_number": r.phone_number,
            "book_title": r.book_title,
            "author": r.author,
            "recommended_audience_grade": r.recommended_audience_grade,
            "rating": r.rating,
            "review": r.review,
            "anonymous": r.anonymous,
            "approved": r.approved,
            "added_to_reviewed_book_list": r.added_to_reviewed_book_list,
            "time_earned": r.time_earned,
            "total_hours": r.total_hours,
            "on_volgistics": r.on_volgistics,
            "call_number": r.call_number,
            "qr_code": r.qr_code,
            "label_created": r.label_created,
            "label_applied": r.label_applied,
            "sent_confirmation_email": r.sent_confirmation_email,
            "form_url": r.form_url,
            "notes_to_admin": r.notes_to_admin,
            "comment_to_user": r.comment_to_user,
        }
        
        if search:
            search_lower = search.lower()
            if (search_lower in r.book_title.lower() or 
                search_lower in r.author.lower() or
                search_lower in f"{r.first_name} {r.last_name}".lower()):
                results.append(review_dict)
        else:
            results.append(review_dict)
    
    reverse = sort_order == "desc"
    if sort_by == "date_received":
        results.sort(key=lambda x: x.get("date_received") or "", reverse=reverse)
    elif sort_by == "rating":
        results.sort(key=lambda x: x.get("rating") or 0, reverse=reverse)
    elif sort_by == "book_title":
        results.sort(key=lambda x: x.get("book_title") or "", reverse=reverse)
    
    # set_cache(cache_key, results, ttl=300)
    
    return jsonify(results), 200


@app.route("/update_review/<review_id>", methods=["PUT"])
def update_review(review_id):
    """Update review details (admin only)"""
    data = request.json
    id_token = data.get("idToken")
    
    if not id_token:
        return jsonify({"error": "Missing ID token"}), 401
    
    decoded_token = verify_firebase_token(id_token)
    if not decoded_token:
        return jsonify({"error": "Invalid ID token"}), 401
    
    uid = decoded_token["uid"]
    email = decoded_token.get("email")
    role = get_user_role(uid, email)
    
    if role != "admin":
        return jsonify({"error": "Permission denied"}), 403
    
    try:
        review = Review.collection.get(review_id)
        
        allowed_fields = [
            "approved", "comment_to_user", "notes_to_admin",
            "added_to_reviewed_book_list", "call_number", "qr_code",
            "label_created", "label_applied", "sent_confirmation_email",
            "on_volgistics", "recommended_audience_grade"
        ]
        
        for field in allowed_fields:
            if field in data:
                setattr(review, field, data[field])
        
        if "approved" in data:
            review.date_processed = datetime.now()
            
            calculate_user_hours(review.email)
        
        review.update()
        
        set_cache("all_reviews", None, ttl=1)
        
        return jsonify({"message": "Review updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/get_user_reviews", methods=["POST"])
def get_user_reviews():
    data = request.json
    id_token = data.get("idToken")
    
    if not id_token:
        return jsonify({"error": "Missing ID token"}), 401
    
    decoded_token = verify_firebase_token(id_token)
    if not decoded_token:
        return jsonify({"error": "Invalid ID token"}), 401
    
    email = decoded_token.get("email")
    
    try:
        reviews = Review.collection.filter('email', '==', email).fetch()
        
        results = []
        for r in reviews:
            results.append({
                "id": r.id,
                "book_title": r.book_title,
                "author": r.author,
                "review": r.review,
                "rating": r.rating,
                "status": "Approved" if r.approved else ("Rejected" if r.date_processed else "Pending"),
                "date_received": r.date_received.isoformat() if r.date_received else None,
                "comment_to_user": r.comment_to_user,
                "time_earned": r.time_earned if r.approved else 0,
            })
        
        total_hours = sum(r["time_earned"] for r in results)
        
        return jsonify({
            "reviews": results,
            "total_hours": total_hours
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/get_review_stats", methods=["GET"])
def get_review_stats():
    cache_key = "review_stats"
    cached = get_cache(cache_key)
    if cached:
        return jsonify(cached), 200
    
    try:
        all_reviews = list(Review.collection.fetch())
        
        stats = {
            "total_reviews": len(all_reviews),
            "approved_reviews": len([r for r in all_reviews if r.approved]),
            "pending_reviews": len([r for r in all_reviews if not r.approved and not r.date_processed]),
            "rejected_reviews": len([r for r in all_reviews if not r.approved and r.date_processed]),
            "total_volunteer_hours": sum(r.time_earned for r in all_reviews if r.approved),
            "unique_reviewers": len(set(r.email for r in all_reviews)),
            "books_reviewed": len(set(r.book_title for r in all_reviews)),
            "average_rating": sum(r.rating for r in all_reviews) / len(all_reviews) if all_reviews else 0,
        }
        
        set_cache(cache_key, stats, ttl=300)
        
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/clear_cache", methods=["POST"])
def clear_cache():
    """Clear all review caches"""
    set_cache("all_reviews", None, ttl=1)
    import re
    return jsonify({"message": "Cache cleared"}), 200

if __name__ == "__main__":
    app.run(debug=True, port=5001)
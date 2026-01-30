"""
Script to initialize admin emails in Firestore
Run this once to migrate from hardcoded ADMIN_EMAILS to database
"""

import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("../serviceKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def initialize_admins():
    
    initial_admins = [
        "shreeja.das.16@gmail.com"
    ]
    
    try:
        db.collection("settings").document("admins").set({
            "emails": initial_admins
        })
        
        print("✅ Successfully initialized admin emails in Firestore:")
        for email in initial_admins:
            print(f"   - {email}")
        
        for email in initial_admins:
            users = db.collection("users").where("email", "==", email).get()
            for user in users:
                db.collection("users").document(user.id).update({"role": "admin"})
                print(f"✅ Updated role for existing user: {email}")
        
        print("\n✅ Admin initialization complete!")
        print("You can now remove ADMIN_EMAILS from your .env file")
        
    except Exception as e:
        print(f"❌ Error initializing admins: {e}")

def initialize_book_of_week():
    """Initialize book of the week (optional)"""
    
    try:
        book_doc = db.collection("settings").document("book_of_week").get()
        
        if not book_doc.exists:
            db.collection("settings").document("book_of_week").set({
                "title": "The Great Gatsby",
                "author": "F. Scott Fitzgerald",
                "lastUpdated": firestore.SERVER_TIMESTAMP
            })
            print("\n✅ Initialized default Book of the Week")
        else:
            print("\n✅ Book of the Week already exists")
            
    except Exception as e:
        print(f"❌ Error initializing book of week: {e}")

if __name__ == "__main__":
    print("Initializing admin settings in Firestore...\n")
    initialize_admins()
    initialize_book_of_week()
    print("\n✅ Setup complete!")
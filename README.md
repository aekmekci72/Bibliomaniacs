# Plumbing-Project

## Tech Stack

React Native (runs on iOS and Android + same codebase can be used for web app)

Expo: framework used to test and view the application

Tailwind CSS

Server: Python Flask
The React Native for web frontend communicates with the Flask backend through API calls using Axios. Flask exposes endpoints that the frontend can request to retrieve or send data in formats like JSON.
Firebase Auth
FireAuth for verifying federated identity providers (Google, Twitter, etc); hesitant about use with username/password (need more details)
FireORM
Firebase database → Cloud Firestore
Flexible, scalable
NOSQL DB
Realtime data synchronization also across multiple devices (ideal for if we move forward in making a complimentary mobile app alongside our website)
Vercel (deployment with SSL/TLS encryption)
Maybe firebase hosting?????
LLM to use: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2 
This is ideal because as a text-based model that is offered for free by HuggingFace under the MIT license with no rate or token limit
Exporting & Importing Process
We want to have 2 views to possibly export/import: reviews per person or reviews per books
React libraries: DataTable, CSVLink
Python libraries: csv, StringIO

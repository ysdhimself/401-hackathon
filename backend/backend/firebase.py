import os
import firebase_admin
from firebase_admin import credentials

path = os.environ.get("FIREBASE_SERVICE_ACCOUNT_PATH", "")

if path and not firebase_admin._apps:
    cred = credentials.Certificate(path)
    firebase_admin.initialize_app(cred)

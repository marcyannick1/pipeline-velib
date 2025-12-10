#!/usr/bin/env python3
"""
Script pour charger les dernières données HDFS dans MongoDB
Pour permettre la connexion Power BI
"""

import json
from hdfs import InsecureClient
from pymongo import MongoClient
import os

# Configuration
HDFS_URL = os.getenv("HDFS_URL", "http://namenode:9870")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongodb:27017/velibdb")
HDFS_DIR = "/velib/raw/"

# Connexions
hdfs = InsecureClient(HDFS_URL, user="root")
mongo = MongoClient(MONGO_URI)
db = mongo["velibdb"]
collection = db["stations_realtime"]

print("🔄 Chargement des données HDFS → MongoDB...")

# Lister les fichiers HDFS
files = hdfs.list(HDFS_DIR)
if not files:
    print("❌ Aucun fichier trouvé dans HDFS")
    exit(1)

# Prendre le dernier fichier
latest_file = sorted(files)[-1]
file_path = f"{HDFS_DIR}{latest_file}"

print(f"📂 Lecture du fichier : {file_path}")

# Lire les données
with hdfs.read(file_path, encoding='utf-8') as reader:
    data = json.load(reader)

print(f"📊 {len(data)} stations trouvées")

# Vider la collection et insérer les nouvelles données
collection.delete_many({})
collection.insert_many(data)

print(f"✅ {len(data)} stations insérées dans MongoDB (collection: stations_realtime)")
print("🎉 Vous pouvez maintenant connecter Power BI !")

# 🚲 Vélib Big Data Pipeline — Streaming & Batch

## 📌 Présentation du projet

Ce projet implémente un **pipeline Big Data complet** pour l’analyse des données **Vélib’ (Île-de-France)** en **temps réel (Streaming)** et en **historique (Batch)**.

Il couvre l’ensemble de la chaîne de valeur :
- Ingestion des données depuis l’API Open Data Vélib
- Stockage distribué avec **HDFS**
- Traitement Big Data avec **Apache Spark**
- Calcul de **KPI temps réel et batch**
- Stockage analytique dans **MongoDB**
- Exposition via une **API Backend**
- Visualisation via **Frontend Web** et **Power BI**

---

## 🧱 Architecture globale

```
API Vélib (OpenData)
        ↓
Ingestion Python (Docker)
        ↓
        HDFS
 ┌──────────────────────┐
 │ /velib/raw           │  ← JSON bruts
 │ /velib/staging       │  ← Parquet nettoyé
 └──────────────────────┘
        ↓
     Apache Spark
  ├─ spark_staging_velib.py
  ├─ spark_kpi_batch.py
  └─ spark_kpi_streaming.py
        ↓
      MongoDB
        ↓
 Backend API (Node.js)
        ↓
 Frontend Web (Vite)
        ↓
     Power BI
```

---

## 📁 Structure du projet

```
.
├── docker-compose.yml
├── .env
├── README.md
│
├── ingestion/
│   ├── script/
│   │   └── fetch_velib_api.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
├── spark/
│   ├── spark_staging_velib.py
│   ├── spark_kpi_batch.py
│   └── spark_kpi_streaming.py
│
├── back/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── utils/
│   ├── server.js
│   ├── Dockerfile
│   └── README.md
│
├── front/
│   ├── src/
│   ├── public/
│   ├── vite.config.js
│   ├── Dockerfile
│   └── README.md
│
├── powerbi/
│   ├── analysis.pbix
│   ├── API_ENDPOINTS_KPI.md
│   └── GUIDE_POWERBI_API.md
```

---

## 🧩 Technologies utilisées

| Composant | Technologie |
|---------|-------------|
| Ingestion | Python, Requests |
| Stockage | HDFS |
| Traitement | Apache Spark (Batch & Streaming) |
| Base analytique | MongoDB |
| Backend API | Node.js / Express |
| Frontend | Vite / JavaScript |
| BI | Power BI |
| Orchestration | Docker / Docker Compose |

---

## 🔄 Pipeline de données

### 1️⃣ Ingestion (temps réel)
- Script Python exécuté dans un conteneur Docker
- Appel de l’API Vélib toutes les X secondes
- Stockage direct dans **HDFS `/velib/raw/`**

### 2️⃣ Staging (Spark)
- Nettoyage des données
- Typage des colonnes
- Conversion JSON → Parquet
- Sortie : **`/velib/staging/`**

### 3️⃣ KPI Batch (Spark)
- Analyses historiques
- Agrégations journalières et horaires
- Résultats stockés dans :
  - MongoDB `velib_kpi_batch`

### 4️⃣ KPI Streaming (Spark Structured Streaming)
- Calcul temps réel :
  - Totaux globaux
  - Stations pleines / vides / cassées
  - Top 10 stations
- Résultats stockés dans :
  - MongoDB `velib_kpi_streaming`

---

## 📊 KPI calculés

### 🔴 Temps réel
- Nombre total de vélos disponibles
- Vélos mécaniques / électriques
- Places libres
- Taux d’occupation global
- Top 10 stations pleines
- Top 10 stations vides
- Top 10 stations électriques
- Stations fermées
- Stations en panne
- Stations saturées
- Stations vides

### 🟦 Batch (historique)
- Disponibilité moyenne horaire
- Taux d’occupation horaire
- Disponibilité moyenne par arrondissement
- Taux d’occupation moyen par arrondissement
- Arrondissements saturés / vides
- Taux d’occupation journalier (min / max / avg)

---

## 🚀 Lancement du projet

### Prérequis
- Docker
- Docker Compose

### Démarrage complet
```bash
docker-compose up -d
```

### 🔄 Streaming (automatique)

Le **traitement Streaming Spark** (KPI temps réel) se lance **automatiquement au démarrage des conteneurs Docker**.  
Aucune action manuelle n’est requise pour le streaming.

### 🟦 Batch (lancement manuel)

Les traitements **Batch Spark** doivent être lancés manuellement avec les commandes suivantes.

#### 1️⃣ Génération du STAGING (nettoyage des données)
```bash
docker exec -it spark-master /spark/bin/spark-submit \
  --master spark://spark-master:7077 \
  /opt/spark-apps/spark_staging_velib.py
```

#### 2️⃣ Calcul des KPI Batch
```bash
docker exec -it spark-master /spark/bin/spark-submit \
  --master spark://spark-master:7077 \
  --packages org.mongodb.spark:mongo-spark-connector_2.12:10.5.0 \
  /opt/spark-apps/spark_kpi_batch.py
```

Ces traitements alimentent :
- HDFS (`/velib/staging`)
- MongoDB (`velib_kpi_batch`)

### Vérification
- HDFS UI → http://localhost:9870
- Spark UI → http://localhost:8080
- MongoDB → port 27017

---

## 📈 Visualisation

- **Frontend Web** : cartes et tableaux temps réel
- **Power BI** :
  - Connexion à l’API Backend
  - Dashboards dynamiques
  - Analyses historiques

---

## 🎓 Objectifs pédagogiques

- Comprendre une architecture Big Data complète
- Maîtriser Spark Batch & Streaming
- Travailler avec HDFS
- Construire des KPI temps réel
- Intégrer Big Data + BI

---

## 👤 Auteurs

Projet réalisé par :

- **Yannick Coulibaly**
- **Jokast Kassa**
- **Rufus Mouakassa**
- **Serge Donou**

Master Data & IA — IPSSI

---

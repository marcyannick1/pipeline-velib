# 📦 LIVRAISON - MODIFICATIONS SERGE

## 📅 Date: 12 décembre 2025

## 🎯 Objectif

Intégration des modifications de la branche `jokast-dev` avec adaptation des endpoints backend pour Power BI.

---

## ✅ Modifications Effectuées

### **1. Backend - API REST** 🔧

- **Fichiers modifiés**:

  - `back/controllers/statsController.js` → Adaptation de l'endpoint `/api/stats/arrondissement`
  - `back/routes/stats.js` → Ajout de tous les endpoints stats
  - `back/server.js` → Configuration serveur
  - `back/models/*` → Nouveaux modèles MongoDB (ArrondissementAvgBikes, StationList, etc.)

- **Endpoints Power BI fonctionnels** (5):
  1. `http://localhost:4000/api/stats/daily-rate` → Taux d'occupation journalier (1 doc)
  2. `http://localhost:4000/api/stats/hourly-rate` → Taux horaire (10 docs)
  3. `http://localhost:4000/api/stats/hourly-avg-bikes` → Vélos par heure (10 docs)
  4. `http://localhost:4000/api/stats/station-empty-full` → Stations vides/pleines (1504 docs)
  5. `http://localhost:4000/api/stats/arrondissement` → Stations avec noms (1932 docs)

### **2. Frontend React** 🎨

- **Nouveauté**: Application web complète avec Vite + React
- **Fichiers ajoutés**:
  - `front/` → Toute l'application frontend
  - Dashboard interactif avec cartes, graphiques, tables
  - 50+ composants UI (shadcn/ui)

### **3. Docker** 🐳

- **`docker-compose.yml`** → Ajout service frontend (port 5174)
- Spark workers configurés (2G RAM, 2 cores chacun)
- MongoDB healthcheck retiré

### **4. Spark** ⚡

- **Fichiers modifiés**:
  - `spark/spark_kpi_batch.py` → Calculs KPI batch
  - `spark/spark_kpi_streaming.py` → KPI streaming en temps réel
  - `spark/spark_staging_velib.py` → Staging données Vélib
  - `spark/check_anomalies.py` → Détection anomalies (nouveau)

---

## 🚀 Instructions pour Yannick

### **1. Récupérer les modifications**

```bash
# Option A: Merge complet
git checkout serge
git pull origin serge

# Option B: Cherry-pick commits spécifiques
git log serge --oneline -10  # Voir les commits
git cherry-pick <commit-hash>
```

### **2. Démarrer l'environnement**

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier les services
docker ps

# Attendre 30 secondes puis lancer Spark batch
docker exec spark-master /spark/bin/spark-submit \
  --master spark://spark-master:7077 \
  --packages org.mongodb.spark:mongo-spark-connector_2.12:10.2.0 \
  /opt/spark-apps/spark_kpi_batch.py
```

### **3. Accès aux services**

- **Backend API**: http://localhost:4000
- **Frontend React**: http://localhost:5174
- **Spark Master UI**: http://localhost:8080
- **HDFS UI**: http://localhost:9870

### **4. Tester les endpoints**

```powershell
# Test rapide de tous les endpoints
$endpoints = @(
    '/api/stats/daily-rate',
    '/api/stats/hourly-rate',
    '/api/stats/hourly-avg-bikes',
    '/api/stats/station-empty-full',
    '/api/stats/arrondissement'
)

foreach($e in $endpoints) {
    $r = Invoke-WebRequest -Uri "http://localhost:4000$e" -UseBasicParsing
    Write-Host "$e - OK" -ForegroundColor Green
}
```

---

## 📊 Intégration Power BI

### **Tables à importer** (Obtenir des données → Web):

1. **daily-rate**: `http://localhost:4000/api/stats/daily-rate`
2. **hourly-rate**: `http://localhost:4000/api/stats/hourly-rate`
3. **hourly-avg-bikes**: `http://localhost:4000/api/stats/hourly-avg-bikes`
4. **station-empty-full**: `http://localhost:4000/api/stats/station-empty-full`
5. **arrondissement**: `http://localhost:4000/api/stats/arrondissement`

### **Relation à créer**:

- `arrondissement[station_id]` ←→ `station-empty-full[station_id]`

---

## 🔍 Détails Techniques

### **Collections MongoDB créées**:

- `arrondissement` (1932 docs)
- `daily_rate` (1 doc)
- `hourly_rate` (10 docs)
- `hourly_avg_bikes` (10 docs)
- `station_empty_full` (1504 docs)
- `arrondissement_avg_bikes` (nouvelles collections)
- `arrondissement_rate`
- `arrondissement_empty`
- `arrondissement_full`
- `station_list`

### **Problèmes résolus**:

- ✅ Endpoint `station-empty-full` était 404 → Ajouté route + controller
- ✅ Endpoint `arrondissement` retournait données agrégées → Adapté pour stations individuelles
- ✅ Compatibilité Power BI maintenue après merge jokast-dev
- ✅ Backend redémarré et testé

---

## ⚠️ Points d'attention

1. **Version Spark**: Utilise `mongo-spark-connector_2.12:10.2.0` (compatible Spark 3.3.0)
2. **Port frontend**: 5174 (Vite dev server)
3. **Données limitées**: Seulement heures 7-16 (collecte récente)
4. **Anomalies connues**:
   - `max_rate = 172%` (données API Vélib)
   - Certaines stations 100% vides (maintenance/hors service)

---

## 📝 Notes

- **Branche source**: `serge` (16 commits ahead of origin/serge)
- **Merge effectué**: `jokast-dev` → `serge`
- **Fichiers modifiés**: 101 fichiers
- **Tests réalisés**: Tous les endpoints testés et validés ✅

---

## 👤 Contact

**Auteur**: Serge  
**Pour questions**: Vérifier les commits sur `serge` branch  
**Date**: 12/12/2025

---

**Bon courage Yannick! 🚀**

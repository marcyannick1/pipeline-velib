# Instructions Spark → MongoDB pour l'équipe

## 🎯 Objectif

Envoyer vos KPI calculés par Spark dans MongoDB pour que l'API Power BI puisse les exposer.

---

## 📊 Collections MongoDB à remplir

### **Base de données** : `velibdb`

**Host MongoDB** : `mongodb://mongodb:27017/` (dans Docker)

### **Collections disponibles** :

#### 1. **`stations_realtime`** ✅ (Déjà remplie par l'ingestion)

- Données temps réel des stations Vélib
- Mise à jour toutes les 60 secondes
- **Vous n'avez RIEN à faire sur cette collection**

#### 2. **`kpi_realtime`** 🔴 (À CRÉER par Spark)

**Structure attendue** :

```json
{
  "total_stations": 1503,
  "total_bikes": 18187,
  "total_mechanical": 11424,
  "total_electrical": 6763,
  "total_docks": 28391,
  "total_capacity": 47913,
  "occupation_rate": 0.3796,
  "timestamp": "2025-12-10T14:30:00Z"
}
```

**Fréquence** : Temps réel (toutes les 1-5 minutes)

---

#### 3. **`kpi_daily`** 🔴 (À CRÉER par Spark)

**Structure attendue** :

```json
{
  "date": "2025-12-10",
  "total_trips": 45230,
  "avg_trip_duration": 18.5,
  "peak_hour": 18,
  "peak_hour_trips": 3450,
  "avg_bikes_available": 17500,
  "avg_occupation_rate": 0.365,
  "most_used_station_id": 16107,
  "most_used_station_name": "Benjamin Godard - Victor Hugo",
  "most_used_station_trips": 452
}
```

**Fréquence** : 1 document par jour

---

#### 4. **`kpi_hourly`** 🔴 (À CRÉER par Spark - OPTIONNEL)

**Structure attendue** :

```json
{
  "datetime": "2025-12-10T14:00:00Z",
  "hour": 14,
  "total_bikes": 18200,
  "total_trips": 1250,
  "avg_trip_duration": 15.3,
  "occupation_rate": 0.38,
  "top_arrondissement": "75015"
}
```

**Fréquence** : 1 document par heure

---

#### 5. **`stations_history`** 🟡 (OPTIONNEL)

Historique des états des stations pour analyse temporelle

```json
{
  "station_id": 16107,
  "station_name": "Benjamin Godard - Victor Hugo",
  "timestamp": "2025-12-10T14:30:00Z",
  "num_bikes_available": 12,
  "num_bikes_available_types": [{ "mechanical": 8 }, { "ebike": 4 }],
  "num_docks_available": 18,
  "capacity": 30
}
```

---

## 🔧 Code Spark pour envoyer dans MongoDB

### **Connexion MongoDB depuis Spark** :

```python
from pyspark.sql import SparkSession

# Créer session Spark avec MongoDB
spark = SparkSession.builder \
    .appName("VelibKPICalculation") \
    .config("spark.mongodb.output.uri", "mongodb://mongodb:27017/velibdb") \
    .config("spark.jars.packages", "org.mongodb.spark:mongo-spark-connector_2.12:10.1.1") \
    .getOrCreate()

# Lire depuis HDFS
df = spark.read.json("hdfs://namenode:9000/velib/raw/*.json")

# Calculer KPI (exemple)
kpi_df = df.groupBy().agg(
    count("*").alias("total_stations"),
    sum("num_bikes_available").alias("total_bikes"),
    sum("num_bikes_available_types.mechanical").alias("total_mechanical"),
    sum("num_bikes_available_types.ebike").alias("total_electrical")
)

# ENVOYER dans MongoDB collection kpi_realtime
kpi_df.write \
    .format("mongodb") \
    .mode("overwrite") \
    .option("database", "velibdb") \
    .option("collection", "kpi_realtime") \
    .save()
```

---

## ✅ Checklist pour l'équipe Spark

- [ ] Installer `mongo-spark-connector` dans Spark
- [ ] Configurer la connexion à `mongodb://mongodb:27017/velibdb`
- [ ] Créer un job Spark pour calculer `kpi_realtime` (temps réel)
- [ ] Créer un job Spark pour calculer `kpi_daily` (quotidien)
- [ ] (Optionnel) Créer `kpi_hourly` pour analyse par heure
- [ ] Tester l'insertion dans MongoDB : `docker exec mongodb mongosh velibdb --eval "db.kpi_realtime.find()"`
- [ ] Vérifier que l'API expose bien les données : `curl http://localhost:5001/api/kpi/global`

---

## 🔍 Vérifications

### **Tester si MongoDB reçoit bien les données** :

```bash
# Se connecter à MongoDB
docker exec -it mongodb mongosh velibdb

# Vérifier collection kpi_realtime
db.kpi_realtime.find().pretty()

# Vérifier collection kpi_daily
db.kpi_daily.find().sort({date: -1}).limit(5)
```

### **Tester l'API Power BI** :

```bash
# Tester KPI global
curl http://localhost:5001/api/kpi/global

# Tester KPI daily
curl http://localhost:5001/api/kpi/daily

# Tester KPI hourly
curl http://localhost:5001/api/kpi/hourly
```

---

## 📞 Contact

- **Responsable API Power BI** : Serge (toi !)
- **Fichier API** : `back/api_kpi.py`
- **Docker Service** : `api-kpi` (port 5001)

---

## 🚀 Architecture complète

```
HDFS (données brutes)
    ↓
Spark (calcul KPI)
    ↓
MongoDB (velibdb)
    ├── stations_realtime ✅ (déjà remplie)
    ├── kpi_realtime 🔴 (à créer par Spark)
    ├── kpi_daily 🔴 (à créer par Spark)
    ├── kpi_hourly 🟡 (optionnel)
    └── stations_history 🟡 (optionnel)
    ↓
API Flask (back/api_kpi.py)
    ↓
Power BI Desktop
```

---

**Questions ?** Contacte Serge !

# Guide de connexion MongoDB → Power BI

## Pour les données Vélib en temps réel

### Prérequis

1. **MongoDB Atlas SQL ODBC Driver**

   - Télécharger : https://www.mongodb.com/try/download/odbc-driver
   - Installer le driver sur Windows

2. **MongoDB en cours d'exécution**

   ```powershell
   docker-compose up -d mongo
   ```

3. **Vérifier la connexion**
   ```powershell
   mongo mongodb://localhost:27017/velib_db
   ```

---

## Méthode 1 : Connecteur MongoDB natif (Simple)

### Dans Power BI Desktop :

1. **Obtenir les données**

   - Menu : `Accueil` → `Obtenir les données` → `Plus...`
   - Rechercher : `MongoDB`
   - Sélectionner : `MongoDB Atlas SQL` ou `MongoDB BI Connector`

2. **Paramètres de connexion**

   ```
   Serveur MongoDB : localhost:27017
   Base de données   : velib_db
   Mode             : DirectQuery (temps réel) ou Import
   ```

3. **Sélectionner les tables**

   - ✅ `stations_realtime` (dernières données)
   - ✅ `stations_history` (historique complet)

4. **Charger les données**
   - Cliquer sur "Charger"
   - Les données apparaissent dans le volet "Champs"

---

## Méthode 2 : Via API REST Python (Recommandé pour temps réel)

### Créer un service API REST

**Fichier : `back/api_powerbi.py`**

```python
from flask import Flask, jsonify
from pymongo import MongoClient
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

client = MongoClient("mongodb://localhost:27017/")
db = client["velib_db"]

@app.route('/api/stations/realtime', methods=['GET'])
def get_realtime_stations():
    """Obtenir les données en temps réel"""
    stations = list(db.stations_realtime.find({}, {'_id': 0}))
    return jsonify(stations)

@app.route('/api/stations/history', methods=['GET'])
def get_history_stations():
    """Obtenir l'historique"""
    stations = list(db.stations_history.find({}, {'_id': 0}).limit(10000))
    return jsonify(stations)

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Obtenir les statistiques agrégées"""
    pipeline = [
        {
            '$group': {
                '_id': '$nom_arrondissement_communes',
                'total_stations': {'$sum': 1},
                'total_bikes': {'$sum': '$num_bikes_available'},
                'total_ebikes': {'$sum': '$ebikes'},
                'total_mechanical': {'$sum': '$mechanical_bikes'},
                'avg_capacity': {'$avg': '$capacity'}
            }
        }
    ]
    stats = list(db.stations_realtime.aggregate(pipeline))
    return jsonify(stats)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

**Installation** :

```powershell
pip install flask flask-cors pymongo
```

**Démarrer l'API** :

```powershell
python back/api_powerbi.py
```

### Dans Power BI :

1. **Obtenir les données**

   - `Obtenir les données` → `Web`

2. **URL de l'API**

   ```
   http://localhost:5000/api/stations/realtime
   ```

3. **Format**

   - Sélectionner "JSON"
   - Transformer en table

4. **Actualisation automatique**
   - Aller dans : `Fichier` → `Options` → `Actualisation planifiée`
   - Définir l'intervalle : 1 minute

---

## Méthode 3 : Via Python Script dans Power BI

### Dans Power BI Desktop :

1. **Obtenir les données**

   - `Obtenir les données` → `Plus...` → `Python script`

2. **Script Python**

   ```python
   from pymongo import MongoClient
   import pandas as pd

   # Connexion MongoDB
   client = MongoClient("mongodb://localhost:27017/")
   db = client["velib_db"]

   # Récupérer les données
   stations = list(db.stations_realtime.find({}, {'_id': 0}))

   # Convertir en DataFrame
   df = pd.DataFrame(stations)
   ```

3. **Charger**
   - Power BI détecte automatiquement le DataFrame `df`
   - Cliquer sur "Charger"

---

## Configuration de l'actualisation en continu

### 1. Mode DirectQuery (Temps réel)

**Avantages** :

- ✅ Données toujours à jour
- ✅ Pas de stockage local
- ✅ Requêtes directes à MongoDB

**Configuration** :

```
Lors de la connexion, choisir : "DirectQuery"
```

### 2. Actualisation automatique (Mode Import)

**Power BI Desktop** :

1. `Accueil` → `Actualiser`
2. Configurer l'intervalle dans les options

**Power BI Service (Cloud)** :

1. Publier le rapport
2. Configurer la passerelle de données
3. Définir l'actualisation : toutes les 15 minutes (minimum)

---

## Structure des données pour Power BI

### Tables recommandées :

**Table 1 : stations_realtime**

- Mise à jour en temps réel
- Pour les dashboards actuels

**Table 2 : stations_history**

- Historique complet
- Pour les analyses temporelles

**Table 3 : dim_communes (dimension)**

- Liste des communes
- Pour les filtres géographiques

---

## Visualisations recommandées

### 1. Carte géographique

```
Visualisation : Carte
Latitude  : latitude
Longitude : longitude
Taille    : num_bikes_available
Couleur   : Taux d'occupation
```

### 2. Jauge en temps réel

```
Visualisation : Jauge
Valeur    : SUM(num_bikes_available)
Maximum   : SUM(capacity)
```

### 3. Graphique temporel

```
Visualisation : Graphique en courbes
Axe X : timestamp
Axe Y : num_bikes_available
Légende : nom_arrondissement_communes
```

### 4. KPI principales

```
- Total vélos disponibles
- Total places libres
- Taux d'occupation moyen
- Nombre de stations actives
```

---

## Script PowerShell de déploiement complet

```powershell
# Démarrer MongoDB
docker-compose up -d mongo

# Attendre que MongoDB soit prêt
Start-Sleep -Seconds 5

# Démarrer l'ingestion
docker-compose up -d ingestion

# Installer les dépendances API
pip install flask flask-cors pymongo pandas

# Démarrer l'API REST
Start-Process python -ArgumentList "back/api_powerbi.py"

Write-Host "✅ Système prêt pour Power BI"
Write-Host "API REST disponible sur : http://localhost:5000"
Write-Host "MongoDB disponible sur : mongodb://localhost:27017"
```

---

## Dépannage

### Erreur de connexion MongoDB

```powershell
# Vérifier que MongoDB tourne
docker ps | Select-String mongo

# Tester la connexion
mongo mongodb://localhost:27017/velib_db --eval "db.stats()"
```

### Power BI ne voit pas MongoDB

1. Installer MongoDB ODBC Driver
2. Redémarrer Power BI Desktop
3. Vérifier le pare-feu Windows (port 27017)

### Actualisation bloquée

- Mode Import : limité à 8 actualisations/jour (gratuit)
- Passer en DirectQuery ou Power BI Pro

---

## Résumé

**Meilleure approche pour temps réel** :

1. ✅ Créer API REST Python (Méthode 2)
2. ✅ Connecter Power BI via Web/JSON
3. ✅ Configurer actualisation automatique
4. ✅ Créer dashboards dynamiques

**URL de l'API** : `http://localhost:5000/api/stations/realtime`

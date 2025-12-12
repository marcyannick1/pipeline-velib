# 📊 Guide de connexion Power BI avec l'API Vélib

## 🎯 Objectif

Connecter Power BI Desktop aux données Vélib via l'API Flask REST (port 5001)

---

## ✅ Prérequis

- Infrastructure Docker lancée : `docker-compose up -d`
- API fonctionnelle : http://localhost:5001
- MongoDB contenant les données (1503 stations)
- Power BI Desktop installé

---

## 📡 Endpoints API disponibles

### 1. **Stations temps réel** (Données principales)

```
GET http://localhost:5001/api/stations/realtime
```

**Retourne** : Toutes les stations avec leurs données en temps réel

- `station_id`, `name`, `latitude`, `longitude`
- `capacity`, `num_bikes_available`, `num_docks_available`
- `mechanical_bikes`, `ebikes`
- `is_installed`, `is_renting`, `is_returning`
- `timestamp`

### 2. **KPI Globaux** (Agrégats)

```
GET http://localhost:5001/api/kpi/global
```

**Retourne** :

- `total_stations` : 1503
- `total_bikes` : ~18 000
- `total_capacity` : ~48 000
- `total_electrical` : ~6 700
- `total_mechanical` : ~11 400
- `occupation_rate` : ~38%

### 3. **Top stations pleines/vides**

```
GET http://localhost:5001/api/stations/top?type=full&limit=10
GET http://localhost:5001/api/stations/top?type=empty&limit=10
```

### 4. **Stations cassées**

```
GET http://localhost:5001/api/stations/broken
```

### 5. **KPI par arrondissement**

```
GET http://localhost:5001/api/kpi/arrondissement
```

---

## 🔗 Connexion dans Power BI Desktop

### Étape 1 : Importer les données de l'API

1. **Ouvrir Power BI Desktop**

2. **Obtenir des données** → Sélectionner **"Web"**

3. **URL de base** : `http://localhost:5001/api/stations/realtime`

4. **Cliquer sur OK** → Power BI va interroger l'API

5. **Transformation des données** :

   - Power BI va reconnaître le JSON
   - Cliquer sur **"List"** dans la colonne `data`
   - Cliquer sur **"To Table"**
   - Cliquer sur **"Expand"** (icône double flèche) pour extraire les colonnes
   - Sélectionner toutes les colonnes
   - Cliquer sur **"OK"**

6. **Renommer la requête** : `Stations_Realtime`

7. **Cliquer sur "Fermer et appliquer"**

---

### Étape 2 : Ajouter les KPI globaux (optionnel)

1. **Nouvelle source** → **Web** → `http://localhost:5001/api/kpi/global`

2. **Extraire les données** :

   - Expand `data`
   - Garder toutes les colonnes

3. **Renommer** : `KPI_Global`

4. **Fermer et appliquer**

---

### Étape 3 : Ajouter le Top stations (optionnel)

1. **Nouvelle source** → **Web** → `http://localhost:5001/api/stations/top?type=full&limit=10`

2. **Renommer** : `Top_Stations_Pleines`

3. **Répéter avec** : `http://localhost:5001/api/stations/top?type=empty&limit=10`

4. **Renommer** : `Top_Stations_Vides`

---

## 📊 Créer les visualisations

### 1. **Carte géographique**

- Type : **Carte (Map)**
- Champs :
  - Latitude : `latitude`
  - Longitude : `longitude`
  - Taille : `num_bikes_available`
  - Légende : `name`

### 2. **KPI Cards**

Créer 6 cartes avec les mesures DAX :

```dax
Total Vélos = SUM(Stations_Realtime[num_bikes_available])
Total Électriques = SUM(Stations_Realtime[ebikes])
Total Mécaniques = SUM(Stations_Realtime[mechanical_bikes])
Capacité Totale = SUM(Stations_Realtime[capacity])
Taux Occupation = DIVIDE([Total Vélos], [Capacité Totale], 0)
Nombre Stations = COUNTROWS(Stations_Realtime)
```

### 3. **Jauge d'occupation**

- Type : **Jauge (Gauge)**
- Valeur : `Taux Occupation` (mesure DAX)
- Minimum : 0
- Maximum : 1
- Format : Pourcentage

### 4. **Répartition Vélos Électriques vs Mécaniques**

- Type : **Graphique en secteurs (Pie Chart)**
- Légende : Type de vélo (créer colonne calculée)
- Valeurs : Nombre de vélos

### 5. **Top 10 Stations Pleines**

- Type : **Graphique à barres horizontales**
- Axe : `name` (station)
- Valeurs : `num_bikes_available`
- Trier par : Valeurs décroissantes
- Filtre : Top 10

### 6. **Top 10 Stations Vides**

- Type : **Graphique à barres horizontales**
- Axe : `name`
- Valeurs : `num_docks_available`
- Trier par : Valeurs décroissantes
- Filtre : Top 10

---

## 🔄 Actualisation des données

### Actualisation manuelle

Cliquer sur **"Actualiser"** dans le ruban Power BI

### Actualisation automatique (Power BI Service uniquement)

1. Publier le rapport sur Power BI Service
2. Configurer une **passerelle de données locale** (Data Gateway)
3. Planifier l'actualisation (toutes les heures, par exemple)

⚠️ **Important** : L'API doit être accessible depuis la machine où tourne la passerelle

---

## 🎨 Exemple de dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Dashboard Vélib Paris - Temps Réel                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐│
│  │18187 │  │6763  │  │11424 │  │47913 │  │ 38%  │  │1503  ││
│  │Vélos │  │Élec. │  │Méca. │  │Cap.  │  │Occup.│  │Stas. ││
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘│
│                                                               │
│  ┌─────────────────────────┐  ┌─────────────────────────┐   │
│  │  🗺️ Carte de Paris      │  │  📊 Vélos Élec vs Méca  │   │
│  │                         │  │                         │   │
│  │   • • •  • • •         │  │    Élec (37%)           │   │
│  │  • • • • • • •         │  │    Méca (63%)           │   │
│  │   • • •  • • •         │  │                         │   │
│  └─────────────────────────┘  └─────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────┐  ┌─────────────────────────┐   │
│  │ Top 10 Stations Pleines │  │ Top 10 Stations Vides   │   │
│  │ ████████████ 77 vélos   │  │ ████████████ 51 places  │   │
│  │ ██████████ 63 vélos     │  │ ██████████ 43 places    │   │
│  └─────────────────────────┘  └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🐛 Dépannage

### Problème : Power BI ne peut pas se connecter à l'API

**Solution** :

```powershell
# Vérifier que l'API fonctionne
curl http://localhost:5001/

# Vérifier les logs
docker logs velib-api-kpi
```

### Problème : Données vides dans Power BI

**Solution** :

```powershell
# Vérifier MongoDB
docker exec mongodb mongosh velibdb --eval "db.stations_realtime.countDocuments()"

# Si vide, recharger les données
docker exec velib-ingestion python script/hdfs_to_mongodb.py
```

### Problème : Erreur CORS dans Power BI

**Solution** : L'API a déjà CORS activé (`flask-cors`). Si problème persiste :

```python
# Dans api_kpi.py, vérifier :
CORS(app)  # ← Doit être présent
```

---

## ✅ Checklist de démarrage

- [ ] Infrastructure Docker lancée : `docker-compose up -d`
- [ ] MongoDB contient les données (1503 stations)
- [ ] API accessible : `curl http://localhost:5001/`
- [ ] Power BI Desktop ouvert
- [ ] Connexion Web configurée
- [ ] Données importées et transformées
- [ ] Visualisations créées
- [ ] Dashboard finalisé

---

## 🚀 Prochaines étapes

1. **Ajouter des KPI Spark** : Exécuter `spark_realtime_kpi.py` et `spark_batch_daily.py` pour des analyses avancées
2. **Créer des alertes** : Stations vides, stations pleines, pannes
3. **Analyse temporelle** : Ajouter historique pour voir l'évolution dans le temps
4. **Prédictions** : Utiliser Power BI avec Azure ML pour prédire l'occupation

---

## 📚 Ressources

- API Documentation : http://localhost:5001/
- MongoDB UI : http://localhost:27017 (via MongoDB Compass)
- HDFS UI : http://localhost:9870
- Spark UI : http://localhost:8080

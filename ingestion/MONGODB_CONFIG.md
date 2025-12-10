# Configuration MongoDB pour fetch_velib_api.py

## 🗄️ Options de connexion MongoDB

### Option 1 : Sans MongoDB (mode test)

Récupère les données sans les sauvegarder :

```powershell
$env:USE_MONGODB="false"
$env:MODE="continuous"
$env:FETCH_INTERVAL="60"
python fetch_velib_api.py
```

### Option 2 : MongoDB local

Si vous avez MongoDB installé localement :

```powershell
$env:MONGO_URI="mongodb://localhost:27017/"
$env:MONGO_DB="velib_db"
$env:MODE="continuous"
python fetch_velib_api.py
```

### Option 3 : MongoDB avec Docker

1. Démarrez MongoDB via Docker :

```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

2. Utilisez localhost (car vous êtes en dehors de Docker) :

```powershell
$env:MONGO_URI="mongodb://localhost:27017/"
$env:MONGO_DB="velib_db"
$env:MODE="continuous"
python fetch_velib_api.py
```

### Option 4 : Dans un conteneur Docker (avec docker-compose)

Le script utilise `mongodb://mongo:27017/` par défaut, ce qui fonctionne dans un réseau Docker.

## 📋 Variables d'environnement

| Variable         | Défaut                   | Description                |
| ---------------- | ------------------------ | -------------------------- |
| `MONGO_URI`      | `mongodb://mongo:27017/` | URI de connexion MongoDB   |
| `MONGO_DB`       | `velib_db`               | Nom de la base de données  |
| `USE_MONGODB`    | `true`                   | Activer/désactiver MongoDB |
| `MODE`           | `continuous`             | `continuous` ou `once`     |
| `FETCH_INTERVAL` | `60`                     | Intervalle en secondes     |

## 🏗️ Structure de la base de données

Une fois connecté, le script crée :

- **Base** : `velib_db`
- **Collections** :
  - `stations_realtime` : Dernières données de chaque station (mise à jour)
  - `stations_history` : Historique complet (insertion)

## 🔍 Exemple de document MongoDB

```json
{
  "station_id": "16107",
  "name": "Benjamin Godard - Victor Hugo",
  "latitude": 48.865983,
  "longitude": 2.275725,
  "capacity": 35,
  "num_bikes_available": 5,
  "mechanical_bikes": 3,
  "ebikes": 2,
  "num_docks_available": 30,
  "is_installed": "OUI",
  "is_renting": "OUI",
  "timestamp": "2025-12-09T16:30:53.107Z"
}
```

# 🚴 Pipeline Vélib - Projet Big Data

Projet complet de pipeline Big Data pour l'analyse des données Vélib en temps réel.

## 📁 Structure du Projet

```
pipeline-velib/
├── back/                    # Backend Node.js + Express + Mongoose
│   ├── config/             # Configuration MongoDB
│   ├── controllers/        # Contrôleurs API
│   ├── models/             # Modèles Mongoose
│   ├── routes/             # Routes API
│   ├── utils/              # Utilitaires
│   ├── server.js           # Point d'entrée
│   ├── Dockerfile          # Image Docker backend
│   └── package.json        # Dépendances Node.js
│
├── ingestion/              # Ingestion Python des données temps réel
│   ├── script/             # Scripts d'ingestion
│   │   └── fetch_velib_api.py   # Script principal
│   ├── Dockerfile          # Image Docker ingestion
│   └── requirements.txt    # Dépendances Python
│
├── front/                  # Frontend (à développer)
│
├── mongo/                  # Configuration MongoDB
│
└── docker-compose.yml      # Orchestration des services

```

## 🏗️ Architecture

### Services Docker

1. **MongoDB** (Port 27017)

   - Base de données NoSQL
   - Collections: `stations_realtime`, `stations_history`

2. **Backend Node.js** (Port 4000)

   - API REST avec Express
   - Mongoose pour MongoDB
   - Routes:
     - `/api/stations` - Données des stations
     - `/api/stats` - Statistiques

3. **Ingestion Python**
   - Récupération automatique toutes les 60 secondes
   - Source: OpenData Paris (data.gouv.fr)
   - 1503 stations Vélib

## 🚀 Démarrage Rapide

### Avec Docker Compose (Recommandé)

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

### En local

#### Backend

```bash
cd back
npm install
npm run dev
```

#### Ingestion

```bash
cd ingestion
pip install -r requirements.txt
python script/fetch_velib_api.py
```

## 🔧 Configuration

### Variables d'environnement

#### Backend (`back/.env`)

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/velib_db
NODE_ENV=development
```

#### Ingestion

```env
MONGO_URI=mongodb://localhost:27017/velib_db
USE_MONGODB=true
MODE=continuous
FETCH_INTERVAL=60
```

## 📊 API Endpoints

### Stations

- `GET /api/stations` - Toutes les stations
- `GET /api/stations/:id` - Station spécifique
- `GET /api/stations/realtime` - Données temps réel

### Statistiques

- `GET /api/stats` - Statistiques globales
- `GET /api/stats/availability` - Disponibilité par zone

## 🛠️ Technologies

### Backend

- **Node.js** 18
- **Express** 4.18
- **Mongoose** 7.3
- **MongoDB** (latest)

### Ingestion

- **Python** 3.11
- **PyMongo** 4.6
- **Requests** 2.31

### DevOps

- **Docker** & **Docker Compose**
- **Git** & **GitHub**

## 📈 Données

- **Source**: OpenData Paris (data.gouv.fr)
- **Fréquence**: Mise à jour toutes les 60 secondes
- **Volume**: 1503 stations, 68 communes
- **Capacité totale**: ~47,913 vélos

## 👥 Équipe

- **Serge** - Ingestion Python + MongoDB
- **Backend Team** - API Node.js
- **Jokast** - Développement
- **Yannick** - Configuration Docker

## 📝 Prochaines Étapes

- [ ] Frontend React/Vue.js
- [ ] Intégration Power BI
- [ ] Hadoop HDFS pour big data
- [ ] Apache Spark pour traitement batch
- [ ] Kafka pour streaming
- [ ] Dashboard de visualisation

## 🐛 Debug

### Vérifier les services Docker

```bash
docker-compose ps
```

### Vérifier MongoDB

```bash
docker exec -it velib-mongodb mongosh velib_db
```

### Logs des services

```bash
docker-compose logs backend
docker-compose logs ingestion
```

## 📄 License

Projet académique - 5ème Année Hadoop

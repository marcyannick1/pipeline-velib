# 📊 API KPI Vélib - Endpoints disponibles pour Power BI

## 🟦 **KPI TEMPS RÉEL** (Disponibles MAINTENANT)

| KPI Demandé                                 | Endpoint                                | Status    | Détails                                                      |
| ------------------------------------------- | --------------------------------------- | --------- | ------------------------------------------------------------ |
| ✅ Nombre total de vélos (global/méca/élec) | `/api/kpi/global`                       | **ACTIF** | `total_bikes`, `total_mechanical`, `total_electrical`        |
| ✅ Nombre total de places libres            | `/api/kpi/global`                       | **ACTIF** | `total_docks`                                                |
| ✅ Taux d'occupation global                 | `/api/kpi/global`                       | **ACTIF** | `occupation_rate`                                            |
| ✅ Top 10 stations les plus pleines         | `/api/stations/top?type=full&limit=10`  | **ACTIF** | Tri par `num_bikes_available` DESC                           |
| ✅ Top 10 stations les plus vides           | `/api/stations/top?type=empty&limit=10` | **ACTIF** | Tri par `num_bikes_available` ASC                            |
| ✅ Stations "en panne"                      | `/api/stations/broken`                  | **ACTIF** | `is_renting=0` OU `is_returning=0`                           |
| ✅ Carte interactive des stations           | `/api/stations/realtime`                | **ACTIF** | Toutes les stations avec `lat`, `lon`, `num_bikes_available` |

---

## 🟧 **KPI JOURNALIERS** (Dépendent de Spark)

| KPI Demandé                                 | Endpoint                          | Status           | Données nécessaires de Spark                  |
| ------------------------------------------- | --------------------------------- | ---------------- | --------------------------------------------- |
| ⏳ Variation taux d'occupation heure/heure  | `/api/kpi/hourly`                 | **ATTEND SPARK** | Collection `stations_history` avec timestamps |
| ⏳ Disponibilité moyenne par heure          | `/api/kpi/hourly`                 | **ATTEND SPARK** | Collection `stations_history`                 |
| ✅ Disponibilité moyenne par arrondissement | `/api/kpi/arrondissement`         | **ACTIF**        | Calcul temps réel depuis `stations_realtime`  |
| ⏳ Taux occupation journalier (max/min/avg) | `/api/kpi/daily`                  | **ATTEND SPARK** | Collection `kpi_daily`                        |
| ⏳ Histogramme heures de surcharge          | `/api/kpi/hourly`                 | **ATTEND SPARK** | Collection `stations_history`                 |
| ⏳ % temps station vide/pleine              | `/api/stats/station_availability` | **À CRÉER**      | Collection `stations_history`                 |

---

## 🎯 **Endpoints supplémentaires utiles**

| Endpoint                  | Description                                                        | Usage Power BI      |
| ------------------------- | ------------------------------------------------------------------ | ------------------- |
| `/api/stats/summary`      | Résumé complet (stations actives, vides, pleines, ratio élec/méca) | Dashboard principal |
| `/api/kpi/arrondissement` | KPI par arrondissement (nb stations, vélos, taux occupation)       | Graphique par zone  |
| `/api/health`             | Statut API + MongoDB                                               | Monitoring          |

---

## 📋 **Résumé : Que peux-tu faire MAINTENANT ?**

### ✅ **Disponible immédiatement** (sans attendre Spark) :

1. **Carte interactive** avec toutes les stations
2. **KPI globaux** : Total vélos, places, taux d'occupation
3. **Top 10** stations pleines/vides
4. **Stations en panne**
5. **Statistiques par arrondissement**
6. **Dashboard résumé** (stations actives, ratio élec/méca)

### ⏳ **Nécessite que Spark remplisse MongoDB** :

7. **Analyse horaire** (variation dans le temps)
8. **Historique journalier** (tendances)
9. **Pourcentage temps vide/plein** par station

---

## 🧪 **Tests des endpoints**

```bash
# Test KPI globaux
curl http://localhost:5001/api/kpi/global

# Test top stations pleines
curl http://localhost:5001/api/stations/top?type=full&limit=10

# Test top stations vides
curl http://localhost:5001/api/stations/top?type=empty&limit=10

# Test stations en panne
curl http://localhost:5001/api/stations/broken

# Test KPI par arrondissement
curl http://localhost:5001/api/kpi/arrondissement

# Test résumé complet
curl http://localhost:5001/api/stats/summary

# Test toutes les stations (pour carte)
curl http://localhost:5001/api/stations/realtime
```

---

## 📊 **Structure des données pour Power BI**

### Exemple : `/api/kpi/global`

```json
{
  "success": true,
  "data": {
    "total_bikes": 18187,
    "total_mechanical": 11424,
    "total_electrical": 6763,
    "total_docks": 28391,
    "total_capacity": 47913,
    "total_stations": 1503,
    "occupation_rate": 0.3796
  }
}
```

### Exemple : `/api/stations/top?type=full&limit=10`

```json
{
  "success": true,
  "type": "full",
  "count": 10,
  "data": [
    {
      "station_id": 16107,
      "name": "Benjamin Godard - Victor Hugo",
      "num_bikes_available": 35,
      "capacity": 35,
      "occupation_rate": 1.0,
      "nom_arrondissement_communes": "Paris 16e Arrondissement"
    }
  ]
}
```

### Exemple : `/api/kpi/arrondissement`

```json
{
  "success": true,
  "count": 45,
  "data": [
    {
      "arrondissement": "Paris 15e Arrondissement",
      "nb_stations": 125,
      "total_bikes": 1250,
      "total_mechanical": 800,
      "total_electrical": 450,
      "total_capacity": 3500,
      "avg_bikes_per_station": 10.0,
      "occupation_rate": 0.357
    }
  ]
}
```

---

## 🚀 **Prochaines étapes**

1. **TOI (Power BI)** :

   - Connecte-toi aux endpoints **disponibles** (✅)
   - Crée dashboards avec données temps réel
   - Prépare les visuels pour données historiques

2. **ÉQU IPE SPARK** :

   - Remplir `stations_history` (historique avec timestamps)
   - Remplir `kpi_daily` (agrégations journalières)
   - Calculer KPI horaires et journaliers

3. **API (si besoin)** :
   - Ajouter endpoint `station_availability` pour % temps vide/plein
   - Optimiser requêtes si lenteur Power BI

---

## ✅ **Conclusion**

**Tu peux commencer avec Power BI MAINTENANT** ! 🎉

Tous les KPI temps réel sont disponibles. Les KPI historiques s'ajouteront automatiquement quand Spark remplira MongoDB.

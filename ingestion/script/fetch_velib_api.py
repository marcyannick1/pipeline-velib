#!/usr/bin/env python3
"""
Script pour récupérer les données Vélib en temps réel depuis data.gouv.fr
API: https://opendata.paris.fr/
Dataset: Vélib - Disponibilité en temps réel
Documentation: https://opendata.paris.fr/explore/dataset/velib-disponibilite-en-temps-reel/
"""

import requests
import json
import time
from datetime import datetime
from pymongo import MongoClient
import os
import logging

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class VelibAPIFetcher:
    """Classe pour récupérer les données Vélib en temps réel depuis data.gouv.fr"""
    
    # URLs de l'API data.gouv.fr pour Vélib
    # API temps réel des stations Vélib
    VELIB_REALTIME_URL = "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/velib-disponibilite-en-temps-reel/exports/json"
    
    # Alternative: API avec filtres et requêtes
    VELIB_API_URL = "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/velib-disponibilite-en-temps-reel/records"
    
    def __init__(self, mongo_uri="mongodb://mongo:27017/", db_name="velib_db"):
        """
        Initialise le fetcher
        
        Args:
            mongo_uri: URI de connexion MongoDB
            db_name: Nom de la base de données
        """
        self.mongo_uri = mongo_uri
        self.db_name = db_name
        self.client = None
        self.db = None
        
    def connect_mongodb(self):
        """Connexion à MongoDB"""
        try:
            self.client = MongoClient(self.mongo_uri)
            self.db = self.client[self.db_name]
            logger.info(f"Connecté à MongoDB: {self.db_name}")
            return True
        except Exception as e:
            logger.error(f"Erreur de connexion MongoDB: {e}")
            return False
    
    def fetch_velib_data(self, limit=None):
        """
        Récupère les données Vélib en temps réel depuis data.gouv.fr
        
        Args:
            limit: Nombre maximum de stations à récupérer (None = toutes)
        
        Returns:
            list: Liste des stations ou None en cas d'erreur
        """
        try:
            logger.info("Récupération des données Vélib depuis data.gouv.fr...")
            
            # Paramètres de la requête
            params = {
                'limit': limit if limit else 100,
                'offset': 0
            }
            
            all_stations = []
            
            # Pagination pour récupérer toutes les stations
            while True:
                response = requests.get(
                    self.VELIB_API_URL, 
                    params=params, 
                    timeout=15
                )
                response.raise_for_status()
                data = response.json()
                
                # Extraire les résultats
                results = data.get('results', [])
                if not results:
                    break
                
                # Ajouter un timestamp à chaque station
                for station in results:
                    station['fetch_timestamp'] = datetime.now().isoformat()
                
                all_stations.extend(results)
                
                # Vérifier s'il y a d'autres pages
                total_count = data.get('total_count', 0)
                if len(all_stations) >= total_count or limit:
                    break
                
                params['offset'] += params['limit']
                logger.info(f"Récupération... {len(all_stations)}/{total_count} stations")
            
            logger.info(f"✓ {len(all_stations)} stations récupérées depuis data.gouv.fr")
            return all_stations
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Erreur lors de la récupération des données: {e}")
            return None
    
    def fetch_velib_export(self):
        """
        Récupère l'export complet des données Vélib depuis data.gouv.fr
        Alternative plus rapide pour récupérer toutes les données
        
        Returns:
            list: Liste des stations ou None en cas d'erreur
        """
        try:
            logger.info("Récupération de l'export complet depuis data.gouv.fr...")
            
            response = requests.get(
                self.VELIB_REALTIME_URL,
                timeout=30
            )
            response.raise_for_status()
            stations = response.json()
            
            # Ajouter un timestamp à chaque station
            for station in stations:
                station['fetch_timestamp'] = datetime.now().isoformat()
            
            logger.info(f"✓ {len(stations)} stations récupérées (export complet)")
            return stations
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Erreur lors de la récupération de l'export: {e}")
            return None
    
    def normalize_station_data(self, stations):
        """
        Normalise les données des stations pour un format uniforme
        
        Args:
            stations: Liste des stations brutes
            
        Returns:
            list: Stations normalisées
        """
        if not stations:
            return []
        
        normalized = []
        for station in stations:
            # Extraire les coordonnées si disponibles
            coordonnees = station.get('coordonnees_geo', {})
            
            normalized_station = {
                # Identifiants
                'station_id': station.get('stationcode'),
                'name': station.get('name'),
                
                # Localisation
                'latitude': coordonnees.get('lat') if isinstance(coordonnees, dict) else None,
                'longitude': coordonnees.get('lon') if isinstance(coordonnees, dict) else None,
                'coordonnees_geo': coordonnees,
                
                # Capacité et disponibilité
                'capacity': station.get('capacity'),
                'num_bikes_available': station.get('numbikesavailable'),
                'num_docks_available': station.get('numdocksavailable'),
                'mechanical_bikes': station.get('mechanical'),
                'ebikes': station.get('ebike'),
                
                # Statut
                'is_installed': station.get('is_installed'),
                'is_returning': station.get('is_returning'),
                'is_renting': station.get('is_renting'),
                
                # Informations supplémentaires
                'nom_arrondissement_communes': station.get('nom_arrondissement_communes'),
                'code_insee_commune': station.get('code_insee_commune'),
                
                # Timestamps
                'duedate': station.get('duedate'),
                'fetch_timestamp': station.get('fetch_timestamp'),
                'timestamp': datetime.now().isoformat()
            }
            
            normalized.append(normalized_station)
        
        logger.info(f"✓ {len(normalized)} stations normalisées")
        return normalized
    
    def save_to_mongodb(self, stations):
        """
        Sauvegarde les données dans MongoDB
        
        Args:
            stations: Liste des stations à sauvegarder
            
        Returns:
            bool: True si succès, False sinon
        """
        if not stations:
            logger.warning("Aucune station à sauvegarder")
            return False
        
        try:
            collection = self.db['stations_realtime']
            
            # Insertion avec timestamp
            for station in stations:
                collection.update_one(
                    {'station_id': station['station_id']},
                    {'$set': station},
                    upsert=True
                )
            
            # Sauvegarder aussi dans une collection historique
            history_collection = self.db['stations_history']
            history_collection.insert_many(stations)
            
            logger.info(f"✓ {len(stations)} stations sauvegardées dans MongoDB")
            return True
        except Exception as e:
            logger.error(f"Erreur lors de la sauvegarde MongoDB: {e}")
            return False
    
    def fetch_and_save(self):
        """
        Récupère les données Vélib depuis data.gouv.fr et les sauvegarde dans MongoDB
        
        Returns:
            dict: Statistiques de l'opération
        """
        stats = {
            'timestamp': datetime.now().isoformat(),
            'success': False,
            'stations_count': 0,
            'available_bikes': 0,
            'available_mechanical': 0,
            'available_ebikes': 0,
            'available_docks': 0
        }
        
        # Récupérer les données depuis data.gouv.fr (utilise l'export complet pour plus de rapidité)
        raw_stations = self.fetch_velib_export()
        
        if not raw_stations:
            logger.error("Échec de la récupération des données depuis data.gouv.fr")
            return stats
        
        # Normaliser les données
        stations = self.normalize_station_data(raw_stations)
        
        if stations:
            # Calculer les statistiques
            stats['stations_count'] = len(stations)
            stats['available_bikes'] = sum(
                s.get('num_bikes_available', 0) or 0 for s in stations
            )
            stats['available_mechanical'] = sum(
                s.get('mechanical_bikes', 0) or 0 for s in stations
            )
            stats['available_ebikes'] = sum(
                s.get('ebikes', 0) or 0 for s in stations
            )
            stats['available_docks'] = sum(
                s.get('num_docks_available', 0) or 0 for s in stations
            )
            
            # Sauvegarder dans MongoDB si connecté
            if self.db is not None:
                stats['success'] = self.save_to_mongodb(stations)
            else:
                logger.warning("Non connecté à MongoDB, données non sauvegardées")
                stats['success'] = True
            
            logger.info(f"""
            ═══════════════════════════════════════════
            📊 Statistiques Vélib (data.gouv.fr)
            ═══════════════════════════════════════════
            Stations: {stats['stations_count']}
            Vélos disponibles: {stats['available_bikes']}
              - Mécaniques: {stats['available_mechanical']}
              - Électriques: {stats['available_ebikes']}
            Places disponibles: {stats['available_docks']}
            ═══════════════════════════════════════════
            """)
        
        return stats
    
    def run_continuous(self, interval=60):
        """
        Exécute la récupération en continu
        
        Args:
            interval: Intervalle en secondes entre chaque récupération (défaut: 60s)
        """
        logger.info(f"🚀 Démarrage de la récupération continue (intervalle: {interval}s)")
        
        if not self.connect_mongodb():
            logger.warning("Exécution sans sauvegarde MongoDB")
        
        try:
            while True:
                self.fetch_and_save()
                logger.info(f"⏳ Attente de {interval} secondes...")
                time.sleep(interval)
        except KeyboardInterrupt:
            logger.info("\n🛑 Arrêt demandé par l'utilisateur")
        finally:
            if self.client:
                self.client.close()
                logger.info("Connexion MongoDB fermée")


def main():
    """Fonction principale"""
    # Configuration depuis les variables d'environnement
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://mongo:27017/')
    db_name = os.getenv('MONGO_DB', 'velib_db')
    interval = int(os.getenv('FETCH_INTERVAL', '60'))
    
    # Mode d'exécution
    mode = os.getenv('MODE', 'continuous')  # 'continuous' ou 'once'
    
    fetcher = VelibAPIFetcher(mongo_uri, db_name)
    
    if mode == 'once':
        logger.info("Mode: Récupération unique")
        if not fetcher.connect_mongodb():
            logger.warning("Exécution sans MongoDB")
        stats = fetcher.fetch_and_save()
        if fetcher.client:
            fetcher.client.close()
        return stats
    else:
        logger.info("Mode: Récupération continue")
        fetcher.run_continuous(interval)


if __name__ == "__main__":
    main()

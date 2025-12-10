import requests
import json
import time
from datetime import datetime
from hdfs import InsecureClient
import os
import logging

# =========================
# LOGGING
# =========================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class VelibAPIFetcher:
    # API data.gouv.fr
    VELIB_REALTIME_URL = "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/velib-disponibilite-en-temps-reel/exports/json"
    VELIB_API_URL = "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/velib-disponibilite-en-temps-reel/records"

    def __init__(self, hdfs_url="http://namenode:9870", hdfs_dir="/velib/raw/"):
        self.hdfs_url = hdfs_url
        self.hdfs_dir = hdfs_dir

        try:
            self.hdfs = InsecureClient(self.hdfs_url, user="root")
            logger.info(f"Connecté à HDFS: {self.hdfs_url}")
        except Exception as e:
            logger.error(f"Erreur connexion HDFS : {e}")
            raise e

    # ===============================
    # FETCH DATA.GOUV
    # ===============================
    def fetch_velib_export(self):
        """Récupère l'export JSON complet Vélib"""
        try:
            logger.info("📡 Récupération export complet Vélib...")
            response = requests.get(self.VELIB_REALTIME_URL, timeout=30)
            response.raise_for_status()
            stations = response.json()

            ts = datetime.utcnow().isoformat()
            for s in stations:
                s["fetch_timestamp"] = ts

            logger.info(f"✓ {len(stations)} stations récupérées")
            return stations

        except Exception as e:
            logger.error(f"❌ Erreur API: {e}")
            return None

    # ===============================
    # NORMALISATION
    # ===============================
    def normalize_station_data(self, stations):
        """Normalise les données Vélib pour le RAW."""

        normalized = []

        for station in stations:
            coords = station.get("coordonnees_geo", {})

            normalized.append({
                "station_id": station.get("stationcode"),
                "name": station.get("name"),

                # Géolocalisation
                "latitude": coords.get("lat") if isinstance(coords, dict) else None,
                "longitude": coords.get("lon") if isinstance(coords, dict) else None,
                "coordonnees_geo": coords,

                # Disponibilité
                "capacity": station.get("capacity"),
                "num_bikes_available": station.get("numbikesavailable"),
                "num_docks_available": station.get("numdocksavailable"),
                "mechanical_bikes": station.get("mechanical"),
                "ebikes": station.get("ebike"),

                # Statut station
                "is_installed": station.get("is_installed"),
                "is_renting": station.get("is_renting"),
                "is_returning": station.get("is_returning"),

                # 🆕 Infos géographiques importantes
                "nom_arrondissement_communes": station.get("nom_arrondissement_communes"),
                "code_insee_commune": station.get("code_insee_commune"),

                # Timestamps
                "duedate": station.get("duedate"),
                "fetch_timestamp": station.get("fetch_timestamp"),
                "timestamp": datetime.utcnow().isoformat(),
            })

        logger.info(f"✓ {len(normalized)} stations normalisées")
        return normalized

    # ===============================
    # SAVE TO HDFS
    # ===============================
    def save_to_hdfs(self, stations):
        """Écrit un fichier JSON normalisé dans HDFS."""
        try:
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            hdfs_path = f"{self.hdfs_dir}velib_{timestamp}.json"

            self.hdfs.makedirs(self.hdfs_dir)

            with self.hdfs.write(hdfs_path, encoding="utf-8") as writer:
                json.dump(stations, writer)

            logger.info(f"📁 Fichier écrit dans HDFS : {hdfs_path}")
            return True

        except Exception as e:
            logger.error(f"❌ Erreur écriture HDFS : {e}")
            return False

    # ===============================
    # PIPELINE COMPLET
    # ===============================
    def fetch_and_save(self):
        raw = self.fetch_velib_export()
        if not raw:
            return False

        normalized = self.normalize_station_data(raw)
        return self.save_to_hdfs(normalized)

    # ===============================
    # INGRESS CONTINU
    # ===============================
    def run_continuous(self, interval=60):
        logger.info(f"🚀 Démarrage ingestion continue ({interval}s)")
        while True:
            try:
                self.fetch_and_save()
            except Exception as e:
                logger.error(f"Erreur ingestion continue : {e}")

            time.sleep(interval)


def main():
    hdfs_url = os.getenv("HDFS_URL", "http://namenode:9870")
    hdfs_dir = os.getenv("HDFS_DIR", "/velib/raw/")
    interval = int(os.getenv("FETCH_INTERVAL", "60"))

    fetcher = VelibAPIFetcher(hdfs_url, hdfs_dir)
    fetcher.run_continuous(interval)


if __name__ == "__main__":
    main()
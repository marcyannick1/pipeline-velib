# -*- coding: utf-8 -*-
"""
Script pour créer une table de correspondance station_id → arrondissement
Utilise les coordonnées géographiques et les noms de stations
"""

import json
import re
from pymongo import MongoClient

# Connexion MongoDB (Docker)
import os
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://mongodb:27017/')
client = MongoClient(MONGO_URI)
db = client['velibdb']

def extract_arrondissement_from_name(name):
    """Extrait l'arrondissement du nom de la station"""
    # Pattern pour "Mairie du Xème" ou "Mairie du X"
    match = re.search(r'Mairie du (\d+)', name, re.IGNORECASE)
    if match:
        return int(match.group(1))
    
    # Pattern pour "Square du Xème"
    match = re.search(r'du (\d+)[èe]me', name, re.IGNORECASE)
    if match:
        return int(match.group(1))
    
    return None

def get_arrondissement_from_coords(lat, lon):
    """
    Détermine l'arrondissement à partir des coordonnées GPS
    Basé sur les limites géographiques approximatives de Paris
    """
    # Paris intra-muros: lat ~48.815-48.902, lon ~2.225-2.470
    
    # Centre (1-4)
    if 48.850 <= lat <= 48.870 and 2.330 <= lon <= 2.370:
        if lon < 2.345:
            return 1
        elif lat > 48.860:
            return 2
        elif lon > 2.355:
            return 4
        else:
            return 3
    
    # 5ème (Quartier Latin)
    if 48.838 <= lat <= 48.855 and 2.340 <= lon <= 2.365:
        return 5
    
    # 6ème (Saint-Germain)
    if 48.843 <= lat <= 48.858 and 2.320 <= lon <= 2.340:
        return 6
    
    # 7ème (Tour Eiffel)
    if 48.845 <= lat <= 48.865 and 2.295 <= lon <= 2.325:
        return 7
    
    # 8ème (Champs-Élysées)
    if 48.865 <= lat <= 48.880 and 2.295 <= lon <= 2.325:
        return 8
    
    # 9ème (Opéra)
    if 48.870 <= lat <= 48.885 and 2.330 <= lon <= 2.350:
        return 9
    
    # 10ème (Gare du Nord)
    if 48.870 <= lat <= 48.885 and 2.350 <= lon <= 2.375:
        return 10
    
    # 11ème (Bastille/République)
    if 48.855 <= lat <= 48.870 and 2.370 <= lon <= 2.390:
        return 11
    
    # 12ème (Gare de Lyon)
    if 48.835 <= lat <= 48.855 and 2.370 <= lon <= 2.410:
        return 12
    
    # 13ème (Place d'Italie)
    if 48.815 <= lat <= 48.840 and 2.345 <= lon <= 2.380:
        return 13
    
    # 14ème (Montparnasse)
    if 48.820 <= lat <= 48.845 and 2.310 <= lon <= 2.340:
        return 14
    
    # 15ème (Tour Montparnasse)
    if 48.830 <= lat <= 48.855 and 2.280 <= lon <= 2.310:
        return 15
    
    # 16ème (Trocadéro)
    if 48.850 <= lat <= 48.880 and 2.260 <= lon <= 2.295:
        return 16
    
    # 17ème (Batignolles)
    if 48.880 <= lat <= 48.900 and 2.300 <= lon <= 2.330:
        return 17
    
    # 18ème (Montmartre)
    if 48.885 <= lat <= 48.900 and 2.330 <= lon <= 2.365:
        return 18
    
    # 19ème (Buttes-Chaumont)
    if 48.875 <= lat <= 48.895 and 2.365 <= lon <= 2.400:
        return 19
    
    # 20ème (Père Lachaise)
    if 48.855 <= lat <= 48.875 and 2.390 <= lon <= 2.415:
        return 20
    
    # Banlieue - identifier par station_id
    # 30xxx = Banlieue Ouest
    # 40xxx = Banlieue Est
    # 50xxx = Banlieue Nord
    
    return None  # Banlieue ou non identifié

def get_commune_from_station_id(station_id):
    """Identifie la commune de banlieue basée sur le station_id"""
    prefix = int(str(station_id)[:2])
    
    communes = {
        21: "Neuilly-sur-Seine",
        22: "Levallois-Perret",
        23: "Clichy",
        24: "Saint-Ouen",
        25: "Saint-Denis",
        26: "Aubervilliers",
        27: "Pantin",
        28: "Le Pré-Saint-Gervais",
        29: "Les Lilas",
        30: "Bagnolet",
        31: "Montreuil",
        32: "Vincennes",
        33: "Saint-Mandé",
        34: "Charenton-le-Pont",
        35: "Ivry-sur-Seine",
        36: "Kremlin-Bicêtre",
        37: "Gentilly",
        38: "Montrouge",
        39: "Malakoff",
        40: "Vanves",
        41: "Issy-les-Moulineaux",
        42: "Boulogne-Billancourt",
    }
    
    return communes.get(prefix, "Banlieue")

def create_mapping():
    """Crée la table de correspondance station_id → arrondissement/commune"""
    print("📍 Récupération des stations depuis MongoDB...")
    stations = list(db.stations_realtime.find({}, {
        'station_id': 1, 
        'name': 1, 
        'latitude': 1, 
        'longitude': 1, 
        '_id': 0
    }))
    
    print(f"✅ {len(stations)} stations récupérées")
    
    mapping = []
    stats = {'paris': 0, 'banlieue': 0, 'unknown': 0}
    
    for station in stations:
        station_id = station['station_id']
        name = station['name']
        lat = station['latitude']
        lon = station['longitude']
        
        # Essayer d'extraire depuis le nom
        arr = extract_arrondissement_from_name(name)
        
        # Si pas trouvé, utiliser les coordonnées
        if arr is None:
            arr = get_arrondissement_from_coords(lat, lon)
        
        # Déterminer le nom de l'arrondissement/commune
        if arr is not None:
            nom_arrondissement = f"Paris {arr}e"
            stats['paris'] += 1
        else:
            # Banlieue
            nom_arrondissement = get_commune_from_station_id(station_id)
            if nom_arrondissement == "Banlieue":
                stats['unknown'] += 1
            else:
                stats['banlieue'] += 1
        
        mapping.append({
            'station_id': station_id,
            'nom_arrondissement_communes': nom_arrondissement,
            'latitude': lat,
            'longitude': lon,
            'name': name
        })
    
    # Sauvegarder dans un fichier JSON
    output_file = 'station_arrondissement_mapping.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Mapping créé: {output_file}")
    print(f"📊 Statistiques:")
    print(f"   - Paris intra-muros: {stats['paris']}")
    print(f"   - Banlieue identifiée: {stats['banlieue']}")
    print(f"   - Non identifié: {stats['unknown']}")
    
    return mapping

def insert_to_mongo(mapping):
    """Insère le mapping dans MongoDB"""
    print("\n💾 Insertion dans MongoDB...")
    
    # Créer une nouvelle collection
    db.station_arrondissement.drop()  # Supprimer si existe
    db.station_arrondissement.insert_many(mapping)
    
    # Créer un index sur station_id
    db.station_arrondissement.create_index('station_id', unique=True)
    
    print(f"✅ {len(mapping)} enregistrements insérés dans 'station_arrondissement'")

if __name__ == '__main__':
    print("=" * 60)
    print("🗺️  CRÉATION TABLE ARRONDISSEMENT")
    print("=" * 60)
    
    mapping = create_mapping()
    insert_to_mongo(mapping)
    
    print("\n✅ Terminé!")

#!/usr/bin/env python3
"""Script pour afficher toutes les informations récupérées par l'API Vélib"""

from fetch_velib_api import VelibAPIFetcher
import json

def show_api_info():
    """Affiche un exemple complet des données API"""
    
    print("=" * 70)
    print("📡 INFORMATIONS RÉCUPÉRÉES PAR L'API VÉLIB (data.gouv.fr)")
    print("=" * 70)
    
    fetcher = VelibAPIFetcher()
    
    # Récupération des données brutes
    print("\n🔄 Récupération des données...")
    stations = fetcher.fetch_velib_export()
    
    if not stations:
        print("❌ Erreur de récupération")
        return
    
    print(f"✅ {len(stations)} stations récupérées\n")
    
    # Afficher un exemple complet
    print("=" * 70)
    print("📋 EXEMPLE DE STATION COMPLÈTE (données brutes)")
    print("=" * 70)
    print(json.dumps(stations[0], indent=2, ensure_ascii=False))
    
    # Liste tous les champs disponibles
    print("\n" + "=" * 70)
    print("📊 LISTE DE TOUS LES CHAMPS DISPONIBLES")
    print("=" * 70)
    
    all_keys = set()
    for station in stations[:100]:  # Vérifier les 100 premières stations
        all_keys.update(station.keys())
    
    for i, key in enumerate(sorted(all_keys), 1):
        example_value = stations[0].get(key, "N/A")
        value_type = type(example_value).__name__
        print(f"{i:2}. {key:35} (type: {value_type:10}) Exemple: {str(example_value)[:50]}")
    
    # Normalisation
    print("\n" + "=" * 70)
    print("📦 EXEMPLE DE STATION NORMALISÉE (format MongoDB)")
    print("=" * 70)
    normalized = fetcher.normalize_station_data(stations)
    print(json.dumps(normalized[0], indent=2, ensure_ascii=False))
    
    # Statistiques globales
    print("\n" + "=" * 70)
    print("📈 STATISTIQUES GLOBALES")
    print("=" * 70)
    
    total_capacity = sum(s.get('capacity', 0) or 0 for s in stations)
    total_bikes = sum(s.get('numbikesavailable', 0) or 0 for s in stations)
    total_mechanical = sum(s.get('mechanical', 0) or 0 for s in stations)
    total_ebike = sum(s.get('ebike', 0) or 0 for s in stations)
    total_docks = sum(s.get('numdocksavailable', 0) or 0 for s in stations)
    
    installed = sum(1 for s in stations if s.get('is_installed') == 'OUI')
    renting = sum(1 for s in stations if s.get('is_renting') == 'OUI')
    returning = sum(1 for s in stations if s.get('is_returning') == 'OUI')
    
    print(f"""
    Nombre total de stations: {len(stations)}
    Stations installées: {installed}
    Stations en location: {renting}
    Stations acceptant les retours: {returning}
    
    Capacité totale: {total_capacity} places
    Vélos disponibles: {total_bikes}
      - Mécaniques: {total_mechanical}
      - Électriques: {total_ebike}
    Places libres: {total_docks}
    
    Taux d'occupation: {(total_bikes/total_capacity*100):.1f}%
    """)
    
    # Liste des arrondissements
    arrondissements = set(s.get('nom_arrondissement_communes') for s in stations if s.get('nom_arrondissement_communes'))
    print(f"\n📍 Zones couvertes ({len(arrondissements)} communes/arrondissements):")
    for arr in sorted(arrondissements)[:20]:  # Afficher les 20 premières
        count = sum(1 for s in stations if s.get('nom_arrondissement_communes') == arr)
        print(f"  - {arr}: {count} stations")
    
    print("\n" + "=" * 70)

if __name__ == "__main__":
    show_api_info()

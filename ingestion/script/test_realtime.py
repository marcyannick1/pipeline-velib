#!/usr/bin/env python3
"""Test pour vérifier si l'API data.gouv.fr fournit des données en temps réel"""

from fetch_velib_api import VelibAPIFetcher
import time
from datetime import datetime

def test_realtime():
    fetcher = VelibAPIFetcher()
    
    print("=" * 60)
    print("Test de l'API Vélib en temps réel")
    print("=" * 60)
    
    # Premier appel
    print("\n📡 Premier appel à l'API...")
    stations1 = fetcher.fetch_velib_export()
    
    if not stations1:
        print("❌ Erreur lors de la récupération")
        return
    
    # Afficher quelques stations
    print(f"\n✅ {len(stations1)} stations récupérées")
    print("\n📊 Échantillon de 3 stations:")
    for i in range(min(3, len(stations1))):
        s = stations1[i]
        print(f"\n  Station: {s.get('name')} (ID: {s.get('stationcode')})")
        print(f"    Vélos disponibles: {s.get('numbikesavailable')}")
        print(f"    Places disponibles: {s.get('numdocksavailable')}")
        print(f"    Dernière MAJ: {s.get('duedate')}")
    
    # Attendre
    wait_time = 15
    print(f"\n⏳ Attente de {wait_time} secondes...")
    time.sleep(wait_time)
    
    # Deuxième appel
    print(f"\n📡 Deuxième appel à l'API...")
    stations2 = fetcher.fetch_velib_export()
    
    if not stations2:
        print("❌ Erreur lors de la récupération")
        return
    
    print(f"\n✅ {len(stations2)} stations récupérées")
    print("\n📊 Même échantillon après attente:")
    
    # Comparer les mêmes stations
    changes_detected = 0
    for i in range(min(3, len(stations1))):
        s1 = stations1[i]
        s2 = stations2[i]
        
        bikes_changed = s1.get('numbikesavailable') != s2.get('numbikesavailable')
        docks_changed = s1.get('numdocksavailable') != s2.get('numdocksavailable')
        time_changed = s1.get('duedate') != s2.get('duedate')
        
        print(f"\n  Station: {s2.get('name')} (ID: {s2.get('stationcode')})")
        print(f"    Vélos disponibles: {s2.get('numbikesavailable')}", end="")
        if bikes_changed:
            print(f" ⚠️ CHANGÉ (était {s1.get('numbikesavailable')})")
            changes_detected += 1
        else:
            print(" (inchangé)")
        
        print(f"    Places disponibles: {s2.get('numdocksavailable')}", end="")
        if docks_changed:
            print(f" ⚠️ CHANGÉ (était {s1.get('numdocksavailable')})")
        else:
            print(" (inchangé)")
        
        print(f"    Dernière MAJ: {s2.get('duedate')}", end="")
        if time_changed:
            print(f" ⚠️ CHANGÉ (était {s1.get('duedate')})")
        else:
            print(" (inchangé)")
    
    # Conclusion
    print("\n" + "=" * 60)
    if changes_detected > 0:
        print("✅ CONFIRMATION: L'API fournit des données EN TEMPS RÉEL")
        print(f"   {changes_detected} changement(s) détecté(s) en {wait_time} secondes")
    else:
        print("ℹ️  Aucun changement détecté sur cet échantillon")
        print("   (Les données sont mises à jour mais peuvent être stables)")
        print("   Vérifiez le champ 'duedate' pour voir la fraîcheur des données")
    print("=" * 60)

if __name__ == "__main__":
    test_realtime()

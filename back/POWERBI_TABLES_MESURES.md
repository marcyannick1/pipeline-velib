# Organisation des Mesures Power BI en Tables

## Comment créer des tables de mesures dans Power BI

### Méthode 1 : Créer une table de mesures vide

Dans Power BI Desktop, vous pouvez créer des tables pour organiser vos mesures :

1. **Créer une table vide** :

   - Allez dans l'onglet "Modélisation" (Modeling)
   - Cliquez sur "Nouvelle table" (New Table)
   - Entrez : `📊 KPI Temps Réel = {BLANK()}`
   - Appuyez sur Entrée

2. **Déplacer vos mesures** :
   - Dans le volet "Champs" (Fields), sélectionnez une mesure
   - Cliquez-droit → "Déplacer vers" → Sélectionnez la nouvelle table

### Méthode 2 : Créer des tables organisées par catégorie

Voici les tables de mesures recommandées pour votre projet Vélib :

## 📊 Table : KPI Temps Réel

Créez cette table : `📊 KPI Temps Réel = {BLANK()}`

**Mesures à déplacer dans cette table :**

- Total_Velos
- Total_Velos_Mecaniques
- Total_Velos_Electriques
- Total_Docks_Disponibles
- Capacite_Totale
- Taux_Occupation_Global
- Nb_Stations_Actives
- Nb_Stations_Total
- Pct_Stations_Actives
- Nb_Stations_Vides
- Nb_Stations_Pleines
- Pct_Stations_Vides
- Pct_Stations_Pleines

## 📍 Table : KPI Géographiques

Créez cette table : `📍 KPI Géographiques = {BLANK()}`

**Mesures à déplacer dans cette table :**

- Nb_Stations_Par_Commune
- Capacite_Moyenne_Station
- Velos_Moyens_Par_Station
- Taux_Occupation_Par_Arrondissement

## ⚡ Table : KPI Performance

Créez cette table : `⚡ KPI Performance = {BLANK()}`

**Mesures à déplacer dans cette table :**

- Ratio_Electrique_Mecanique
- Stations_Haute_Demande (Taux > 80%)
- Stations_Faible_Utilisation (Taux < 20%)

## 📈 Table : KPI Historiques

Créez cette table : `📈 KPI Historiques = {BLANK()}`

**Mesures historiques (quand vous aurez les données) :**

- Variation_Horaire
- Moyenne_Velos_Heure
- Taux_Occupation_Max
- Taux_Occupation_Min
- Taux_Occupation_Moyen
- Pct_Temps_Vide
- Pct_Temps_Pleine
- Trend_Occupation
- Variation_Jour_Precedent

## 🎨 Table : Colonnes Calculées

Créez cette table si vous voulez séparer les colonnes calculées : `🎨 Colonnes Calculées = {BLANK()}`

**Note :** Les colonnes calculées restent dans la table source ('Temps Réel'), mais vous pouvez créer des mesures qui les utilisent.

---

## Instructions détaillées pour l'organisation

### Étape 1 : Créer les 4 tables principales

```dax
// Dans Power BI Desktop, onglet "Modélisation" → "Nouvelle table"

📊 KPI Temps Réel = {BLANK()}
📍 KPI Géographiques = {BLANK()}
⚡ KPI Performance = {BLANK()}
📈 KPI Historiques = {BLANK()}
```

### Étape 2 : Déplacer chaque mesure

Pour chaque mesure existante :

1. Dans le volet "Champs", trouvez la mesure
2. Clic-droit sur la mesure
3. Sélectionnez "Déplacer vers" (Move to)
4. Choisissez la table de destination appropriée

### Étape 3 : Vérifier l'organisation

Dans le volet "Champs", vous verrez maintenant :

```
📊 KPI Temps Réel
├── Total_Velos
├── Total_Velos_Mecaniques
├── Total_Velos_Electriques
└── ...

📍 KPI Géographiques
├── Nb_Stations_Par_Commune
├── Capacite_Moyenne_Station
└── ...

⚡ KPI Performance
├── Ratio_Electrique_Mecanique
├── Stations_Haute_Demande
└── ...

📈 KPI Historiques
├── (vides pour l'instant)
└── (à remplir quand vous aurez les données historiques)
```

---

## Avantages de cette organisation

✅ **Clarté** : Mesures groupées par thématique
✅ **Navigation** : Facile de trouver la bonne mesure
✅ **Maintenance** : Modifications plus simples
✅ **Collaboration** : Structure claire pour l'équipe
✅ **Performance** : Aucun impact sur les performances

---

## Alternative : Dossiers d'affichage (Display Folders)

Vous pouvez aussi utiliser les dossiers d'affichage sans créer de tables :

1. Sélectionnez une mesure
2. Dans le volet "Propriétés", trouvez "Dossier d'affichage" (Display Folder)
3. Entrez le nom du dossier : "KPI Temps Réel"
4. La mesure apparaîtra dans un dossier dans le volet "Champs"

**Exemple :**

- Sélectionnez `Total_Velos`
- Dossier d'affichage : `📊 Temps Réel`
- Résultat : La mesure sera dans un dossier virtuel

---

## Recommandation finale

**Pour votre projet Vélib, je recommande :**

1. Créer les 4 tables de mesures (Temps Réel, Géographiques, Performance, Historiques)
2. Déplacer vos mesures existantes dans ces tables
3. Garder la table 'Temps Réel' (source de données) séparée
4. Utiliser des icônes emoji pour identifier rapidement les tables

Cela créera une structure professionnelle et facile à maintenir !

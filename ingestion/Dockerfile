# Utiliser l'image Python officielle
FROM python:3.11-slim

# Répertoire de travail
WORKDIR /app

# Copier les requirements
COPY requirements.txt .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste du code
COPY . .

# Commande de démarrage
CMD ["python", "script/fetch_velib_api.py"]

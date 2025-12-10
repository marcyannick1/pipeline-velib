from flask import Flask, jsonify
from pymongo import MongoClient
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

client = MongoClient("mongodb://localhost:27017/")
db = client["velib_db"]

@app.route('/api/stations/realtime', methods=['GET'])
def get_realtime_stations():
    """Obtenir les données en temps réel"""
    stations = list(db.stations_realtime.find({}, {'_id': 0}))
    return jsonify(stations)

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Statistiques agrégées par arrondissement"""
    pipeline = [
        {
            '$group': {
                '_id': '$nom_arrondissement_communes',
                'total_stations': {'$sum': 1},
                'total_bikes': {'$sum': '$num_bikes_available'},
                'total_ebikes': {'$sum': '$ebikes'},
                'total_mechanical': {'$sum': '$mechanical_bikes'}
            }
        }
    ]
    stats = list(db.stations_realtime.aggregate(pipeline))
    return jsonify(stats)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

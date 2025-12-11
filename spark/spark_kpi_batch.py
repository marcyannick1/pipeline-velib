from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col, sum, avg, min, max, hour, desc
)

# ============================
# SPARK SESSION
# ============================
spark = SparkSession.builder \
    .appName("VelibBatchKPI") \
    .master("spark://spark-master:7077") \
    .config("spark.mongodb.write.connection.uri", "mongodb://mongodb:27017/velib_kpi_batch") \
    .config("spark.mongodb.read.connection.uri", "mongodb://mongodb:27017/velib_kpi_batch") \
    .getOrCreate()

spark.sparkContext.setLogLevel("WARN")

STAGING = "hdfs://namenode:9000/velib/staging/"

print("📥 Lecture STAGING...")
df = spark.read.parquet(STAGING)
df = df.withColumn("hour", hour("timestamp"))

# =======================================================
# KPI A — Liste complète des stations (station master)
# =======================================================
kpi_station_list = df.select(
    "station_id",
    col("name").alias("station_name"),
    col("nom_arrondissement_communes").alias("city"),
    col("code_insee_commune").alias("zip_code"),
    "latitude",
    "longitude",
    "capacity"
).dropDuplicates(["station_id"])

# =======================================================
# KPI B — Disponibilité moyenne par heure
# =======================================================
kpi_hourly_avg_bikes = df.groupBy("hour").agg(
    avg("num_bikes_available").alias("avg_bikes")
)

# =======================================================
# KPI C — Taux d’occupation horaire
# =======================================================
kpi_hourly_rate = df.groupBy("hour").agg(
    avg(col("num_bikes_available") / col("capacity")).alias("avg_occupation_rate")
)

# =======================================================
# KPI D — Disponibilité moyenne par arrondissement
# =======================================================
kpi_arr_avg_bikes = df.groupBy("nom_arrondissement_communes").agg(
    avg("num_bikes_available").alias("avg_bikes")
)

# =======================================================
# KPI E — Taux d’occupation moyen par arrondissement
# =======================================================
kpi_arr_rate = df.groupBy("nom_arrondissement_communes").agg(
    avg(col("num_bikes_available") / col("capacity")).alias("avg_occupation_rate")
)

# =======================================================
# KPI F — % arrondissements saturés
# =======================================================
kpi_arr_full = df.groupBy("nom_arrondissement_communes").agg(
    avg((col("num_bikes_available") == col("capacity")).cast("int")).alias("pct_full_stations")
)

# =======================================================
# KPI G — % arrondissements vides
# =======================================================
kpi_arr_empty = df.groupBy("nom_arrondissement_communes").agg(
    avg((col("num_bikes_available") == 0).cast("int")).alias("pct_empty_stations")
)

# =======================================================
# KPI H — Taux occupation journalier
# =======================================================
kpi_daily = df.select(
    avg(col("num_bikes_available") / col("capacity")).alias("avg_rate"),
    min(col("num_bikes_available") / col("capacity")).alias("min_rate"),
    max(col("num_bikes_available") / col("capacity")).alias("max_rate")
)

# =============================
# ÉCRITURE MONGODB
# =============================
kpi_station_list.write.format("mongodb").mode("overwrite").option("collection", "station_list").save()
kpi_hourly_avg_bikes.write.format("mongodb").mode("overwrite").option("collection", "hourly_avg_bikes").save()
kpi_hourly_rate.write.format("mongodb").mode("overwrite").option("collection", "hourly_rate").save()
kpi_arr_avg_bikes.write.format("mongodb").mode("overwrite").option("collection", "arrondissement_avg_bikes").save()
kpi_arr_rate.write.format("mongodb").mode("overwrite").option("collection", "arrondissement_rate").save()
kpi_arr_full.write.format("mongodb").mode("overwrite").option("collection", "arrondissement_full").save()
kpi_arr_empty.write.format("mongodb").mode("overwrite").option("collection", "arrondissement_empty").save()
kpi_daily.write.format("mongodb").mode("overwrite").option("collection", "daily_rate").save()

print("🎉 KPI Batch enregistrés dans HDFS + MongoDB (velib_kpi_batch)")
spark.stop()
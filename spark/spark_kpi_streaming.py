from pyspark.sql import SparkSession
from pyspark.sql.functions import col, sum, avg, desc

spark = SparkSession.builder \
    .appName("VelibStreamingKPI") \
    .master("spark://spark-master:7077") \
    .config("spark.mongodb.write.connection.uri", "mongodb://mongodb:27017/velib_kpi_streaming") \
    .config("spark.mongodb.read.connection.uri", "mongodb://mongodb:27017/velib_kpi_streaming") \
    .getOrCreate()

spark.sparkContext.setLogLevel("WARN")

STAGING = "hdfs://namenode:9000/velib/staging/"

df = spark.read.parquet(STAGING)

# ===========================
# KPI TEMPS RÉEL
# ===========================

# Total vélos
kpi_total = df.select(
    sum("num_bikes_available").alias("bikes_available"),
    sum("mechanical_bikes").alias("mechanical_available"),
    sum("ebikes").alias("ebikes_available"),
    sum("num_docks_available").alias("free_slots")
)

# Taux occupation global
kpi_rate = df.select(
    (sum("num_bikes_available") / sum("capacity")).alias("occupation_rate")
)

# Stations pleines / vides
kpi_top_full = df.orderBy(desc("num_bikes_available")).limit(10)
kpi_top_empty = df.orderBy(col("num_bikes_available").asc()).limit(10)

# Stations en panne
kpi_broken = df.filter(
    (col("is_renting") == 0) | (col("is_returning") == 0)
)

# Carte interactive
kpi_geo = df.select(
    "station_id", "name", "latitude", "longitude",
    "num_bikes_available", "capacity",
    (col("num_bikes_available") / col("capacity")).alias("occupation_rate")
)

# ===========================
# MONGO OUTPUT
# ===========================
kpi_total.write.format("mongodb").mode("overwrite").option("collection", "totals").save()
kpi_rate.write.format("mongodb").mode("overwrite").option("collection", "occupation_rate").save()
kpi_top_full.write.format("mongodb").mode("overwrite").option("collection", "top_full").save()
kpi_top_empty.write.format("mongodb").mode("overwrite").option("collection", "top_empty").save()
kpi_broken.write.format("mongodb").mode("overwrite").option("collection", "stations_broken").save()
kpi_geo.write.format("mongodb").mode("overwrite").option("collection", "map_points").save()

print("⚡ KPI Temps Réel mis à jour dans MongoDB (velib_kpi_realtime)")
spark.stop()
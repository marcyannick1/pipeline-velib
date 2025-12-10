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
CURATED = "hdfs://namenode:9000/velib/curated/batch/"

print("📥 Lecture STAGING...")
df = spark.read.parquet(STAGING)
df = df.withColumn("hour", hour("timestamp"))

# =============================
# KPI 1 — Variation heure par heure
# =============================
kpi_hourly = df.groupBy("hour").agg(
    avg(col("num_bikes_available") / col("capacity")).alias("avg_occupation_rate")
)

# =============================
# KPI 2 — Disponibilité moyenne par heure
# =============================
kpi_avg_hour = df.groupBy("hour").agg(
    avg("num_bikes_available").alias("avg_bikes")
)

# =============================
# KPI 3 — Disponibilité par arrondissement
# =============================
kpi_arr = df.groupBy("nom_arrondissement_communes").agg(
    avg("num_bikes_available").alias("avg_bikes")
)

# =============================
# KPI 4 — Taux d’occupation global journalier
# =============================
kpi_day = df.select(
    avg(col("num_bikes_available") / col("capacity")).alias("avg_rate"),
    min(col("num_bikes_available") / col("capacity")).alias("min_rate"),
    max(col("num_bikes_available") / col("capacity")).alias("max_rate")
)

# =============================
# KPI 5 — % du temps vide / plein
# =============================
kpi_empty_full = df.groupBy("station_id").agg(
    avg((col("num_bikes_available") == 0).cast("int")).alias("pct_empty"),
    avg((col("num_bikes_available") == col("capacity")).cast("int")).alias("pct_full")
)

# =============================
# ÉCRITURE HDFS
# =============================
kpi_hourly.write.mode("overwrite").json(CURATED + "hourly_rate/")
kpi_avg_hour.write.mode("overwrite").json(CURATED + "hourly_avg_bikes/")
kpi_arr.write.mode("overwrite").json(CURATED + "arrondissement/")
kpi_day.write.mode("overwrite").json(CURATED + "daily_rate/")
kpi_empty_full.write.mode("overwrite").json(CURATED + "station_empty_full/")

# =============================
# ÉCRITURE MONGODB
# =============================
kpi_hourly.write.format("mongodb").mode("overwrite").option("collection", "hourly_rate").save()
kpi_avg_hour.write.format("mongodb").mode("overwrite").option("collection", "hourly_avg_bikes").save()
kpi_arr.write.format("mongodb").mode("overwrite").option("collection", "arrondissement").save()
kpi_day.write.format("mongodb").mode("overwrite").option("collection", "daily_rate").save()
kpi_empty_full.write.format("mongodb").mode("overwrite").option("collection", "station_empty_full").save()

print("🎉 KPI Batch enregistrés dans HDFS + MongoDB (velib_kpi_batch)")
spark.stop()
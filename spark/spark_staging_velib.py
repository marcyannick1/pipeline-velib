from pyspark.sql import SparkSession
from pyspark.sql.functions import col, to_timestamp
from pyspark.sql.types import DoubleType, IntegerType

# =======================================
# SPARK SESSION
# =======================================
spark = SparkSession.builder \
    .appName("VelibStagingJob") \
    .master("spark://spark-master:7077") \
    .getOrCreate()

spark.sparkContext.setLogLevel("WARN")

RAW_PATH = "hdfs://namenode:9000/velib/raw/"
STAGING_PATH = "hdfs://namenode:9000/velib/staging/"

print("📥 Lecture des fichiers JSON depuis RAW...")
df = spark.read.json(RAW_PATH)

# print("📄 Schema détecté :")
# df.printSchema()

# =======================================
# NORMALISATION DES TYPES
# =======================================

df_clean = df.select(
    col("station_id"),
    col("name"),
    col("latitude").cast(DoubleType()),
    col("longitude").cast(DoubleType()),
    col("capacity").cast(IntegerType()),
    col("num_bikes_available").cast(IntegerType()),
    col("num_docks_available").cast(IntegerType()),
    col("mechanical_bikes").cast(IntegerType()),
    col("ebikes").cast(IntegerType()),
    col("is_renting").cast(IntegerType()),
    col("is_returning").cast(IntegerType()),
    col("nom_arrondissement_communes"),
    col("code_insee_commune"),
    to_timestamp("timestamp").alias("timestamp")
)

print("🧹 Données normalisées (STAGING) :")
# df_clean.show(5)

# =======================================
# ECRITURE EN PARQUET (STAGING)
# =======================================
print(f"💾 Sauvegarde des données STAGING dans {STAGING_PATH}")

df_clean.write \
    .mode("overwrite") \
    .parquet(STAGING_PATH)

print("🎉 STAGING terminé : données prêtes pour Batch + Streaming")
spark.stop()
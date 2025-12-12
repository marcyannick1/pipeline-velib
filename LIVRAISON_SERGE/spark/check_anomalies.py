from pyspark.sql import SparkSession
from pyspark.sql.functions import col

spark = SparkSession.builder \
    .appName("CheckAnomalies") \
    .master("spark://spark-master:7077") \
    .getOrCreate()

STAGING = "hdfs://namenode:9000/velib/staging/"
df = spark.read.parquet(STAGING)

# Trouver les enregistrements où num_bikes_available > capacity
anomalies = df.filter(col("num_bikes_available") > col("capacity")) \
    .select("station_id", "name", "num_bikes_available", "capacity", "timestamp") \
    .orderBy(col("num_bikes_available") / col("capacity"), ascending=False) \
    .limit(10)

print("=== TOP 10 ANOMALIES (vélos > capacité) ===")
anomalies.show(truncate=False)

# Stats globales
total = df.count()
anomalies_count = df.filter(col("num_bikes_available") > col("capacity")).count()
print(f"\n📊 Total enregistrements: {total}")
print(f"⚠️  Anomalies: {anomalies_count} ({anomalies_count/total*100:.2f}%)")

spark.stop()

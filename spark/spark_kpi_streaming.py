from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *

spark = SparkSession.builder \
    .appName("VelibStreamingKPI") \
    .master("spark://spark-master:7077") \
    .getOrCreate()

spark.sparkContext.setLogLevel("WARN")

RAW = "hdfs://namenode:9000/velib/raw/"

schema = StructType([
    StructField("station_id", StringType()),
    StructField("name", StringType()),
    StructField("latitude", DoubleType()),
    StructField("longitude", DoubleType()),
    StructField("capacity", IntegerType()),
    StructField("num_bikes_available", IntegerType()),
    StructField("num_docks_available", IntegerType()),
    StructField("mechanical_bikes", IntegerType()),
    StructField("ebikes", IntegerType()),
    StructField("is_installed", StringType()),
    StructField("is_renting", StringType()),
    StructField("is_returning", StringType()),
    StructField("nom_arrondissement_communes", StringType()),
    StructField("code_insee_commune", StringType()),
    StructField("fetch_timestamp", StringType()),
    StructField("timestamp", StringType())
])

df = spark.readStream.schema(schema).json(RAW)

# =====================================================
# KPI GLOBAUX → STREAMING OK ✔️
# =====================================================

kpi_agg = df.groupBy().agg(
    sum("num_bikes_available").alias("bikes_available"),
    sum("mechanical_bikes").alias("mechanical_available"),
    sum("ebikes").alias("ebikes_available"),
    sum("num_docks_available").alias("free_slots"),
    (sum("num_bikes_available") / sum("capacity")).alias("occupation_rate")
)

# =====================================================
# KPI STATIONS PARTICULIÈRES ✔️
# =====================================================

# Stations cassées
kpi_broken = df.filter(
    (col("is_renting") == "0") | (col("is_returning") == "0")
)

# Stations fermées
kpi_closed = df.filter(
    (col("is_installed") != "OUI") | (col("capacity") == 0)
)

# Stations saturées (plein)
kpi_full = df.filter(col("num_bikes_available") == col("capacity"))

# Stations vides
kpi_empty = df.filter(col("num_bikes_available") == 0)

# =====================================================
# FONCTION D'ÉCRITURE MongoDB via foreachBatch ✔️
# =====================================================

def write_to_mongo(batch_df, batch_id, collection):
    batch_df.write \
        .format("mongodb") \
        .mode("overwrite") \
        .option("spark.mongodb.connection.uri", "mongodb://mongodb:27017/velib_kpi_streaming") \
        .option("spark.mongodb.database", "velib_kpi_streaming") \
        .option("spark.mongodb.collection", collection) \
        .save()

# =====================================================
# FOREACHBATCH : TOPS + KPI STATIQUES ✔️
# =====================================================

def save_tops(batch_df, batch_id):
    top_full = batch_df.orderBy(desc("num_bikes_available")).limit(10)
    top_empty = batch_df.orderBy(asc("num_bikes_available")).limit(10)
    top_ebikes = batch_df.orderBy(desc("ebikes")).limit(10)

    write_to_mongo(top_full, batch_id, "top_full")
    write_to_mongo(top_empty, batch_id, "top_empty")
    write_to_mongo(top_ebikes, batch_id, "top_ebikes")

def save_aggregates(batch_df, batch_id):
    write_to_mongo(batch_df, batch_id, "totals")

def save_broken(batch_df, batch_id):
    write_to_mongo(batch_df, batch_id, "stations_broken")

def save_closed(batch_df, batch_id):
    write_to_mongo(batch_df, batch_id, "stations_closed")

def save_full(batch_df, batch_id):
    write_to_mongo(batch_df, batch_id, "stations_full")

def save_empty(batch_df, batch_id):
    write_to_mongo(batch_df, batch_id, "stations_empty")

# =====================================================
# STREAMING STARTS ✔️
# =====================================================

# TOP 10
q1 = df.writeStream.foreachBatch(save_tops).outputMode("append").start()

# KPI globaux
q2 = kpi_agg.writeStream.foreachBatch(save_aggregates).outputMode("complete").start()

# Autres KPI
q3 = kpi_broken.writeStream.foreachBatch(save_broken).outputMode("append").start()
q4 = kpi_closed.writeStream.foreachBatch(save_closed).outputMode("append").start()
q5 = kpi_full.writeStream.foreachBatch(save_full).outputMode("append").start()
q6 = kpi_empty.writeStream.foreachBatch(save_empty).outputMode("append").start()

print("⚡ Streaming Vélib lancé (KPI enrichis → MongoDB)")
spark.streams.awaitAnyTermination()
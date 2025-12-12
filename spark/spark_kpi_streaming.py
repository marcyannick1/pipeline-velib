from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *

# ============================
# SPARK SESSION
# ============================
spark = SparkSession.builder \
    .appName("VelibStreamingKPI") \
    .master("spark://spark-master:7077") \
    .getOrCreate()

spark.sparkContext.setLogLevel("WARN")

RAW = "hdfs://namenode:9000/velib/raw/"

# ============================
# SCHEMA
# ============================
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

# ============================
# READ STREAM
# ============================
df = spark.readStream.schema(schema).json(RAW)

# ============================
# WRITE TO MONGO (GENERIC)
# ============================
def write_to_mongo(df, collection):
    df.write \
        .format("mongodb") \
        .mode("overwrite") \
        .option("spark.mongodb.connection.uri", "mongodb://mongodb:27017/velib_kpi_streaming") \
        .option("spark.mongodb.database", "velib_kpi_streaming") \
        .option("spark.mongodb.collection", collection) \
        .save()

# =====================================================
# FOREACHBATCH — KPI TEMPS RÉEL (ÉTAT ACTUEL)
# =====================================================
def process_realtime_kpi(batch_df, batch_id):

    if batch_df.isEmpty():
        return

    # 🔑 1️⃣ Dernier état par station
    latest = (
        batch_df
        .withColumn("ts", to_timestamp("timestamp"))
        .groupBy("station_id")
        .agg(
            max("ts").alias("ts"),
            first("name").alias("name"),
            first("latitude").alias("latitude"),
            first("longitude").alias("longitude"),
            first("capacity").alias("capacity"),
            first("num_bikes_available").alias("num_bikes_available"),
            first("num_docks_available").alias("num_docks_available"),
            first("mechanical_bikes").alias("mechanical_bikes"),
            first("ebikes").alias("ebikes"),
            first("is_installed").alias("is_installed"),
            first("is_renting").alias("is_renting"),
            first("is_returning").alias("is_returning"),
            first("nom_arrondissement_communes").alias("nom_arrondissement_communes")
        )
    )

    # ============================
    # KPI GLOBAUX
    # ============================
    kpi_totals = latest.groupBy().agg(
        sum("num_bikes_available").alias("bikes_available"),
        sum("mechanical_bikes").alias("mechanical_available"),
        sum("ebikes").alias("ebikes_available"),
        sum("num_docks_available").alias("free_slots"),
        (sum("num_bikes_available") / sum("capacity")).alias("occupation_rate")
    )

    # ============================
    # TOPS
    # ============================
    top_full = latest.orderBy(desc("num_bikes_available")).limit(10)
    top_empty = latest.orderBy(asc("num_bikes_available")).limit(10)
    top_ebikes = latest.orderBy(desc("ebikes")).limit(10)

    # ============================
    # STATUTS
    # ============================
    stations_broken = latest.filter(
        (col("is_renting") != "OUI") | (col("is_returning") != "OUI")
    )

    stations_closed = latest.filter(
        (col("is_installed") != "OUI") | (col("capacity") == 0)
    )

    stations_full = latest.filter(
        col("num_bikes_available") == col("capacity")
    )

    stations_empty = latest.filter(
        col("num_bikes_available") == 0
    )

    # ============================
    # WRITE MONGO
    # ============================
    write_to_mongo(kpi_totals, "totals")
    write_to_mongo(top_full, "top_full")
    write_to_mongo(top_empty, "top_empty")
    write_to_mongo(top_ebikes, "top_ebikes")
    write_to_mongo(stations_broken, "stations_broken")
    write_to_mongo(stations_closed, "stations_closed")
    write_to_mongo(stations_full, "stations_full")
    write_to_mongo(stations_empty, "stations_empty")

# ============================
# START STREAMING
# ============================
query = (
    df.writeStream
    .foreachBatch(process_realtime_kpi)
    .outputMode("append")
    .start()
)

print("⚡ Streaming Vélib corrigé — KPI temps réel cohérents → MongoDB")
spark.streams.awaitAnyTermination()
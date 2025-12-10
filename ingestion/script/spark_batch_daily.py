from pyspark.sql import SparkSession
from pyspark.sql.functions import *
import datetime

spark = SparkSession.builder \
    .appName("velib_daily_aggregations") \
    .master("spark://spark-master:7077") \
    .config("spark.mongodb.output.uri", "mongodb://mongodb:27017/velibdb.kpi_daily") \
    .getOrCreate()

today = datetime.datetime.now().strftime('%Y/%m/%d')
path = f"hdfs://namenode:9000/data/velib/raw/{today}/*"

df = spark.read.json(path)

df = df.select(
    col("station_id"),
    col("name"),
    col("capacity").cast("int"),
    col("num_bikes_available").cast("int"),
    col("num_docks_available").cast("int"),
    col("mechanical_bikes").cast("int"),
    col("ebikes").cast("int"),
    col("arrondissement"),
    col("inserted_at").cast("timestamp")
)

df = df.withColumn("hour", hour("inserted_at"))

# === KPIs HEURES ===
kpi_hourly = df.groupBy("hour").agg(
    avg("num_bikes_available").alias("avg_bikes"),
    avg(col("num_bikes_available") / col("capacity")).alias("occupation_rate")
)

# === KPIs ARRONDISSEMENT ===
kpi_arr = df.groupBy("arrondissement").agg(
    avg("num_bikes_available").alias("avg_bikes"),
    avg(col("num_bikes_available") / col("capacity")).alias("occupation_rate")
)

# === KPI GLOBAL JOURNALIER ===
kpi_daily = df.agg(
    avg("num_bikes_available").alias("avg_bikes_global"),
    avg(col("num_bikes_available")/col("capacity")).alias("occupation_rate_global"),
    min("num_bikes_available").alias("min_bikes"),
    max("num_bikes_available").alias("max_bikes")
)

kpi_daily.write.format("mongodb").mode("append").save()
kpi_hourly.write.format("mongodb").mode("append").save()
kpi_arr.write.format("mongodb").mode("append").save()

spark.stop()

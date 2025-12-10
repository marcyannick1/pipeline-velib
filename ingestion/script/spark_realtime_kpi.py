from pyspark.sql import SparkSession
from pyspark.sql.functions import col, sum, avg

spark = SparkSession.builder \
    .appName("velib_realtime_kpi") \
    .master("spark://spark-master:7077") \
    .config("spark.mongodb.input.uri", "mongodb://mongodb:27017/velibdb.stations_realtime") \
    .config("spark.mongodb.output.uri", "mongodb://mongodb:27017/velibdb.kpi_realtime") \
    .getOrCreate()

df = spark.read.format("mongodb").load()

global_kpi = df.agg(
    sum("num_bikes_available").alias("total_bikes"),
    sum("mechanical_bikes").alias("total_mechanical"),
    sum("ebikes").alias("total_electrical"),
    sum("capacity").alias("total_capacity"),
    sum("num_docks_available").alias("total_docks")
)

global_kpi = global_kpi.withColumn(
    "occupation_rate",
    col("total_bikes") / col("total_capacity")
)

top_full = df.orderBy(col("num_bikes_available").desc()).limit(10)
top_empty = df.orderBy(col("num_bikes_available")).limit(10)
broken = df.filter((col("is_renting") == False) | (col("is_returning") == False))

global_kpi.write.format("mongodb").mode("overwrite").save()
top_full.write.format("mongodb").mode("overwrite").save()
top_empty.write.format("mongodb").mode("overwrite").save()
broken.write.format("mongodb").mode("overwrite").save()

spark.stop()

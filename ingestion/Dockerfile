FROM python:3.10

WORKDIR /app

COPY . /app

RUN pip install requests hdfs

CMD ["python3", "fetch_velib_api.py"]
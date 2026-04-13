FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "until pg_isready -h postgres_db -p 5432 -U magni; do echo 'Aguardando banco...'; sleep 2; done; python seed.py && uvicorn app:app --host 0.0.0.0 --port 8000"]
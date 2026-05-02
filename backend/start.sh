#!/bin/sh
set -e

if [ "${RUN_SEED_DB:-true}" = "true" ]; then
  python seed.py
fi

exec uvicorn app:app --host 0.0.0.0 --port 8000
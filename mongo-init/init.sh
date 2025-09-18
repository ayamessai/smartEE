#!/bin/bash
set -e

# Only restore if database doesn't exist
if [ ! -d "/data/db/eco_electro" ]; then
  echo "Restoring database from dump.archive..."
  mongorestore --archive=/docker-entrypoint-initdb.d/dump.archive --nsInclude=eco_electro.* --drop
else
  echo "Database already exists, skipping restore."
fi

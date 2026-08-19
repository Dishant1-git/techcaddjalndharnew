#!/bin/bash
# Runs automatically, once, the first time the mysql container starts with an
# empty data volume (see docker-entrypoint-initdb.d in the official MySQL
# image docs). Never runs again after that, so it's safe to leave in place —
# it will not touch a database that already exists.
set -euo pipefail

mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" <<-EOSQL
  CREATE DATABASE IF NOT EXISTS TechcaddJal
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE DATABASE IF NOT EXISTS techcadd_cms
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

  -- Full privileges on their own database only, not on each other's and
  -- never on mysql.* — both apps auto-create/alter their own tables on boot.
  CREATE USER IF NOT EXISTS 'techcadd_cms'@'%' IDENTIFIED BY '${CMS_DB_PASSWORD}';
  GRANT ALL PRIVILEGES ON techcadd_cms.* TO 'techcadd_cms'@'%';

  CREATE USER IF NOT EXISTS 'techcadd_site'@'%' IDENTIFIED BY '${SITE_DB_PASSWORD}';
  GRANT ALL PRIVILEGES ON TechcaddJal.* TO 'techcadd_site'@'%';

  FLUSH PRIVILEGES;
EOSQL

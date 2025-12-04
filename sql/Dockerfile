#FROM postgres:alpine
#COPY filewise.sql /docker-entrypoint-initdb.d/01-schema.sql
#COPY ../backend/migrations/category-seeder.sql /docker-entrypoint-initdb.d/02-categories.sql

FROM postgres:alpine
COPY sql/filewise.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY backend/migrations/category-seeder.sql /docker-entrypoint-initdb.d/02-categories.sql
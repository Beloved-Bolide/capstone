FROM postgres:alpine
COPY filewise.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY categories-seeder.sql /docker-entrypoint-initdb.d/02-categories.sql
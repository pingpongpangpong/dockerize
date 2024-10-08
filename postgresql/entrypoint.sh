#!/bin/bash

service postgresql start

QUERY="sudo -u postgres psql -c"
$QUERY "create user $DB_USER with password '$DB_PASSWORD';"
$QUERY "create database $DB_NAME owner $DB_USER;"
$QUERY "alter role $DB_USER set client_encoding to 'utf8';"
$QUERY "alter role $DB_USER set default_transaction_isolation to 'read committed';"
$QUERY "alter role $DB_USER set timezone to 'UTC';"
$QUERY "grant all privileges on database $DB_NAME to $DB_USER;"

service postgresql stop

echo "host    $DB_NAME      $DB_USER      0.0.0.0/0          trust" >> /etc/postgresql/12/main/pg_hba.conf
sed -i 's/local   all             all                                     peer/local   all             all                                     trust/g' /etc/postgresql/12/main/pg_hba.conf
echo "listen_addresses = 'postgresql'" >> /etc/postgresql/12/main/postgresql.conf

sudo -u postgres /usr/lib/postgresql/12/bin/postgres -D /var/lib/postgresql/12/main -c config_file=/etc/postgresql/12/main/postgresql.conf

#!/usr/bin/env bash
service postgresql start
su - postgres -c "psql -c \"CREATE USER cyberuser WITH PASSWORD 'cyberpass';\""
su - postgres -c "psql -c \"CREATE DATABASE cyberlab OWNER cyberuser;\""
su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE cyberlab TO cyberuser;\""
su - postgres -c "psql -d cyberlab -c \"GRANT ALL ON SCHEMA public TO cyberuser;\""

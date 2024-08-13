#!/bin/bash

echo "DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': '$DB_NAME',
        'USER': '$DB_USER',
        'PASSWORD': '$DB_PASSWORD',
        'HOST': 'postgresql',
        'PORT': '5432',
    }
}

ALLOWED_HOSTS = ['*', 'localhost', '127.0.0.1']
" >> /root/src/pingpong/settings.py

cd /root/src

python3 manage.py makemigrations
python3 manage.py migrate

#gunicorn -k uvicorn.workers.UvicornWorker \
#	--workers 3 \
#	--bind 0.0.0.0:8000 \
#	pingpong.asgi:application

daphne --bind 0.0.0.0 --port 8000 pingpong.asgi:application

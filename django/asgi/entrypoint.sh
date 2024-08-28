#!/bin/bash

cd /root/src

echo "
INSTALLED_APPS = [
    'daphne',
    'game',
	'social_django',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

DATABASES = {
    'default': {
        'ENGINE': '$DB_ENGINE',
        'NAME': '$DB_NAME',
        'USER': '$DB_USER',
        'PASSWORD': '$DB_PASSWORD',
        'HOST': '$DB_HOST',
        'PORT': '$DB_PORT',
    }
}" >> /root/src/pingpong/settings.py

nc -vz $WSGI_HOST $WSGI_PORT > /dev/null 2>&1
while [ $? -eq 1 ]
do
	sleep 1
	echo "loading...."
	nc -vz $WSGI_HOST $WSGI_PORT > /dev/null 2>&1
done

python3 manage.py makemigrations
python3 manage.py makemigrations game
python3 manage.py migrate
daphne --bind 0.0.0.0 --port 8000 pingpong.asgi:application

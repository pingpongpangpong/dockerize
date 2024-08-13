FROM ubuntu:20.04
ARG  DEBIAN_FRONTEND=noninteractive
ENV  TZ=Asia/Seoul
ENV  DJANGO_SETTINGS_MODULE=pingpong.settings

RUN  apt-get update
RUN  apt-get install -y python3-dev python3-pip libpq-dev
RUN  pip3 install django daphne channels psycopg2-binary

COPY ./src /root/src

CMD ["/bin/bash", "/root/src/entrypoint.sh"]

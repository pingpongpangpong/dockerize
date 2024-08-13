#!/bin/bash

echo "
map \$http_upgrade \$connection_upgrade {
	default upgrade;
	\'\' close;
}

upstream websocket {
	server django:8000;
}

server {
	listen 80;
	server_name pingpong;
	index index.html;
	root /var/www/html;

	location / {
		try_files \$uri \$uri/ =404;
	}

	location /ws {
                proxy_pass http://websocket;
		proxy_http_version 1.1;
                proxy_set_header Upgrade \$http_upgrade;
                proxy_set_header Connection \"Upgrade\";
                proxy_set_header Host \$host;
	}
}" > /etc/nginx/sites-available/default

nginx -g "daemon off;"

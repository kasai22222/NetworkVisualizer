#!/bin/bash

docker build -t networkvisual .
docker run -p 3000:8080 -v /var/log/snort3/alert_json.txt:/build/alert_json.txt -it --rm networkvisual:latest

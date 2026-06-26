#!/bin/sh
set -eu

: "${PORT:=8080}"
: "${KROKI_UPSTREAM:=http://kroki.railway.internal:8000}"

envsubst '${PORT} ${KROKI_UPSTREAM}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'

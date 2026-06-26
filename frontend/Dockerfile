FROM nginx:1.27-alpine

RUN apk add --no-cache gettext

COPY frontend /usr/share/nginx/html
COPY deploy/nginx/renderrig.railway.conf.template /etc/nginx/templates/default.conf.template
COPY deploy/railway/start-frontend.sh /start-frontend.sh

RUN chmod +x /start-frontend.sh

ENV PORT=8080
ENV KROKI_UPSTREAM=http://kroki.railway.internal:8000

CMD ["/start-frontend.sh"]

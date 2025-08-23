FROM nginx:1.27-alpine

# Paths are relative to the build context (./frontend)
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY static /usr/share/nginx/html

EXPOSE 80

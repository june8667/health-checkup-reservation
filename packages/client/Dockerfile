FROM node:18-alpine AS builder

WORKDIR /app

# API URL 하드코딩 (Cloudtype 배포용)
ENV VITE_API_URL=https://port-0-health-checkup-reservation-server-m56ijle8e6de9b5d.sel4.cloudtype.app/api

# 루트 package.json 복사
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/client/package*.json ./packages/client/

# 의존성 설치
RUN npm install

# 소스 복사
COPY packages/shared ./packages/shared
COPY packages/client ./packages/client

# shared 빌드
RUN npm run build -w @health-checkup/shared

# client 빌드
RUN npm run build -w @health-checkup/client

# 프로덕션 이미지
FROM nginx:alpine

# nginx 권한 문제 해결
RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp \
    && chmod -R 777 /var/cache/nginx \
    && chmod -R 777 /var/run \
    && chmod -R 777 /var/log/nginx

COPY --from=builder /app/packages/client/dist /usr/share/nginx/html
COPY packages/client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

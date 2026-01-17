FROM node:18-alpine AS builder

WORKDIR /app

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

COPY --from=builder /app/packages/client/dist /usr/share/nginx/html
COPY packages/client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

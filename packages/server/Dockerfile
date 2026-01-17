FROM node:18-alpine

WORKDIR /app

# 루트 package.json 복사
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/server/package*.json ./packages/server/

# 의존성 설치
RUN npm install

# 소스 복사
COPY packages/shared ./packages/shared
COPY packages/server ./packages/server

# shared 빌드
RUN npm run build -w @health-checkup/shared

# server 빌드
RUN npm run build -w @health-checkup/server

WORKDIR /app/packages/server

EXPOSE 4000

CMD ["node", "dist/app.js"]

# 1단계: 빌드
FROM node:20 AS builder

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

# 2단계: 실행
FROM node:20

WORKDIR /app

COPY --from=builder /app ./

RUN npm install -g serve

# Remix 앱은 remix-serve로 실행함
CMD ["npm", "run", "start"]

EXPOSE 3000

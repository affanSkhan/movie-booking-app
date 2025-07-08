# Dockerfile for Bun + Express backend on Fly.io
FROM oven/bun:1.1.13

WORKDIR /app
COPY . .

RUN bun install

EXPOSE 3001

CMD ["bun", "run", "index.ts"] 
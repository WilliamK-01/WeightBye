FROM node:20-alpine AS builder
WORKDIR /app
ENV DATABASE_URL=file:../data/localweight.db
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_URL=file:../data/localweight.db
COPY --from=builder /app/package.json /app/package-lock.json* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/data ./data
RUN mkdir -p /app/data
EXPOSE 3000
CMD ["npm", "run", "start"]

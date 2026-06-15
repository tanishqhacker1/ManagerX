FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/
RUN npm install
COPY . ./
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/client/dist ./client/dist
RUN npm install --production

EXPOSE 4000
ENV NODE_ENV=production
WORKDIR /app/server
CMD ["node", "dist/index.js"]

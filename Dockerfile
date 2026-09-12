# Build stage
FROM node:alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

RUN chmod -R 777 *
RUN npm run build

# Serve stage
FROM node:alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist

EXPOSE 4173

USER 1001 
CMD ["serve", "-s", "dist", "-l", "4173"]
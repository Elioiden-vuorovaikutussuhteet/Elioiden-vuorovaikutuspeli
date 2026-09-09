FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod -R 777 *

RUN npm run build

# Give group 0 ownership and full read/write/execute access across the whole directory
RUN chgrp -R 0 /app && chmod -R g=u /app

# Vite preview defaults to port 4173 (or 3000 if configured in vite.config)
EXPOSE 4173

# Vite preview binding to all interfaces on port 4173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
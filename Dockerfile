FROM node:22-bullseye

WORKDIR /usr/src/app

# Install PostgreSQL client for pg_isready command
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Make startup script executable
RUN chmod +x scripts/startup.sh

# Use the startup script to run migrations before starting the app
ENTRYPOINT ["./scripts/startup.sh"]
CMD ["npm", "run", "start:prod"]

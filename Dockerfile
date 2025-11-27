# Use Node.js LTS Alpine image (latest patch version)
FROM node:20.18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build the project
RUN npm run build

# Production stage
FROM node:20.18-alpine

WORKDIR /app

# Copy built files and package files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Create a non-root user
RUN addgroup -S mcp && adduser -S mcp -G mcp
USER mcp

# Entry point
ENTRYPOINT ["node", "dist/server.js"]

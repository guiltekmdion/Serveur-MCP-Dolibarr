# Use Node.js 22 LTS Alpine image (November 2025 standard)
FROM node:22-alpine AS builder

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
FROM node:22-alpine

WORKDIR /app

# Disable dotenv promotional messages that break STDIO/MCP protocol
ENV DOTENV_CONFIG_QUIET=true

# Copy built files and package files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Create a non-root user
RUN addgroup -S mcp && adduser -S mcp -G mcp
USER mcp

# Entry point
ENTRYPOINT ["node", "dist/server.js"]

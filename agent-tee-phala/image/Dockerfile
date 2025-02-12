FROM --platform=linux/amd64 node:23-slim

# Install wget and other build dependencies
RUN apt-get update && apt-get install -y wget

# Install pnpm directly instead of using corepack
RUN wget -qO /bin/pnpm "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linuxstatic-x64" && \
    chmod +x /bin/pnpm

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
# Copy patched dependencies
COPY patches/ ./patches
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy source code
COPY . .

EXPOSE 4000

ENV PORT=4000

# Build TypeScript
RUN pnpm build
CMD ["pnpm", "start"]
FROM --platform=linux/amd64 node:18-alpine

# Install pnpm directly instead of using corepack
RUN wget -qO /bin/pnpm "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linuxstatic-x64" && \
    chmod +x /bin/pnpm

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy source code
COPY . .

EXPOSE 4000

ENV PORT=4000

# Build TypeScript
RUN pnpm build
ENV DSTACK_SIMULATOR_ENDPOINT="http://host.docker.internal:8090"
CMD ["pnpm", "start"]
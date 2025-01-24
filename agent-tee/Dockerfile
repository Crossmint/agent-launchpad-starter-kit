FROM node:18-alpine

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm build

EXPOSE 4000

ENV PORT=4000
ENV DSTACK_SIMULATOR_ENDPOINT="http://localhost:8090"

CMD ["pnpm", "start"]
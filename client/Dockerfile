# syntax=docker/dockerfile:1

# ----------- Build Stage -----------
ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app

COPY --link package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY --link public ./public
COPY --link src ./src
COPY --link tsconfig.json ./tsconfig.json

RUN npm run build

# ----------- Production Stage -----------
FROM nginx:alpine AS final
WORKDIR /usr/share/nginx/html

# Copy build output from builder
COPY --from=builder /app/build ./

# Add custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
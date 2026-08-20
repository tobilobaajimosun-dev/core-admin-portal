#Build Stage 
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json .npmrc ./
# NPM_TOKEN (private Hugeicons registry) is passed as a BuildKit secret so it is
# only present for this command and never written to an image layer. .npmrc reads
# it via ${NPM_TOKEN}. Local dev needs no change — the token is in the shell env.
RUN --mount=type=secret,id=npm_token \
    NPM_TOKEN="$(cat /run/secrets/npm_token 2>/dev/null)" npm ci

COPY . .
RUN npm run build -- --configuration production

#Runtime level stage
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist/admin-portal/browser  /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]

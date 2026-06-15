# ManagerX

A full-stack TypeScript orchestration platform scaffold for managing AI agents, tasks, and budgets.

## Structure

- `server/` - Node.js + Express API
- `client/` - React + Vite dashboard UI

## Setup

From the repo root:

```bash
cd /workspaces/ManagerX
npm install
```

Then in two terminals:

```bash
cd server && npm run dev
cd client && npm run dev
```

Open the client at `http://localhost:5173`.

## Production deployment

This project includes a combined production server that serves the built React dashboard and the API from the same origin.

### Build and run

```bash
npm run build
npm start
```

Then visit `http://localhost:4000`.

### Deploy to `tanishq1-is.a.dev`

1. Point the subdomain `tanishq1-is.a.dev` to your host's public IP address using DNS.
2. Build the project with `npm run build`.
3. Start the server with `npm start`.
4. Open `https://tanishq1-is.a.dev` in your browser once the host is reachable.

If you deploy with Docker:

```bash
docker build -t managerx .
docker run -p 4000:4000 managerx
```

## HTTPS deployment with NGINX and Certbot

The provided `docker-compose.yml` includes an `nginx` reverse proxy and a `certbot` service for Let's Encrypt certificate issuance.

1. Point `tanishq1-is.a.dev` to your host IP.
2. Start the app and proxy:

```bash
docker compose up -d --build managerx nginx
```

3. Request certificates:

```bash
docker compose run --rm certbot
```

4. Reload NGINX:

```bash
docker compose exec nginx nginx -s reload
```

5. Open `https://tanishq1-is.a.dev`.

If the certificate issuance fails, check that port `80` is reachable and the DNS record is correct.

Make sure your host firewall allows ports `80` and `443` and the domain resolves to the server.

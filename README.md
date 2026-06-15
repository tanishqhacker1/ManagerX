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

If you want to use NGINX as a reverse proxy for `tanishq1-is.a.dev`, use the provided `docker-compose.yml` and `nginx.conf`.

```bash
docker compose up --build
```

Make sure your host firewall allows port `80` and the domain resolves to the correct server.

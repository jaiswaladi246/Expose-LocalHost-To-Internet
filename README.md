# DevOps Shack — Node.js + ngrok Deployment Lab

An interactive Node.js + Express deployment demo branded for **DevOps Shack**. The UI visualizes how a local application becomes publicly reachable through an ngrok tunnel and includes a live backend health/status tester.

## Features

- Modern DevOps Shack branded responsive UI
- Animated deployment terminal
- Local App → ngrok → Internet architecture visualization
- Interactive technology cards and hover/tilt effects
- Scroll reveal animations and live counters
- Real `/api/status` request tester with latency, uptime and server time
- Copyable curl command
- Mobile navigation
- Reduced-motion accessibility support
- `/api/status` and `/api/health` endpoints
- Environment-aware `PORT` support

## Run locally

```bash
npm install
npm start
```

Open:

```text
http://localhost:3000
```

Test the API:

```bash
curl http://localhost:3000/api/status
```

## Expose through ngrok

With the Node.js application running on port 3000:

```bash
ngrok http 3000
```

Open the HTTPS forwarding URL provided by ngrok.

## Docker

```bash
docker build -t devops-shack-ngrok-demo .
docker run --rm -p 3000:3000 devops-shack-ngrok-demo
```

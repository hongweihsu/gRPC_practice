# gRPC_practice

## Quick Start

`Call failed: Http response at 400 or 500 level, http status code: 0` usually means the browser could not reach the gRPC-Web proxy at `http://localhost:8080`.

Run these 3 processes in order:

1. Backend gRPC server (port 50051)

```bash
cd backend
npm start
```

2. Envoy gRPC-Web proxy (port 8080)

```bash
docker run --rm -p 8080:8080 -v /c/Users/hsuh01/Desktop/Playgrounds/gRPC_practice/infra/envoy.yaml:/etc/envoy/envoy.yaml envoyproxy/envoy:v1.30-latest
```

### No Docker Proxy Option (Windows)

If you do not want Docker, use `grpcwebproxy` directly:

1. Download grpcwebproxy

```powershell
powershell -ExecutionPolicy Bypass -File .\infra\scripts\download-grpcwebproxy.ps1
```

2. Start grpcwebproxy on `localhost:8080`

```powershell
powershell -ExecutionPolicy Bypass -File .\infra\scripts\start-grpcwebproxy.ps1
```

This proxy forwards browser gRPC-Web requests to backend gRPC at `localhost:50051`.

### One-Command Startup (Windows, No Docker)

After downloading grpcwebproxy, you can start all 3 services with one command:

```powershell
powershell -ExecutionPolicy Bypass -File .\infra\scripts\start-all.ps1
```

Stop all services later with:

```powershell
powershell -ExecutionPolicy Bypass -File .\infra\scripts\stop-all.ps1
```

3. Angular frontend

```bash
cd frontend/grpc-web-demo
npm start
```

Then open `http://localhost:4200` and test the `Call SayHello` button.

## Notes

- This repo uses gRPC-Web on the frontend, so a proxy is required between browser and gRPC server.
- If Docker is unavailable, use the PowerShell grpcwebproxy scripts in `infra/scripts`.

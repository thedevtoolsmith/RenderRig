# Deployment

[Back to the README](../README.md) · [Using RenderRig](usage.md)

## Docker Compose

Before you start, make sure that:

- Docker is running.
- Docker Compose is installed.
- You have a local clone of this repository.

### Start the services

1. Open a terminal in the root directory of the repository.
2. Run this command:

   ```bash
   docker compose up -d
   ```

3. Open [http://127.0.0.1:8080](http://127.0.0.1:8080).

RenderRig automatically uses `http://127.0.0.1:8080/kroki` as the Kroki server URL. It is not necessary to change this URL.

The [Compose configuration](../docker-compose.yml) starts nginx and Kroki:

- nginx supplies the RenderRig frontend.
- Kroki renders the diagrams. The default configuration starts three Kroki replicas. Each replica is a separate Kroki container.
- The nginx proxy distributes the requests between them.

See the [nginx configuration](../deploy/nginx/renderrig.local.conf).

### Change the number of replicas

To start five Kroki replicas, run this command from the root directory of the repository:

```bash
KROKI_REPLICAS=5 docker compose up -d
```

Use a different value for `KROKI_REPLICAS` if you need a different number of replicas.

### Stop the services

To stop and remove the containers and network, run this command from the root directory of the repository:

```bash
docker compose down
```

### Diagram language support

Some diagram languages need additional Kroki services. Examples include Mermaid, BPMN, and Excalidraw. The default configuration in this repository does not include these services.

See [Kroki's installation guide](https://docs.kroki.io/kroki/setup/install/) for the available libraries and additional containers. As an alternative, connect RenderRig to a Kroki server that has the necessary services.


## Podman Compose

Before you start, make sure that:

- Podman is running.
- `podman-compose` is installed.
- You have a local clone of this repository.

### Start the services

1. Open a terminal in the root directory of the repository.
2. Run this command to use the [Podman configuration](../podman-compose.yml):

   ```bash
   podman-compose -f podman-compose.yml up -d
   ```

3. Open [http://127.0.0.1:8080](http://127.0.0.1:8080).

RenderRig automatically uses `http://127.0.0.1:8080/kroki` as the Kroki server URL.

This configuration uses the same nginx configuration as Docker. The DNS resolver address is `127.0.0.11`. This address is specific to Docker.

If nginx cannot find Kroki on the Podman network, check the DNS configuration for that network.

### Change the number of replicas

To start five Kroki replicas, run this command from the root directory of the repository:

```bash
KROKI_REPLICAS=5 podman-compose -f podman-compose.yml up -d
```

Use a different value for `KROKI_REPLICAS` if you need a different number of replicas.

### Stop the services

To stop and remove the containers and network, run this command from the root directory of the repository:

```bash
podman-compose -f podman-compose.yml down
```

## Frontend only

The RenderRig frontend uses HTML, CSS, and vanilla JavaScript. It does not need a build step.

Before you start, make sure that Python 3 is installed. You must also have a local clone of this repository.

1. Open a terminal in the root directory of the repository.
2. Run this command:

   ```bash
   python3 -m http.server 5173 --directory frontend
   ```

3. Open [http://127.0.0.1:5173](http://127.0.0.1:5173).
4. Open **Kroki Configuration**.
5. Set **Kroki Server URL** to your Kroki server URL, or use `https://kroki.io` for the public service.

RenderRig sends your diagram source to the selected Kroki server. That server must permit browser requests from the frontend origin.

A static server does not supply the `/kroki` proxy. Thus, the default Kroki server URL does not work with this configuration.

As an alternative, open [frontend/index.html](../frontend/index.html) directly in a browser. Without a web origin, RenderRig uses `https://kroki.io` as the default Kroki server URL.

Browser restrictions can prevent some functions when you open a local file. Use HTTP to prevent these local-file restrictions.

The repository includes all frontend fonts and application files. RenderRig supplies these files locally.

See [Using RenderRig](usage.md) for timeout settings, diagnostics, and instructions to share diagrams.

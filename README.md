# RenderRig

RenderRig is a vanilla HTML/CSS/JavaScript frontend for editing and rendering diagrams with [Kroki](https://kroki.io/).

It serves app assets locally (including fonts and favicon) and can target either a local Kroki backend (recommended) or a remote Kroki instance.

## Current Capabilities

- Auto-rendering diagram preview (no render button)
- Kroki server URL input
- Custom theme-aware diagram type dropdown (includes `Auto Detect`)
- Auto-detection with candidate validation
- Dynamic export/copy formats based on selected diagram type support
- Clipboard Kroki URL import:
  - Auto-import on page load when source is empty or built-in sample text
  - Command Palette action: `Import Kroki URL from clipboard`
- Copy actions:
  - Copy diagram in supported formats
  - Copy image link (direct SVG Kroki GET URL; shown only when the diagram type supports SVG)
  - Copy editable RenderRig link (`#state=...`)
- Export actions:
  - Export diagram in supported formats
- Focus mode:
  - `Cmd/Ctrl + ;` to enter/exit focus mode
  - `Esc` exits focus mode
  - Entry hint toast
  - Mobile/tablet top-right focus exit button
- Options menu:
  - Debug mode
  - Configurable request timeout (seconds)
- Debug panel shows:
  - request type
  - endpoint
  - raw request
  - timeout value
  - last request duration
  - auto-detect details

## Request Timeout Behavior

- Timeout is enforced for Kroki backend requests (POST render, GET fallback, health checks).
- If elapsed time exceeds configured timeout:
  - request is cancelled
  - render status leaves `Rendering...`
  - error message is shown

## Keyboard Shortcuts

Uses `Cmd` on macOS and `Ctrl` on non-macOS:

- `Cmd/Ctrl + K`: Command Palette
- `Cmd/Ctrl + ;`: Focus mode
- `Cmd/Ctrl + J`: Copy menu
- `Cmd/Ctrl + H`: Download menu
- `Cmd/Ctrl + G`: Theme menu
- `Cmd/Ctrl + O`: Options menu

## Default Kroki Server URL

- When hosted over `http/https`, RenderRig auto-populates the Kroki server URL as:
  - `<current-origin>/kroki`
- If the page is opened without a valid web origin (for example `file://`), it falls back to:
  - `https://kroki.io`

## Run Entire Stack Locally (Frontend + Kroki)

This repository now includes both Docker Compose and Podman Compose setups.

The local container stack starts multiple Kroki instances behind nginx. The frontend still talks to a single proxied URL (`/kroki`), and nginx load-balances those requests across however many Kroki replicas you configure.

### Docker Compose

```bash
docker compose up -d
```

Then open: [http://127.0.0.1:8080](http://127.0.0.1:8080)

In RenderRig, set **Kroki Server URL** to:

- `http://127.0.0.1:8080/kroki`

Note: when opened via `http://127.0.0.1:8080`, RenderRig auto-fills this value by default.

Docker routing detail:

- Frontend requests go to `http://127.0.0.1:8080/kroki`
- nginx in the `renderrig` container distributes traffic across the `kroki` service replicas
- nginx refreshes Docker DNS for `kroki` automatically
- nginx will retry another Kroki container on upstream timeout / 502 / 503 / 504

To change the number of Kroki containers, set `KROKI_REPLICAS` when starting the stack:

```bash
KROKI_REPLICAS=5 docker compose up -d
```

Stop:

```bash
docker compose down
```

### Podman Compose

```bash
podman-compose -f podman-compose.yml up -d
```

Then open: [http://127.0.0.1:8080](http://127.0.0.1:8080)

In RenderRig, set **Kroki Server URL** to:

- `http://127.0.0.1:8080/kroki`

Note: when opened via `http://127.0.0.1:8080`, RenderRig auto-fills this value by default.

Podman routing detail:

- Frontend requests go to `http://127.0.0.1:8080/kroki`
- nginx in the `renderrig` container distributes traffic across the `kroki` service replicas
- nginx refreshes Docker DNS for `kroki` automatically
- nginx will retry another Kroki container on upstream timeout / 502 / 503 / 504

To change the number of Kroki containers, set `KROKI_REPLICAS` when starting the stack:

```bash
KROKI_REPLICAS=5 podman-compose -f podman-compose.yml up -d
```

Stop:

```bash
podman-compose -f podman-compose.yml down
```

## Run Frontend Only

You can also run frontend only without containers:

1. Open `frontend/index.html` directly in your browser.

If your browser restricts local file behavior, run a simple static server instead:

```bash
cd frontend
python3 -m http.server 5173
```

Then open: [http://127.0.0.1:5173](http://127.0.0.1:5173)

## External Requests

RenderRig no longer depends on CDN-hosted fonts/assets.

The only runtime network requests made by the app are to the configured Kroki backend (render requests, GET fallback requests, and health/reachability checks).

## Clipboard Kroki URL Import Notes

- Import supports standard Kroki GET render URLs and decodes source from the URL payload.
- Clipboard import requires `navigator.clipboard.readText` support and browser deflate decode support (`DecompressionStream`).
- If startup auto-import cannot read or decode clipboard contents, it fails silently by design.

## Repository Layout

```text
.
├── AGENTS.md
├── README.md
├── docker-compose.yml
├── podman-compose.yml
├── deploy/
│   └── nginx/
│       └── renderrig.local.conf
└── frontend/
    ├── app.js
    ├── constants.js
    ├── detector.js
    ├── index.html
    ├── styles.css
    └── theme.js
```

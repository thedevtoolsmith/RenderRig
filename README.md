# RenderRig

RenderRig is a vanilla HTML/CSS/JavaScript frontend for editing and rendering diagrams with [Kroki](https://kroki.io/).

## Current Capabilities

- Auto-rendering diagram preview (no render button)
- Kroki server URL input
- Custom theme-aware diagram type dropdown (includes `Auto Detect`)
- Auto-detection with candidate validation
- Dynamic export/copy formats based on selected diagram type support
- Copy actions:
  - Copy diagram in supported formats
  - Copy editable RenderRig link (`#state=...`)
  - Copy markdown snippet
- Export actions:
  - Export diagram in supported formats
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
- `Cmd/Ctrl + J`: Copy menu
- `Cmd/Ctrl + H`: Download menu
- `Cmd/Ctrl + G`: Theme menu
- `Cmd/Ctrl + O`: Options menu

## Run Locally

You can run it **without starting a server**:

1. Open `frontend/index.html` directly in your browser.

If your browser restricts local file behavior, run a simple static server instead:

```bash
cd frontend
python3 -m http.server 5173
```

Then open: [http://127.0.0.1:5173](http://127.0.0.1:5173)

## Kroki Backend

Use public Kroki:
- `https://kroki.io`

Or run local Kroki (example with Docker):

```bash
docker run --rm -p 8000:8000 yuzutech/kroki
```

Then set server URL in RenderRig to:
- `http://127.0.0.1:8000`

## Repository Layout

```text
.
├── AGENTS.md
├── README.md
└── frontend/
    ├── app.js
    ├── constants.js
    ├── detector.js
    ├── index.html
    ├── styles.css
    └── theme.js
```

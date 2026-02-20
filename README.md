# RenderRig

RenderRig is a local-first platform for working with the [Kroki](https://kroki.io/) diagram rendering backend through a lightweight vanilla HTML/JavaScript frontend.

The project is designed to:

- Provide a simple browser UI for submitting diagram source text to Kroki and previewing results.
- Support running both frontend and backend locally with either Docker or Podman.
- Add an MCP server in the future so LLM tools can interact with Kroki through this repository.

## Project Status

Initial documentation and repository bootstrap.

Planned next steps:

- Add frontend app (`index.html`, `app.js`, styles, and static assets).
- Add container setup for local backend and frontend orchestration.
- Add MCP server implementation and tool definitions.

## Goals

- Keep the frontend minimal and dependency-light (vanilla HTML + JS).
- Make local deployment easy for both Docker and Podman users.
- Expose a clear interface for humans (web UI) and agents (MCP).

## Planned Architecture

1. **Frontend (this repo)**  
   Static HTML/JS app that collects diagram source + type and sends render requests to Kroki.
2. **Kroki backend (containerized)**  
   Local service used by the frontend for rendering diagrams (SVG/PNG or text formats).
3. **MCP server (future)**  
   A local server exposing tools for LLMs to submit diagram source and retrieve results through Kroki.

## Local Development (Docker or Podman)

RenderRig is intended to support either runtime. Typical flow:

1. Start Kroki locally in a container.
2. Start a static frontend server (containerized or host-served).
3. Open the frontend and point it at your local Kroki endpoint.

## Planned Repository Layout

```text
.
├── README.md
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── containers/
│   ├── docker-compose.yml
│   └── podman-compose.yml
└── mcp/
    └── (future MCP server implementation)
```

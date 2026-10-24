# Using RenderRig

[Back to the README](../README.md) · [Deployment](deployment.md)

## Write and preview

1. Open **Kroki Configuration**.
2. Set **Kroki Server URL** to the URL of your Kroki server.
3. Select a diagram type, or select **Auto Detect**.
4. Enter your diagram source in **Diagram source**.

RenderRig updates the preview automatically. There is no render button. **Auto Detect** identifies possible diagram types and uses Kroki to check them.

The source panel and the preview panel stay next to each other. To change the panel widths, move the divider between the panels.

The available image formats depend on the diagram type and the Kroki server.

## Copy, export, and share

To copy a diagram:

1. Open the **Copy** menu.
2. Select a format.

To save a diagram to a file:

1. Open the **Download** menu.
2. Select a format.

These menus show the formats for the selected diagram type. The **Copy** menu does not include PDF.

The **Copy** menu also has these commands:

- **Copy image link**: Copy a direct SVG link to the selected Kroki server. This command is available only for diagram types that support SVG.
- **Copy editable link**: Copy a RenderRig URL with the diagram state in its `#state=...` fragment. Open this link to change the diagram in RenderRig.

People who use these links must have access to the RenderRig application and the Kroki server specified in the links.

## Import a Kroki link

1. Copy a standard Kroki GET render URL to the clipboard.
2. Open the Command Palette.
3. Select **Import Kroki URL from clipboard**.

RenderRig reads the diagram source from the URL.

When RenderRig starts, it tries to import a clipboard link if the editor is empty or contains built-in sample text.

Clipboard import needs these browser functions:

- `navigator.clipboard.readText` to read the clipboard.
- `DecompressionStream` to decode DEFLATE-compressed diagram source.

If automatic import cannot read or decode the clipboard data, the editor does not change. RenderRig does not show an error.

## Keyboard shortcuts

Use `Cmd` on macOS. Use `Ctrl` on other operating systems.

| Shortcut | Action |
| --- | --- |
| `Cmd/Ctrl + K` | Open the Command Palette |
| `Cmd/Ctrl + ;` | Start or exit focus mode |
| `Cmd/Ctrl + J` | Open the Copy menu |
| `Cmd/Ctrl + H` | Open the Export menu |
| `Cmd/Ctrl + G` | Open the Theme menu |
| `Cmd/Ctrl + O` | Open the Options menu |
| `Esc` | Exit focus mode |

Focus mode hides **Kroki Configuration** and the top menu buttons. When you start focus mode, a message tells you to press `Esc` to exit.

On phones and tablets, you can also use the small exit button at the top-right of the screen.

Use the **Theme** menu to change the appearance of the application, controls, and tooltips.

## Options and diagnostics

Use the **Options** menu to change the request timeout or to start or stop debug mode.

The request timeout is the maximum permitted time for a Kroki request. The default value is **5 seconds**.

The timeout applies to these requests:

- POST requests to render diagrams.
- GET requests that RenderRig uses as an alternative to POST requests.
- Health checks to find if the Kroki server is available.

If a request exceeds the timeout, RenderRig cancels the request. RenderRig stops the rendering indication and shows a timeout error.

Debug mode shows this information:

- Request type.
- Endpoint URL.
- Raw request.
- Timeout value.
- Duration of the last request.
- Results of automatic diagram type detection.

## Server defaults and network requests

If you open RenderRig through HTTP or HTTPS, it uses `<current-origin>/kroki` as the default server URL.

The current origin is the protocol, host, and port of the RenderRig page.

If you open RenderRig without a web origin, it uses `https://kroki.io`. This condition occurs when you open the page through `file://`.

A static server does not supply the `/kroki` proxy. For this configuration, set **Kroki Server URL** to an available Kroki server. See the [frontend-only deployment instructions](deployment.md#frontend-only).

RenderRig supplies fonts and other application files locally. It sends backend requests only to the selected Kroki server. These requests include POST rendering, GET fallbacks, and health checks.

RenderRig sends your diagram source to the selected Kroki server to render the diagram.

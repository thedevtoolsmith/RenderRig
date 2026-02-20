# RenderRig Agent Instructions

## Source of Truth
- Only include instructions that were explicitly provided by the user.
- Do not add requirements inferred from reading the codebase.
- If a behavior is not explicitly requested by the user, do not document it here.

## Core Constraints
- Use only HTML, CSS, and vanilla JavaScript.
- Do not use frameworks.

## Product Naming
- Use `Kroki` spelling.
- Use `Kroki Configuration` as the section name for server/type configuration.

## Diagram Type UI
- Do not use the visible native browser dropdown for diagram type selection.
- Use a theme-aware custom dropdown for diagram type selection.

## Theme and UI Direction
- Keep theme support configurable and theme-aware.
- Keep tooltip and control styling aligned with the active theme.
- Always use theme-aware custom UI components instead of native browser controls when building or updating interactive UI elements.

## Toolbar and Menus
- Menu icon order (left to right) must be:
1. Command Palette
2. Copy
3. Export
4. Theme
5. Options

## Options / Debug
- Keep request timeout configurable in the Options menu.
- Default timeout value is 5 seconds.
- Debug mode must show request diagnostics, including timeout-related values.

## Timeout Behavior
- Timeout must be enforced for every request sent to the Kroki backend.
- When elapsed time exceeds the configured timeout:
1. Cancel the request.
2. Stop rendering state immediately.
3. Show timeout error feedback.

## Responsive Expectations
- Keep input and output side-by-side in responsive mode (do not stack output below input).
- Keep the responsive menu control visible at the top-right of the visible area.

## Maintenance Rule
- Update this file only with explicit user instructions or explicit user-provided context.

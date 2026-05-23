# UI Components

This folder contains reusable UI primitives used by the Celium app. Components are grouped by intent (buttons, form, layout, data-display, cards, media, user, modal).

## Design goals
- Opinionated defaults with room to extend via props and className.
- Predictable contracts: consistent naming (`variant`, `className`, `children`) and accessible behavior by default.
- Real consumers: used across `frontend/src/pages` and `frontend/src/celium`.
 - DX ready: barrel exports for clean imports.

## Folder map
- `buttons/`: primary actions and icon actions.
- `form/`: inputs, selects, and composable form rows.
- `layout/`: page/section headers, toolbars, and card structure helpers.
- `data-display/`: tables, badges, tabs, and empty states.
- `cards/`: generic cards and domain-specific cards.
- `media/`: photo/map display components.
- `user/`: avatar and participant chips.
- `modal/`: modal shell + header/footer.

## Conventions
- Use `variant` for visual tone; use `className` for small overrides.
- Prefer composition (e.g., `PageToolbar` + `FilterChips`) over one-off layout blocks.
- Keep components UI-only; data fetching stays in pages.

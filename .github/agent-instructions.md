# Agent Instructions — Repository Conventions

Purpose
- Provide concise, enforceable guidance for automated/code-assistant behavior in this repository.
- Ensure changes follow the project’s multi-year, game-agnostic architecture and database conventions.

Where to look first
- Core architecture: docs/FRAMEWORK_DESIGN.md
- Database rules: docs/DATABASE.md
- Game template (example game pack): src/game-template/

High-level rules (must follow)
1. Keep framework code game-agnostic
   - Never add game-specific logic or scoring constants into `src/core/` or shared DB schema.
   - Game-specific logic belongs in `src/game-template/` or a year-specific game pack.
2. Use defined interfaces
   - Use `src/types/` and the Game interfaces in `docs/FRAMEWORK_DESIGN.md` for any game interactions.
   - Inject game logic via the GameContext / interfaces rather than hardcoding rules.
3. Database: generic `gameData`
   - The core DB stores game-specific data under `gameData` (opaque JSON). Do not add top-level game fields to core DB versions.
   - If you need indexed game fields, add them in the game pack database extension only (not core). See docs/DATABASE.md for migration patterns.
4. Follow existing format and style
   - Match the structure and formatting used in `src/game-template/game-schema.ts` and companion docs.
   - TypeScript, ESLint, Prettier rules in this repo must be respected; add tests (vitest) for non-trivial logic.
5. Offline-first & bundle-size awareness
   - New features must be lazy-loadable if they increase bundle size significantly. Prefer plugin/pack boundaries.
6. Documentation & PRs
   - All changes that touch core interfaces or DB migrations must update docs/FRAMEWORK_DESIGN.md or docs/DATABASE.md and include a test plan in the PR description.

Do / Don’t examples
- DO: Add scoring constants to `src/game-template/scoring.ts` and expose them via `GameContext`.
- DO: Add an indexed field for frequent queries inside a game pack DB extension only.
- DON’T: Add `scoringPoints` top-level field to the core Dexie schema in `src/core/db/*`.
- DON’T: Hardcode game piece names into components under `src/core/components/`.

PR checklist (enforced by reviewers/assistant)
- **Files changed**: core vs game-template separation respected.
- **Docs**: Updated if public interfaces or DB schemas changed.
- **Tests**: Unit tests added for logic changes (vitest).
- **Migration**: DB migrations included with upgrade logic when schema changes.
- **Bundle**: If sizable, include bundle impact note and lazy-load plan.

Clarifications / Questions to ask reviewers
- Does this change need to live in core, or is it game-specific? (If unsure, default to game pack.)
- Will this require a DB migration? If yes, include upgrade logic and a small migration guide.

Contact
- Add comments referencing this file when opening PRs that may violate these rules.

---
Notes: This file is intentionally concise — follow the referenced docs for full guidance.
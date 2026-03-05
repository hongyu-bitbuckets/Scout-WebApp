

| Repository | Description | Status |
|------------|-------------|--------|
| **maneuver-core** | Framework template | [GitHub](https://github.com/ShinyShips/maneuver-core) |
| **Maneuver-2025** | 2025 Reefscape implementation | [Live App](https://github.com/ShinyShips/Maneuver-2025) |
| **Maneuver-2026** | 2026 REBUILT implementation (this repo) | Active Development |



## 📚 Documentation

### Getting Started
- [docs/README.md](docs/README.md) - Documentation index

### Architecture
| Topic | Link |
|-------|------|
| Framework Design | [docs/FRAMEWORK_DESIGN.md](docs/FRAMEWORK_DESIGN.md) |
| Architecture Strategy | [docs/ARCHITECTURE_STRATEGY.md](docs/ARCHITECTURE_STRATEGY.md) |
| Game Components | [docs/GAME_COMPONENTS.md](docs/GAME_COMPONENTS.md) |

### Feature Guides
| Feature | Link |
|---------|------|
| Database | [docs/DATABASE.md](docs/DATABASE.md) |
| PWA Setup | [docs/PWA.md](docs/PWA.md) |
| QR Data Transfer | [docs/QR_DATA_TRANSFER.md](docs/QR_DATA_TRANSFER.md) |
| JSON Transfer | [docs/JSON_DATA_TRANSFER.md](docs/JSON_DATA_TRANSFER.md) |
| Peer Transfer (WebRTC) | [docs/PEER_TRANSFER.md](docs/PEER_TRANSFER.md) |
| Data Transformation | [docs/DATA_TRANSFORMATION.md](docs/DATA_TRANSFORMATION.md) |

### Page Documentation
| Page | Link |
|------|------|
| Scouting Workflow | [docs/SCOUTING_WORKFLOW.md](docs/SCOUTING_WORKFLOW.md) |
| Strategy Overview | [docs/STRATEGY_OVERVIEW.md](docs/STRATEGY_OVERVIEW.md) |
| Match Strategy | [docs/MATCH_STRATEGY.md](docs/MATCH_STRATEGY.md) |
| Match Validation | [docs/MATCH_VALIDATION.md](docs/MATCH_VALIDATION.md) |
| Team Stats | [docs/TEAM_STATS.md](docs/TEAM_STATS.md) |
| Pick Lists | [docs/PICK_LISTS.md](docs/PICK_LISTS.md) |
| Pit Scouting | [docs/PIT_SCOUTING.md](docs/PIT_SCOUTING.md) |
| Scout Management | [docs/SCOUT_MANAGEMENT.md](docs/SCOUT_MANAGEMENT.md) |
| Achievements | [docs/ACHIEVEMENTS.md](docs/ACHIEVEMENTS.md) |

### Developer Guides
| Topic | Link |
|-------|------|
| React Contexts | [docs/CONTEXTS_GUIDE.md](docs/CONTEXTS_GUIDE.md) |
| Hooks Reference | [docs/HOOKS_REFERENCE.md](docs/HOOKS_REFERENCE.md) |
| Utility Hooks | [docs/UTILITY_HOOKS.md](docs/UTILITY_HOOKS.md) |
| Navigation | [docs/NAVIGATION_SETUP.md](docs/NAVIGATION_SETUP.md) |

## 🎮 Customizing for Your Game Year

The `game-schema.ts` file is the **single source of truth** for your game configuration:

```typescript
// src/game-template/game-schema.ts
export const gameSchema = {
  year2026 REBUILT Game Configuration

The `game-schema.ts` file defines all 2026-specific game elements:

```typescript
// src/game-template/game-schema.ts
export const actions = {
  fuelScored: { label: "Fuel Scored", points: { auto: 1, teleop: 1 } },
  autoClimb: { label: "Auto Climb L1", points: { auto: 15, teleop: 0 } },
  climbL1: { label: "Climb Level 1", points: { auto: 0, teleop: 10 } },
  climbL2: { label: "Climb Level 2", points: { auto: 0, teleop: 20 } },
  climbL3: { label: "Climb Level 3", points: { auto: 0, teleop: 30 } },
  // ...
};

export const zones = {
  allianceZone: { label: "Alliance Zone", actions: ['score', 'pass'] },
  neutralZone: { label: "Neutral Zone", actions: ['pass'] },
  opponentZone: { label: "Opponent Zone", actions: ['defense'] },
};
```

### Key 2026 Configurations

| File | Purpose |
|------|---------|
| `game-schema.ts` | Actions, zones, workflow, constants |
| `scoring.ts` | Point calculations for fuel, climbing, penalties |
| `strategy-config.ts` | Team statistics columns and aggregations |
| `pick-list-config.ts` | Alliance selection criteria |
| `match-strategy-config.ts` | Pre-match field annotations |
| `GAME_2026.md` | Complete game rules reference |

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Dexie.js (IndexedDB) |
| PWA | Vite PWA plugin |
| Data Transfer | QR fountain codes + JSON |
| API | The Blue Alliance (TBA) |
| Deployment | Netlify / Vercel |


First Ver: Developed by **Andy Nguyen (ShinyShips) - FRC Team 3314 Alumni and Strategy Mentor** for the FRC community.
Second Ver: Developed by Hongyu Long
- Customized development for 4183
- Role setting
- Scouter dashboard
- Different navigation

Built on the **maneuver-core** framework.

Special thanks to:
- [The Blue Alliance](https://www.thebluealliance.com/) for their excellent API
- [VScout](https://github.com/VihaanChhabria/VScout) by VihaanChhabria for initial inspiration
- All the open-source libraries that make this possible

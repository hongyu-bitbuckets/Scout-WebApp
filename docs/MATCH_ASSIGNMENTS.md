# Match Assignments

**Framework Component - Game-Agnostic**

Assign scouting roles to player stations for a specific match and distribute those roles to connected scouts.

## Overview

The Match Assignments page lets lead scouts:

1. Set the active match number
2. Assign roles per station (`red-1` through `blue-3`)
3. Push assignments to connected scouts over WebRTC
4. Clear and reassign roles for a match as needed

## Persistence

Role assignments are stored in localStorage with key format:

```
role-assignment-{matchNumber}-{station}
```

The active match number is shared through:

```
currentMatchNumber
```

## Route

```
/match-assignments
```

## Related Docs

- [Pit Assignments](./PIT_ASSIGNMENTS.md) - Team-to-scout pit assignment workflow
- [Peer Transfer](./PEER_TRANSFER.md) - WebRTC data push behavior

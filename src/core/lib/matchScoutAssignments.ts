import type { MatchScheduleTransferEntry } from '@/core/lib/matchScheduleTransfer';

export const PLAYER_STATIONS = ['red-1', 'red-2', 'red-3', 'blue-1', 'blue-2', 'blue-3'] as const;

export type PlayerStation = (typeof PLAYER_STATIONS)[number];

export interface MatchScoutAssignmentBlock {
  id: string;
  eventKey: string;
  station: PlayerStation;
  scoutName: string;
  startMatch: number;
  endMatch: number;
  generatedAt: number;
}

export interface MatchScoutAssignmentsPayload {
  type: 'match-scout-assignments';
  version: '1.0';
  eventKey: string;
  sourceScoutName: string;
  generatedAt: number;
  blocks: MatchScoutAssignmentBlock[];
}

const STORAGE_KEY_PREFIX = 'match_scout_assignment_blocks_';

const uniqueById = (blocks: MatchScoutAssignmentBlock[]): MatchScoutAssignmentBlock[] => {
  const map = new Map<string, MatchScoutAssignmentBlock>();
  blocks.forEach((block) => {
    map.set(block.id, block);
  });
  return Array.from(map.values());
};

const isStation = (value: unknown): value is PlayerStation => {
  return typeof value === 'string' && PLAYER_STATIONS.includes(value as PlayerStation);
};

const toPositiveInt = (value: unknown): number | null => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
};

const normalizeBlock = (raw: unknown): MatchScoutAssignmentBlock | null => {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const station = record.station;
  const scoutName = typeof record.scoutName === 'string' ? record.scoutName.trim() : '';
  const eventKey = typeof record.eventKey === 'string' ? record.eventKey.trim() : '';
  const startMatch = toPositiveInt(record.startMatch);
  const endMatch = toPositiveInt(record.endMatch);
  const generatedAt = Number.isFinite(Number(record.generatedAt)) ? Number(record.generatedAt) : Date.now();

  if (!isStation(station) || !scoutName || !eventKey || !startMatch || !endMatch || startMatch > endMatch) {
    return null;
  }

  const id = typeof record.id === 'string' && record.id.trim().length > 0
    ? record.id
    : `${eventKey}:${station}:${startMatch}-${endMatch}:${scoutName.toLowerCase()}`;

  return {
    id,
    eventKey,
    station,
    scoutName,
    startMatch,
    endMatch,
    generatedAt,
  };
};

export const getMatchScoutAssignmentStorageKey = (eventKey: string): string => `${STORAGE_KEY_PREFIX}${eventKey}`;

export const loadMatchScoutAssignmentBlocks = (eventKey: string): MatchScoutAssignmentBlock[] => {
  if (!eventKey.trim()) return [];

  const raw = localStorage.getItem(getMatchScoutAssignmentStorageKey(eventKey));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeBlock)
      .filter((block): block is MatchScoutAssignmentBlock => block !== null)
      .sort((a, b) => a.startMatch - b.startMatch || a.station.localeCompare(b.station));
  } catch {
    return [];
  }
};

export const saveMatchScoutAssignmentBlocks = (eventKey: string, blocks: MatchScoutAssignmentBlock[]): void => {
  if (!eventKey.trim()) return;

  const cleaned = uniqueById(blocks)
    .map(normalizeBlock)
    .filter((block): block is MatchScoutAssignmentBlock => block !== null)
    .sort((a, b) => a.startMatch - b.startMatch || a.station.localeCompare(b.station));

  localStorage.setItem(getMatchScoutAssignmentStorageKey(eventKey), JSON.stringify(cleaned));
};

export const clearMatchScoutAssignmentBlocks = (eventKey: string): void => {
  if (!eventKey.trim()) return;
  localStorage.removeItem(getMatchScoutAssignmentStorageKey(eventKey));
};

export const hasStationOverlap = (
  blocks: MatchScoutAssignmentBlock[],
  candidate: Omit<MatchScoutAssignmentBlock, 'id' | 'generatedAt'>,
  excludeId?: string,
): boolean => {
  return blocks.some((block) => {
    if (excludeId && block.id === excludeId) return false;
    if (block.station !== candidate.station) return false;
    return !(candidate.endMatch < block.startMatch || candidate.startMatch > block.endMatch);
  });
};

export const buildMatchAssignmentMap = (
  blocks: MatchScoutAssignmentBlock[],
): Map<number, Partial<Record<PlayerStation, string>>> => {
  const byMatch = new Map<number, Partial<Record<PlayerStation, string>>>();

  blocks.forEach((block) => {
    for (let match = block.startMatch; match <= block.endMatch; match += 1) {
      const row = byMatch.get(match) ?? {};
      row[block.station] = block.scoutName;
      byMatch.set(match, row);
    }
  });

  return byMatch;
};

export const buildMatchBlocksFromAssignmentMap = (
  eventKey: string,
  assignmentMap: Map<number, Partial<Record<PlayerStation, string>>>,
): MatchScoutAssignmentBlock[] => {
  if (!eventKey.trim()) return [];

  const now = Date.now();
  const sortedMatches = Array.from(assignmentMap.keys())
    .filter((matchNum) => Number.isFinite(matchNum) && matchNum > 0)
    .sort((a, b) => a - b);

  const blocks: MatchScoutAssignmentBlock[] = [];

  PLAYER_STATIONS.forEach((station) => {
    let activeScout: string | null = null;
    let startMatch = 0;
    let previousMatch = 0;

    const flushActiveBlock = () => {
      if (!activeScout || startMatch <= 0 || previousMatch <= 0) return;

      blocks.push({
        id: `${eventKey}:${station}:${startMatch}-${previousMatch}:${activeScout.toLowerCase()}`,
        eventKey,
        station,
        scoutName: activeScout,
        startMatch,
        endMatch: previousMatch,
        generatedAt: now,
      });
    };

    sortedMatches.forEach((matchNum) => {
      const assignedScout = assignmentMap.get(matchNum)?.[station] ?? null;

      if (!assignedScout) {
        flushActiveBlock();
        activeScout = null;
        startMatch = 0;
        previousMatch = 0;
        return;
      }

      if (
        activeScout &&
        assignedScout === activeScout &&
        previousMatch > 0 &&
        matchNum === previousMatch + 1
      ) {
        previousMatch = matchNum;
        return;
      }

      flushActiveBlock();
      activeScout = assignedScout;
      startMatch = matchNum;
      previousMatch = matchNum;
    });

    flushActiveBlock();
  });

  return blocks;
};

export const setMatchStationAssignment = (
  blocks: MatchScoutAssignmentBlock[],
  eventKey: string,
  matchNum: number,
  station: PlayerStation,
  scoutName?: string,
): MatchScoutAssignmentBlock[] => {
  if (!eventKey.trim() || !Number.isFinite(matchNum) || matchNum <= 0) {
    return blocks;
  }

  const nextMap = buildMatchAssignmentMap(blocks);
  const row = { ...(nextMap.get(matchNum) ?? {}) };
  const normalizedScout = scoutName?.trim() ?? '';
  const currentScout = row[station] ?? '';

  if (normalizedScout && currentScout === normalizedScout) {
    return blocks;
  }

  if (!normalizedScout && !currentScout) {
    return blocks;
  }

  if (normalizedScout) {
    row[station] = normalizedScout;
    nextMap.set(matchNum, row);
  } else {
    delete row[station];
    if (Object.keys(row).length === 0) {
      nextMap.delete(matchNum);
    } else {
      nextMap.set(matchNum, row);
    }
  }

  return buildMatchBlocksFromAssignmentMap(eventKey, nextMap);
};

export const generateAutoAssignmentBlocks = (
  eventKey: string,
  matchNumbers: number[],
  scoutNames: string[],
  chunkSize: number,
): MatchScoutAssignmentBlock[] => {
  if (!eventKey.trim()) return [];
  if (matchNumbers.length === 0 || scoutNames.length === 0) return [];

  const uniqueMatches = Array.from(new Set(matchNumbers)).sort((a, b) => a - b);
  const normalizedChunkSize = Math.max(1, Math.floor(chunkSize));
  const blocks: MatchScoutAssignmentBlock[] = [];
  const now = Date.now();

  PLAYER_STATIONS.forEach((station, stationIndex) => {
    let chunkIndex = 0;
    for (let cursor = 0; cursor < uniqueMatches.length; cursor += normalizedChunkSize) {
      const startMatch = uniqueMatches[cursor];
      const endIdx = Math.min(uniqueMatches.length - 1, cursor + normalizedChunkSize - 1);
      const endMatch = uniqueMatches[endIdx];

      if (!startMatch || !endMatch) continue;

      const scoutName = scoutNames[(stationIndex + chunkIndex) % scoutNames.length];
      if (!scoutName) continue;

      const id = `${eventKey}:${station}:${startMatch}-${endMatch}:${scoutName.toLowerCase()}`;

      blocks.push({
        id,
        eventKey,
        station,
        scoutName,
        startMatch,
        endMatch,
        generatedAt: now,
      });

      chunkIndex += 1;
    }
  });

  return blocks;
};

export const buildMatchScoutAssignmentsPayload = (
  eventKey: string,
  sourceScoutName: string,
  blocks: MatchScoutAssignmentBlock[],
): MatchScoutAssignmentsPayload => ({
  type: 'match-scout-assignments',
  version: '1.0',
  eventKey,
  sourceScoutName,
  generatedAt: Date.now(),
  blocks,
});

export const isMatchScoutAssignmentsPayload = (value: unknown): value is MatchScoutAssignmentsPayload => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;

  if (record.type !== 'match-scout-assignments') return false;
  if (record.version !== '1.0') return false;
  if (typeof record.eventKey !== 'string' || !record.eventKey.trim()) return false;
  if (typeof record.sourceScoutName !== 'string' || !record.sourceScoutName.trim()) return false;
  if (!Array.isArray(record.blocks)) return false;

  return record.blocks.every((block) => normalizeBlock(block) !== null);
};

export const normalizeMatchNumbersFromSchedule = (matches: MatchScheduleTransferEntry[]): number[] => {
  return Array.from(new Set(matches.map((match) => match.matchNum))).sort((a, b) => a - b);
};
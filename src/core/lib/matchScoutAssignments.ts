export const PLAYER_STATIONS = [
  'red-1',
  'red-2',
  'red-3',
  'blue-1',
  'blue-2',
  'blue-3',
] as const;

export type PlayerStation = (typeof PLAYER_STATIONS)[number];

export type MatchStationAssignments = Partial<Record<PlayerStation, string>>;

export interface MatchScoutAssignmentBlock {
  matchNumber: number;
  assignments: MatchStationAssignments;
  completedStations?: PlayerStation[];
  updatedAt: number;
}

export interface MatchScoutAssignmentsPayload {
  type: 'match-assignments';
  version: '1.0';
  eventKey: string;
  sourceScoutName: string;
  generatedAt: number;
  blocks: MatchScoutAssignmentBlock[];
}

const MATCH_ASSIGNMENTS_KEY_PREFIX = 'match_scout_assignments_';

const getMatchAssignmentsKey = (eventKey: string): string => `${MATCH_ASSIGNMENTS_KEY_PREFIX}${eventKey}`;

const parseJson = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const normalizeAssignmentName = (name: unknown): string | null => {
  if (typeof name !== 'string') {
    return null;
  }

  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const isPlayerStation = (value: unknown): value is PlayerStation => {
  return typeof value === 'string' && PLAYER_STATIONS.includes(value as PlayerStation);
};

const normalizeMatchNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
};

const normalizeAssignments = (value: unknown): MatchStationAssignments => {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const record = value as Record<string, unknown>;
  const assignments: MatchStationAssignments = {};

  for (const station of PLAYER_STATIONS) {
    const normalizedName = normalizeAssignmentName(record[station]);
    if (normalizedName) {
      assignments[station] = normalizedName;
    }
  }

  return assignments;
};

const normalizeCompletedStations = (value: unknown): PlayerStation[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isPlayerStation);
};

export const normalizeMatchScoutAssignmentBlocks = (rawBlocks: unknown): MatchScoutAssignmentBlock[] => {
  if (!Array.isArray(rawBlocks)) {
    return [];
  }

  return rawBlocks
    .map((rawBlock): MatchScoutAssignmentBlock | null => {
      if (!rawBlock || typeof rawBlock !== 'object') {
        return null;
      }

      const record = rawBlock as Record<string, unknown>;
      const matchNumber = normalizeMatchNumber(record.matchNumber);
      if (!matchNumber) {
        return null;
      }

      const assignments = normalizeAssignments(record.assignments ?? record.stationAssignments);

      return {
        matchNumber,
        assignments,
        completedStations: normalizeCompletedStations(record.completedStations),
        updatedAt:
          typeof record.updatedAt === 'number' && Number.isFinite(record.updatedAt)
            ? record.updatedAt
            : Date.now(),
      };
    })
    .filter((block): block is MatchScoutAssignmentBlock => block !== null)
    .sort((a, b) => a.matchNumber - b.matchNumber);
};

export const loadMatchScoutAssignmentBlocks = (eventKey: string): MatchScoutAssignmentBlock[] => {
  return normalizeMatchScoutAssignmentBlocks(
    parseJson<unknown>(localStorage.getItem(getMatchAssignmentsKey(eventKey)), []),
  );
};

export const loadMatchScoutAssignmentBlock = (
  eventKey: string,
  matchNumber: number,
): MatchScoutAssignmentBlock | null => {
  return loadMatchScoutAssignmentBlocks(eventKey).find((block) => block.matchNumber === matchNumber) ?? null;
};

export const saveMatchScoutAssignmentBlocks = (eventKey: string, blocks: MatchScoutAssignmentBlock[]): void => {
  const normalizedBlocks = normalizeMatchScoutAssignmentBlocks(blocks);
  localStorage.setItem(getMatchAssignmentsKey(eventKey), JSON.stringify(normalizedBlocks));
};

export const clearMatchScoutAssignmentBlocks = (eventKey: string): void => {
  localStorage.removeItem(getMatchAssignmentsKey(eventKey));
};

export const buildMatchScoutAssignmentsPayload = (
  eventKey: string,
  sourceScoutName: string,
  blocks: MatchScoutAssignmentBlock[],
): MatchScoutAssignmentsPayload => ({
  type: 'match-assignments',
  version: '1.0',
  eventKey,
  sourceScoutName,
  generatedAt: Date.now(),
  blocks: normalizeMatchScoutAssignmentBlocks(blocks),
});

export const isMatchScoutAssignmentsPayload = (value: unknown): value is MatchScoutAssignmentsPayload => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  if (record.type !== 'match-assignments') {
    return false;
  }

  if (record.version !== '1.0') {
    return false;
  }

  if (typeof record.eventKey !== 'string' || !record.eventKey.trim()) {
    return false;
  }

  if (typeof record.sourceScoutName !== 'string' || !record.sourceScoutName.trim()) {
    return false;
  }

  if (typeof record.generatedAt !== 'number' || !Number.isFinite(record.generatedAt)) {
    return false;
  }

  const blocks = normalizeMatchScoutAssignmentBlocks(record.blocks);
  return blocks.length > 0;
};

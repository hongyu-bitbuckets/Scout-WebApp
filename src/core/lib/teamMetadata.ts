import {
  getStoredEventTeamObjects,
  getStoredTeamNameByNumber,
  type TBATeam,
} from '@/core/lib/tba';

export type ParsedSelectedTeam = {
  teamNumber: number;
  inlineTeamName?: string;
};

export const parseSelectedTeamValue = (rawValue: unknown): ParsedSelectedTeam => {
  const trimmed = String(rawValue ?? '').trim();

  // Supports values like "1678", "frc1678", or "1678 Citrus Circuits".
  const match = trimmed.match(/\d{1,5}/);
  const teamNumber = match ? parseInt(match[0], 10) : 0;

  const inlineTeamName = trimmed
    .replace(/^frc\d+\s*/i, '')
    .replace(/^\d+\s*/i, '')
    .replace(/^[-:|]\s*/, '')
    .trim();

  return {
    teamNumber,
    inlineTeamName: inlineTeamName.length > 0 ? inlineTeamName : undefined,
  };
};

export const getStoredTeamMetadataForEvent = (eventKey: string): TBATeam[] => {
  return getStoredEventTeamObjects(eventKey) ?? [];
};

export const resolveTeamNameForEventTeam = (
  eventKey: string,
  teamNumber: number,
  inlineTeamName?: string
): string | undefined => {
  if (inlineTeamName && inlineTeamName.trim().length > 0) {
    return inlineTeamName.trim();
  }

  return getStoredTeamNameByNumber(eventKey, teamNumber);
};

export const formatTeamDisplayLabel = (teamNumber: number | string, teamName?: string): string => {
  const teamNumberLabel = String(teamNumber).trim();
  const normalizedTeamName = teamName?.trim();

  if (!normalizedTeamName) {
    return teamNumberLabel;
  }

  return `${teamNumberLabel} - ${normalizedTeamName}`;
};

export const formatTeamDisplayForEvent = (
  eventKey: string | undefined,
  rawTeamValue: unknown,
  inlineTeamName?: string
): string => {
  const parsed = parseSelectedTeamValue(rawTeamValue);

  if (parsed.teamNumber <= 0) {
    return String(rawTeamValue ?? '').trim();
  }

  const resolvedName = resolveTeamNameForEventTeam(
    eventKey || '',
    parsed.teamNumber,
    inlineTeamName ?? parsed.inlineTeamName
  );

  return formatTeamDisplayLabel(parsed.teamNumber, resolvedName);
};

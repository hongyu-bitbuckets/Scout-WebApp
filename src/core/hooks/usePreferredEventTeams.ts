import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAllStoredEventTeams } from '@/core/lib/tba';
import { getStoredNexusTeams } from '@/core/lib/nexusUtils';

export type TeamDataSource = 'nexus' | 'tba' | null;

interface PreferredEventTeamsResult {
  selectedEvent: string;
  currentTeams: number[];
  teamDataSource: TeamDataSource;
  teamCount: number;
  hasTeamData: boolean;
  refreshEventTeams: () => void;
}

const parseNexusTeamNumber = (teamKey: string): number => {
  const normalized = teamKey.startsWith('frc') ? teamKey.substring(3) : teamKey;
  return Number.parseInt(normalized, 10);
};

const loadPreferredEventTeams = (): {
  selectedEvent: string;
  currentTeams: number[];
  teamDataSource: TeamDataSource;
} => {
  const tbaTeams = getAllStoredEventTeams();
  let foundEvent = '';
  let foundTeams: number[] = [];
  let foundSource: TeamDataSource = null;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('nexus_event_teams_')) {
      const eventKey = key.replace('nexus_event_teams_', '');
      const nexusTeams = getStoredNexusTeams(eventKey);

      if (nexusTeams && nexusTeams.length > 0) {
        const teamNumbers = nexusTeams
          .map(parseNexusTeamNumber)
          .filter((num) => !Number.isNaN(num))
          .sort((a, b) => a - b);

        if (teamNumbers.length > 0) {
          foundEvent = eventKey;
          foundTeams = teamNumbers;
          foundSource = 'nexus';
          break;
        }
      }
    }
  }

  if (!foundEvent) {
    const tbaEventKeys = Object.keys(tbaTeams);
    if (tbaEventKeys.length > 0) {
      const firstEventKey = tbaEventKeys[0];
      if (firstEventKey) {
        const tbaTeamsForEvent = tbaTeams[firstEventKey];
        if (tbaTeamsForEvent && tbaTeamsForEvent.length > 0) {
          foundEvent = firstEventKey;
          foundTeams = tbaTeamsForEvent;
          foundSource = 'tba';
        }
      }
    }
  }

  return {
    selectedEvent: foundEvent,
    currentTeams: foundTeams,
    teamDataSource: foundSource,
  };
};

export const usePreferredEventTeams = (): PreferredEventTeamsResult => {
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [currentTeams, setCurrentTeams] = useState<number[]>([]);
  const [teamDataSource, setTeamDataSource] = useState<TeamDataSource>(null);

  const refreshEventTeams = useCallback(() => {
    const eventContext = loadPreferredEventTeams();
    setSelectedEvent(eventContext.selectedEvent);
    setCurrentTeams(eventContext.currentTeams);
    setTeamDataSource(eventContext.teamDataSource);
  }, []);

  useEffect(() => {
    refreshEventTeams();
    window.addEventListener('focus', refreshEventTeams);

    return () => {
      window.removeEventListener('focus', refreshEventTeams);
    };
  }, [refreshEventTeams]);

  const teamCount = useMemo(() => currentTeams.length, [currentTeams]);
  const hasTeamData = useMemo(() => selectedEvent.length > 0 && currentTeams.length > 0, [selectedEvent, currentTeams]);

  return {
    selectedEvent,
    currentTeams,
    teamDataSource,
    teamCount,
    hasTeamData,
    refreshEventTeams,
  };
};

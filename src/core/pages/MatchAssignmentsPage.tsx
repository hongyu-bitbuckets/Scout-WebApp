import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ClipboardList } from 'lucide-react';
import { Alert, AlertDescription } from '@/core/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { DataAttribution } from '@/core/components/DataAttribution';
import { MatchScoutAssignmentSection } from '@/core/components/pit-assignments/MatchScoutAssignmentSection';
import { MatchEventInformationCard } from '@/core/components/pit-assignments/MatchEventInformationCard';
import { getAllStoredEventTeams } from '@/core/lib/tbaUtils';
import { getStoredNexusTeams } from '@/core/lib/nexusUtils';
import { normalizeStoredMatchSchedule } from '@/core/lib/matchScheduleTransfer';
import { useScoutManagement } from '@/core/hooks/useScoutManagement';
import { useWebRTC } from '@/core/contexts/WebRTCContext';

const FALLBACK_MATCH_NUMBER = '1';

const MatchAssignmentsPage: React.FC = () => {
  const { scoutsList } = useScoutManagement();
  const { connectedScouts } = useWebRTC();

  
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [teamDataSource, setTeamDataSource] = useState<'nexus' | 'tba' | null>(null);
  const [teamCount, setTeamCount] = useState<number>(0);
  const [scheduleCount, setScheduleCount] = useState<number>(0);
  const [scheduleRows, setScheduleRows] = useState(() => normalizeStoredMatchSchedule(JSON.parse(localStorage.getItem('matchData') || '[]')));

  const availableScouts = useMemo(() => {
    const connectedNames = connectedScouts
      .filter((scout) => scout.status !== 'disconnected')
      .map((scout) => scout.name.trim())
      .filter((name) => name.length > 0);

    return Array.from(new Set([...scoutsList, ...connectedNames])).sort((a, b) => a.localeCompare(b));
  }, [scoutsList, connectedScouts]);


  //   window.addEventListener('focus', handleFocus);
  //   return () => {
  //     window.removeEventListener('focus', handleFocus);
  //   };
  // }, [matchNumber]);

  useEffect(() => {
    const loadEventContext = () => {
      const tbaTeams = getAllStoredEventTeams();
      let foundEvent = '';
      let foundTeamCount = 0;
      let foundSource: 'nexus' | 'tba' | null = null;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('nexus_event_teams_')) {
          const eventKey = key.replace('nexus_event_teams_', '');
          const nexusTeams = getStoredNexusTeams(eventKey);

          if (nexusTeams && nexusTeams.length > 0) {
            foundEvent = eventKey;
            foundTeamCount = nexusTeams.length;
            foundSource = 'nexus';
            break;
          }
        }
      }

      if (!foundEvent) {
        const tbaEventKeys = Object.keys(tbaTeams);
        if (tbaEventKeys.length > 0) {
          const firstEventKey = tbaEventKeys[0];
          if (firstEventKey) {
            const eventTeams = tbaTeams[firstEventKey];
            if (eventTeams && eventTeams.length > 0) {
              foundEvent = firstEventKey;
              foundTeamCount = eventTeams.length;
              foundSource = 'tba';
            }
          }
        }
      }

      setSelectedEvent(foundEvent);
      setTeamDataSource(foundSource);
      setTeamCount(foundTeamCount);

      const storedSchedule = localStorage.getItem('matchData');
      let normalizedSchedule = [];
      try {
        normalizedSchedule = normalizeStoredMatchSchedule(storedSchedule ? JSON.parse(storedSchedule) : []);
      } catch {
        normalizedSchedule = [];
      }

      setScheduleRows(normalizedSchedule);
      setScheduleCount(normalizedSchedule.length);
    };

    loadEventContext();
    window.addEventListener('focus', loadEventContext);

    return () => {
      window.removeEventListener('focus', loadEventContext);
    };
  }, []);


  return (
    <div className="min-h-screen container mx-auto px-4 pt-12 pb-24 space-y-6 max-w-4xl">
      <div className="text-start space-y-2">
        <h1 className="text-3xl font-bold">Match Assignments</h1>
        <p className="text-muted-foreground">
          Assign scout names to player stations in match chunks, then review in the schedule table.
        </p>
        <div className="pt-1">
          <DataAttribution sources={['tba']} variant="compact" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <MatchEventInformationCard
          selectedEvent={selectedEvent}
          teamDataSource={teamDataSource}
          teamCount={teamCount}
          scheduleCount={scheduleCount}
        />


      <MatchScoutAssignmentSection
        eventKey={selectedEvent}
        schedule={scheduleRows}
        availableScouts={availableScouts}
      />

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Scout assignment chunks are temporary planning data and are stored in localStorage only.
        </AlertDescription>
      </Alert>
    </div>
    </div>
  );
}
  

export default MatchAssignmentsPage;

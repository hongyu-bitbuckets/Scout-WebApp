import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/core/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { DataAttribution } from '@/core/components/DataAttribution';
import { MatchScoutAssignmentSection } from '@/core/components/pit-assignments/MatchScoutAssignmentSection';
import { AssignmentEventInformationCard } from '@/core/components/pit-assignments/AssignmentEventInformationCard';
import { normalizeStoredMatchSchedule } from '@/core/lib/matchScheduleTransfer';
import { useScoutManagement } from '@/core/hooks/useScoutManagement';
import { useWebRTC } from '@/core/contexts/WebRTCContext';
import { usePreferredEventTeams } from '@/core/hooks/usePreferredEventTeams';
import { useScoutAvailability } from '@/core/hooks/useScoutAvailability';

const FALLBACK_MATCH_NUMBER = '1';

const MatchAssignmentsPage: React.FC = () => {
  const { scoutsList } = useScoutManagement();
  const { connectedScouts } = useWebRTC();
  const { selectedEvent, currentTeams, teamDataSource, teamCount } = usePreferredEventTeams();
  const { availableScouts, readyConnectedScoutsCount } = useScoutAvailability(scoutsList, connectedScouts);

  const [scheduleCount, setScheduleCount] = useState<number>(0);
  const [scheduleRows, setScheduleRows] = useState(() => normalizeStoredMatchSchedule(JSON.parse(localStorage.getItem('matchData') || '[]')));


  //   window.addEventListener('focus', handleFocus);
  //   return () => {
  //     window.removeEventListener('focus', handleFocus);
  //   };
  // }, [matchNumber]);

  useEffect(() => {
    const loadScheduleData = () => {
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

    loadScheduleData();
    window.addEventListener('focus', loadScheduleData);

    return () => {
      window.removeEventListener('focus', loadScheduleData);
    };
  }, []);


  return (
    <div className="min-h-screen container mx-auto px-4 pt-12 pb-24 space-y-6 max-w-7xl">
      <div className="text-start">
        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold">Match Assignments</h1>
            <p className="text-muted-foreground">
              Assign scout names to player stations in match chunks, then review in the schedule table.
            </p>
          </div>
          

          <div className="hidden md:block">
            <DataAttribution sources={teamDataSource ? [teamDataSource] : ['tba', 'nexus']} variant="full" />
          </div>
        </div>

        <div className="md:hidden mt-2">
          <DataAttribution sources={teamDataSource ? [teamDataSource] : ['tba', 'nexus']} variant="compact" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <AssignmentEventInformationCard
          variant="match"
          selectedEvent={selectedEvent}
          teamDataSource={teamDataSource}
          teamCount={teamCount}
          scheduleCount={scheduleCount}
          hasData={selectedEvent.trim().length > 0}
        />

        
      </div>

      <MatchScoutAssignmentSection
        eventKey={selectedEvent}
        matchNumber={FALLBACK_MATCH_NUMBER}
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
  );
}
  

export default MatchAssignmentsPage;

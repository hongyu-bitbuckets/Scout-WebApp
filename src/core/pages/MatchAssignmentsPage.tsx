import React, { useEffect, useState } from 'react';
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

const FALLBACK_MATCH_NUMBER = '1';

const MatchAssignmentsPage: React.FC = () => {
  const [matchNumber, setMatchNumber] = useState<string>(() => {
    return localStorage.getItem('currentMatchNumber') || FALLBACK_MATCH_NUMBER;
  });
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [teamDataSource, setTeamDataSource] = useState<'nexus' | 'tba' | null>(null);
  const [teamCount, setTeamCount] = useState<number>(0);

  useEffect(() => {
    const handleFocus = () => {
      const storedMatchNumber = localStorage.getItem('currentMatchNumber');
      if (storedMatchNumber && storedMatchNumber !== matchNumber) {
        setMatchNumber(storedMatchNumber);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [matchNumber]);

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
    };

    loadEventContext();
    window.addEventListener('focus', loadEventContext);

    return () => {
      window.removeEventListener('focus', loadEventContext);
    };
  }, []);

  const handleMatchNumberChange = (value: string) => {
    const numericOnly = value.replace(/\D/g, '');
    const nextMatchNumber = numericOnly || FALLBACK_MATCH_NUMBER;

    setMatchNumber(nextMatchNumber);
    localStorage.setItem('currentMatchNumber', nextMatchNumber);
  };

  return (
    <div className="min-h-screen container mx-auto px-4 pt-12 pb-24 space-y-6 max-w-4xl">
      <div className="text-start space-y-2">
        <h1 className="text-3xl font-bold">Match Assignments</h1>
        <p className="text-muted-foreground">
          Assign scouting roles to each player station for the active match.
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
          matchNumber={matchNumber}
        />

        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Active Match
            </CardTitle>
            <CardDescription>
              Role assignments are saved by match number and station.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-w-48">
              <Label htmlFor="match-number">Match Number</Label>
              <Input
                id="match-number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={matchNumber}
                onChange={(e) => handleMatchNumberChange(e.target.value)}
                placeholder="1"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <MatchScoutAssignmentSection matchNumber={matchNumber} />

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Scouts receive role assignments based on their selected station for the current match.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default MatchAssignmentsPage;

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Label } from "@/core/components/ui/label";
import { Button } from "@/core/components/ui/button";
import { Input } from '@/core/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table';
import { Upload, Users, X } from 'lucide-react';
import { useWebRTC } from '@/core/contexts/WebRTCContext';
import { toast } from 'sonner';
import type { MatchScheduleTransferEntry } from '@/core/lib/matchScheduleTransfer';
import {
  PLAYER_STATIONS,
  type MatchScoutAssignmentBlock,
  buildMatchAssignmentMap,
  buildMatchScoutAssignmentsPayload,
  clearMatchScoutAssignmentBlocks,
  generateAutoAssignmentBlocks,
  loadMatchScoutAssignmentBlocks,
  normalizeMatchNumbersFromSchedule,
  saveMatchScoutAssignmentBlocks,
} from '@/core/lib/matchScoutAssignments';
import { getScoutColor } from '@/core/components/pit-assignments/shared/scoutUtils';

interface Props {
  eventKey: string;
  matchNumber: string;
  schedule: MatchScheduleTransferEntry[];
  availableScouts: string[];
}

export const MatchScoutAssignmentSection: React.FC<Props> = ({
  eventKey,
  matchNumber,
  schedule,
  availableScouts,
}) => {
  const matchNumbers = useMemo(() => normalizeMatchNumbersFromSchedule(schedule), [schedule]);

  const [chunkSize, setChunkSize] = useState<string>('4');
  const [search, setSearch] = useState<string>('');
  const [blocks, setBlocks] = useState<MatchScoutAssignmentBlock[]>([]);

  const { connectedScouts, pushDataToAll } = useWebRTC();

  const readyConnectedScoutsCount = useMemo(() => {
    return connectedScouts.filter((scout) => {
      const channelState = scout.channel?.readyState || scout.dataChannel?.readyState;
      return scout.status === 'connected' && channelState === 'open';
    }).length;
  }, [connectedScouts]);

  useEffect(() => {
    if (!eventKey.trim()) {
      setBlocks([]);
      return;
    }

    const stored = loadMatchScoutAssignmentBlocks(eventKey);
    setBlocks(stored);
  }, [eventKey]);

  useEffect(() => {
    if (!eventKey.trim()) return;
    saveMatchScoutAssignmentBlocks(eventKey, blocks);
  }, [eventKey, blocks]);

  const assignmentMap = useMemo(() => buildMatchAssignmentMap(blocks), [blocks]);
  const scoutColorMap = useMemo(() => {
    const map = new Map<string, string>();
    availableScouts.forEach((name, index) => {
      map.set(name, getScoutColor(index));
    });
    return map;
  }, [availableScouts]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const sortedMatches = [...schedule].sort((a, b) => a.matchNum - b.matchNum);

    if (!query) return sortedMatches;

    return sortedMatches.filter((row) => {
      if (String(row.matchNum).includes(query)) return true;

      const teams = [...row.redAlliance, ...row.blueAlliance].join(' ').toLowerCase();
      if (teams.includes(query)) return true;

      const stations = assignmentMap.get(row.matchNum);
      const stationText = PLAYER_STATIONS.map((station) => stations?.[station] ?? '').join(' ').toLowerCase();
      return stationText.includes(query);
    });
  }, [assignmentMap, schedule, search]);

  const handleAutoGenerate = () => {
    if (!eventKey.trim()) {
      toast.error('No active event selected for assignments');
      return;
    }

    if (availableScouts.length === 0) {
      toast.error('No scouts available. Add scouts or connect devices first.');
      return;
    }

    if (matchNumbers.length === 0) {
      toast.error('No match schedule loaded');
      return;
    }

    const size = Number.parseInt(chunkSize, 10);
    if (!Number.isFinite(size) || size <= 0) {
      toast.error('Chunk size must be a positive number');
      return;
    }

    const generated = generateAutoAssignmentBlocks(eventKey, matchNumbers, availableScouts, size);
    setBlocks(generated);
    toast.success(`Generated ${generated.length} assignment blocks for all stations`);
  };

  const handlePushAssignments = () => {
    if (readyConnectedScoutsCount === 0) {
      toast.error('No connected scouts available to receive assignments');
      return;
    }

    if (!eventKey.trim()) {
      toast.error('No active event selected for assignments');
      return;
    }

    if (blocks.length === 0) {
      toast.error('No assignment blocks to push');
      return;
    }

    const sourceScoutName = localStorage.getItem('currentScout') || 'Lead Scout';
    const payload = buildMatchScoutAssignmentsPayload(eventKey, sourceScoutName, blocks);

    pushDataToAll(payload, 'match');
    toast.success(`Pushed station assignments to ${readyConnectedScoutsCount} connected scout${readyConnectedScoutsCount === 1 ? '' : 's'}`);
  };

  const handleClearAll = () => {
    clearMatchScoutAssignmentBlocks(eventKey);
    setBlocks([]);
    toast.success('Cleared all station assignment blocks for this event');
  };

  const stationCellClass = (station: string, hasAssignment: boolean): string => {
    if (!hasAssignment) return 'bg-muted/30';
    return station.startsWith('red') ? 'bg-red-50 dark:bg-red-950/30' : 'bg-blue-50 dark:bg-blue-950/30';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assignment Control and Table View
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button onClick={handleClearAll} variant="outline" className="text-sm">
              <X className="h-4 w-4" />
              Clear
            </Button>
            <Button onClick={handlePushAssignments} className="flex items-center gap-2" disabled={readyConnectedScoutsCount === 0 || blocks.length === 0}>
              <Upload className="h-4 w-4" />
              Push Assignments ({readyConnectedScoutsCount})
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label htmlFor="chunk-size">Auto Chunk Size</Label>
              <Input
                id="chunk-size"
                inputMode="numeric"
                pattern="[0-9]*"
                value={chunkSize}
                onChange={(e) => setChunkSize(e.target.value.replace(/\D/g, '') || '1')}
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={handleAutoGenerate} disabled={availableScouts.length === 0 || matchNumbers.length === 0}>
                Auto Generate Rotation
              </Button>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="assignment-search">Search Matches / Teams / Scouts</Label>
              <Input
                id="assignment-search"
                placeholder="Search by match number, team, or scout"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border overflow-auto max-h-[440px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match</TableHead>
                  <TableHead className="w-24">Red Alliance</TableHead>
                  <TableHead className="w-24">Blue Alliance</TableHead>
                  {PLAYER_STATIONS.map((station) => (
                    <TableHead key={station}>{station.toUpperCase()}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row) => {
                  const stationAssignments = assignmentMap.get(row.matchNum) ?? {};
                  return (
                    <TableRow key={row.matchNum} data-state={String(row.matchNum) === matchNumber ? 'selected' : undefined}>
                      <TableCell className="font-medium">{row.matchNum}</TableCell>
                      <TableCell className="text-[11px] leading-4 text-red-700 dark:text-red-300">
                        {row.redAlliance.map((team) => (
                          <div key={`${row.matchNum}-r-${team}`}>{team}</div>
                        ))}
                      </TableCell>
                      <TableCell className="text-[11px] leading-4 text-blue-700 dark:text-blue-300">
                        {row.blueAlliance.map((team) => (
                          <div key={`${row.matchNum}-b-${team}`}>{team}</div>
                        ))}
                      </TableCell>
                      {PLAYER_STATIONS.map((station) => {
                        const assignedScout = stationAssignments[station];
                        const scoutColorClass = assignedScout ? (scoutColorMap.get(assignedScout) ?? '') : '';

                        return (
                          <TableCell key={`${row.matchNum}-${station}`} className={stationCellClass(station, Boolean(assignedScout))}>
                            {assignedScout ? (
                              <span className={`inline-block rounded border px-2 py-0.5 text-xs font-medium ${scoutColorClass}`}>
                                {assignedScout}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">Break / Unassigned</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <p className="text-xs text-muted-foreground">
            Auto-rotation assigns each station for {chunkSize} matches at a time, then rotates to the next scout for break coverage. Manual block editing is intentionally hidden for now.
          </p>

          <div className="pt-1 md:hidden flex gap-2">
            <Button onClick={handleClearAll} variant="outline" className="flex-1">
              Clear
            </Button>
            <Button onClick={handlePushAssignments} disabled={readyConnectedScoutsCount === 0 || blocks.length === 0} className="flex-1">
              Push ({readyConnectedScoutsCount})
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/animate-ui/radix/tabs';
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Label } from "@/core/components/ui/label";
import { Button } from "@/core/components/ui/button";
import { Input } from '@/core/components/ui/input';
import { BarChart3, LayoutGrid, MousePointer2, Send, Users, Wand2 } from 'lucide-react';
import { useWebRTC } from '@/core/contexts/WebRTCContext';
import { toast } from 'sonner';
import { MatchTeamDisplaySection } from '@/core/components/pit-assignments/MatchTeamDisplaySection';
import { MatchAssignmentResults } from '@/core/components/pit-assignments/MatchAssignmentResults';
import { AssignmentActionButtons } from '@/core/components/pit-assignments/shared/AssignmentActionButtons';
import type { MatchScheduleTransferEntry } from '@/core/lib/matchScheduleTransfer';
import {
  PLAYER_STATIONS,
  type MatchScoutAssignmentBlock,
  type PlayerStation,
  buildMatchAssignmentMap,
  buildMatchScoutAssignmentsPayload,
  clearMatchScoutAssignmentBlocks,
  generateAutoAssignmentBlocks,
  loadMatchScoutAssignmentBlocks,
  normalizeMatchNumbersFromSchedule,
  saveMatchScoutAssignmentBlocks,
  setMatchStationAssignment,
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
  const [assignmentMode, setAssignmentMode] = useState<'sequential' | 'manual'>('sequential');
  const [selectedScoutForAssignment, setSelectedScoutForAssignment] = useState<string | null>(null);
  const [isDragAssigning, setIsDragAssigning] = useState<boolean>(false);
  const [lastDraggedCellKey, setLastDraggedCellKey] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('teams');
  const [blocks, setBlocks] = useState<MatchScoutAssignmentBlock[]>([]);

  const { connectedScouts, pushDataToAll } = useWebRTC();

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

  useEffect(() => {
    const handlePointerUp = () => {
      setIsDragAssigning(false);
      setLastDraggedCellKey('');
    };

    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  useEffect(() => {
    if (assignmentMode !== 'manual') {
      setSelectedScoutForAssignment(null);
      setIsDragAssigning(false);
      setLastDraggedCellKey('');
    }
  }, [assignmentMode]);

  const assignmentMap = useMemo(() => buildMatchAssignmentMap(blocks), [blocks]);
  const scoutColorMap = useMemo(() => {
    const map = new Map<string, string>();
    availableScouts.forEach((name, index) => {
      map.set(name, getScoutColor(index));
    });
    return map;
  }, [availableScouts]);

  const assignmentCountByScout = useMemo(() => {
    const counts = new Map<string, number>();

    assignmentMap.forEach((stations) => {
      PLAYER_STATIONS.forEach((station) => {
        const scoutName = stations[station];
        if (!scoutName) return;
        counts.set(scoutName, (counts.get(scoutName) ?? 0) + 1);
      });
    });

    return counts;
  }, [assignmentMap]);

  const assignedCellCount = useMemo(() => {
    let total = 0;
    assignmentMap.forEach((stations) => {
      PLAYER_STATIONS.forEach((station) => {
        if (stations[station]) {
          total += 1;
        }
      });
    });
    return total;
  }, [assignmentMap]);

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
    setAssignmentMode('sequential');
    setSelectedScoutForAssignment(null);
    toast.success(`Generated ${generated.length} assignment blocks for all stations`);
  };

  const applyStationAssignment = useCallback((matchNum: number, station: PlayerStation, scoutName?: string) => {
    setBlocks((prev) => setMatchStationAssignment(prev, eventKey, matchNum, station, scoutName));
  }, [eventKey]);

  const handleStationPointerDown = useCallback((matchNum: number, station: PlayerStation) => {
    if (assignmentMode !== 'manual') return;

    const selectedScout = selectedScoutForAssignment?.trim();
    if (!selectedScout) {
      toast.error('Select a scout first before dragging assignments');
      return;
    }

    setIsDragAssigning(true);
    const cellKey = `${matchNum}:${station}`;
    setLastDraggedCellKey(cellKey);
    applyStationAssignment(matchNum, station, selectedScout);
  }, [applyStationAssignment, assignmentMode, selectedScoutForAssignment]);

  const handleStationPointerEnter = useCallback((matchNum: number, station: PlayerStation) => {
    if (!isDragAssigning || assignmentMode !== 'manual') return;

    const selectedScout = selectedScoutForAssignment?.trim();
    if (!selectedScout) return;

    const cellKey = `${matchNum}:${station}`;
    if (cellKey === lastDraggedCellKey) return;

    setLastDraggedCellKey(cellKey);
    applyStationAssignment(matchNum, station, selectedScout);
  }, [applyStationAssignment, assignmentMode, isDragAssigning, lastDraggedCellKey, selectedScoutForAssignment]);

  const handleStationPointerUp = useCallback(() => {
    setIsDragAssigning(false);
    setLastDraggedCellKey('');
  }, []);

  const handleStationClear = useCallback((matchNum: number, station: PlayerStation) => {
    applyStationAssignment(matchNum, station, undefined);
  }, [applyStationAssignment]);

  const handlePushAssignments = () => {
    if (!eventKey.trim()) {
      toast.error('No active event selected');
      return;
    }

    if (blocks.length === 0) {
      toast.error('Create assignments before pushing');
      return;
    }

    if (connectedScouts.length === 0) {
      toast.error('No connected scouts available to receive assignments');
      return;
    }

    const sourceScoutName = localStorage.getItem('currentScout') || 'Lead Scout';
    const payload = buildMatchScoutAssignmentsPayload(eventKey, sourceScoutName, blocks);
    pushDataToAll(payload, 'pit-assignments');
    toast.success(`Pushed match assignments to ${connectedScouts.length} connected scout${connectedScouts.length === 1 ? '' : 's'}`);
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

  const getAssignedScout = (matchNum: number, station: string): string | undefined => {
    return assignmentMap.get(matchNum)?.[station];
  };

  const getScoutColorClass = (scoutName: string): string => {
    return scoutColorMap.get(scoutName) ?? '';
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
            <Button
              variant="outline"
              size="sm"
              onClick={handlePushAssignments}
              disabled={blocks.length === 0 || connectedScouts.length === 0}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Push to Connected Scouts
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
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="assignment-search">Search Matches / Teams / Scouts</Label>
              <Input
                id="assignment-search"
                placeholder="e.g. 12, 3314, or scout name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAutoGenerate} className="w-full flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Auto Generate
              </Button>
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium">Assignment Mode</p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={assignmentMode === 'sequential' ? 'default' : 'outline'}
                    onClick={() => setAssignmentMode('sequential')}
                  >
                    Auto Rotation
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={assignmentMode === 'manual' ? 'default' : 'outline'}
                    onClick={() => setAssignmentMode('manual')}
                  >
                    Manual Drag Assign
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                {assignedCellCount} station assignments across {blocks.length} stored blocks
              </div>
            </div>

            {assignmentMode === 'manual' && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Scouts (Click to Select)</div>
                <div className="flex flex-wrap gap-2">
                  {availableScouts.map((scout, index) => {
                    const isSelected = selectedScoutForAssignment === scout;
                    const assignedCount = assignmentCountByScout.get(scout) ?? 0;

                    return (
                      <Button
                        key={scout}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        className={`${getScoutColor(index)} px-2 transition-all hover:scale-105 active:scale-95 ${
                          isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-sm'
                        }`}
                        onClick={() => {
                          setSelectedScoutForAssignment((prev) => (prev === scout ? null : scout));
                        }}
                      >
                        <span className="flex items-center gap-1">
                          <MousePointer2 className="h-3 w-3" />
                          {scout} ({assignedCount})
                        </span>
                      </Button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedScoutForAssignment
                    ? `Selected: ${selectedScoutForAssignment}. Press and drag across station cells to assign quickly. Right-click a filled cell to clear.`
                    : 'Select a scout, then drag across table cells to assign that scout.'}
                </p>
              </div>
            )}
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            enableSwipe={true}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="teams" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Team Cards
              </TabsTrigger>
              <TabsTrigger value="assignments" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Table View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teams">
              <MatchTeamDisplaySection
                filteredRows={filteredRows}
                matchNumber={matchNumber}
                stationCellClass={stationCellClass}
                getAssignedScout={getAssignedScout}
                getScoutColorClass={getScoutColorClass}
                isManualMode={assignmentMode === 'manual'}
                selectedScoutForAssignment={selectedScoutForAssignment}
                isDragAssigning={isDragAssigning}
                onStationPointerDown={handleStationPointerDown}
                onStationPointerEnter={handleStationPointerEnter}
                onStationPointerUp={handleStationPointerUp}
                onStationClear={handleStationClear}
              />
            </TabsContent>

            <TabsContent value="assignments">
              <MatchAssignmentResults
                filteredRows={filteredRows}
                matchNumber={matchNumber}
                stationCellClass={stationCellClass}
                getAssignedScout={getAssignedScout}
                getScoutColorClass={getScoutColorClass}
                isManualMode={assignmentMode === 'manual'}
                selectedScoutForAssignment={selectedScoutForAssignment}
                isDragAssigning={isDragAssigning}
                onStationPointerDown={handleStationPointerDown}
                onStationPointerEnter={handleStationPointerEnter}
                onStationPointerUp={handleStationPointerUp}
                onStationClear={handleStationClear}
              />
            </TabsContent>
          </Tabs>

          <p className="text-xs text-muted-foreground">
            {assignmentMode === 'manual'
              ? 'Manual mode: select a scout, then drag across station cells to assign quickly. Right-click any assigned cell to clear it.'
              : `Auto-rotation assigns each station for ${chunkSize} matches at a time, then rotates to the next scout for break coverage.`}
          </p>

          <div className="md:hidden">
            <Button
              variant="outline"
              onClick={handlePushAssignments}
              disabled={blocks.length === 0 || connectedScouts.length === 0}
              className="w-full flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Push to Connected Scouts
            </Button>
          </div>

          <div className="pt-1">
            <div className="hidden md:block">
              <AssignmentActionButtons
                assignmentMode={assignmentMode}
                assignmentsConfirmed={false}
                assignmentsLength={assignedCellCount}
                onClearAllAssignments={handleClearAll}
              />
            </div>
            <div className="md:hidden">
              <AssignmentActionButtons
                assignmentMode={assignmentMode}
                assignmentsConfirmed={false}
                assignmentsLength={assignedCellCount}
                onClearAllAssignments={handleClearAll}
                isMobile={true}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

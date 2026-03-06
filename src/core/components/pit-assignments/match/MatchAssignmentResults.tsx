import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Badge } from '@/core/components/ui/badge';
import { Input } from '@/core/components/ui/input';
import { Download, Search, SortAsc, SortDesc, TableProperties } from 'lucide-react';
import { AssignmentActionButtons } from '../shared/AssignmentActionButtons';
import { MatchAssignmentTable } from './MatchAssignmentTable';
import { MatchScoutLegend } from './MatchScoutLegend';
import {
  PLAYER_STATIONS,
  type MatchScoutAssignmentBlock,
  type PlayerStation,
} from '@/core/lib/matchScoutAssignments';
import type { MatchScheduleTransferEntry } from '@/core/lib/matchScheduleTransfer';

type SortOption = 'match' | 'assigned' | 'completed';

type MatchAssignmentMode = 'sequential' | 'manual';

interface MatchAssignmentResultsProps {
  scheduleRows: MatchScheduleTransferEntry[];
  assignmentBlocks: MatchScoutAssignmentBlock[];
  scoutsList: string[];
  assignmentMode: MatchAssignmentMode;
  assignmentsConfirmed: boolean;
  selectedScoutForAssignment: string | null;
  isDragAssigning: boolean;
  onScoutSelectionChange: (scoutName: string | null) => void;
  onStationPointerDown: (matchNum: number, station: PlayerStation) => void;
  onStationPointerEnter: (matchNum: number, station: PlayerStation) => void;
  onStationPointerUp: () => void;
  onStationClear: (matchNum: number, station: PlayerStation) => void;
  onStationToggleCompleted: (matchNum: number, station: PlayerStation) => void;
  onConfirmAssignments: () => void;
  onClearAllAssignments: () => void;
}

export const MatchAssignmentResults: React.FC<MatchAssignmentResultsProps> = ({
  scheduleRows,
  assignmentBlocks,
  scoutsList,
  assignmentMode,
  assignmentsConfirmed,
  selectedScoutForAssignment,
  isDragAssigning,
  onScoutSelectionChange,
  onStationPointerDown,
  onStationPointerEnter,
  onStationPointerUp,
  onStationClear,
  onStationToggleCompleted,
  onConfirmAssignments,
  onClearAllAssignments,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('match');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const blockMap = useMemo(() => {
    return new Map(assignmentBlocks.map((block) => [block.matchNumber, block]));
  }, [assignmentBlocks]);

  const assignmentCountsByScout = useMemo(() => {
    const counts: Record<string, { assigned: number; completed: number }> = {};

    scoutsList.forEach((scout) => {
      counts[scout] = { assigned: 0, completed: 0 };
    });

    for (const block of assignmentBlocks) {
      for (const station of PLAYER_STATIONS) {
        const assignedScout = block.assignments[station];
        if (!assignedScout) continue;

        if (!counts[assignedScout]) {
          counts[assignedScout] = { assigned: 0, completed: 0 };
        }

        counts[assignedScout].assigned += 1;
        if (block.completedStations?.includes(station)) {
          counts[assignedScout].completed += 1;
        }
      }
    }

    return counts;
  }, [assignmentBlocks, scoutsList]);

  const { assignedStationsCount, completedStationsCount } = useMemo(() => {
    let assigned = 0;
    let completed = 0;

    for (const block of assignmentBlocks) {
      for (const station of PLAYER_STATIONS) {
        if (block.assignments[station]) {
          assigned += 1;
          if (block.completedStations?.includes(station)) {
            completed += 1;
          }
        }
      }
    }

    return {
      assignedStationsCount: assigned,
      completedStationsCount: completed,
    };
  }, [assignmentBlocks]);

  const filteredRows = useMemo(() => {
    const trimmedFilter = searchFilter.trim();

    const rows = scheduleRows.filter((row) => {
      if (!trimmedFilter) return true;

      const matchText = String(row.matchNum);
      if (matchText.includes(trimmedFilter)) {
        return true;
      }

      const block = blockMap.get(row.matchNum);
      const assignedScouts = block ? Object.values(block.assignments) : [];
      return assignedScouts.some((scoutName) =>
        scoutName?.toLowerCase().includes(trimmedFilter.toLowerCase()),
      );
    });

    rows.sort((a, b) => {
      let result = 0;

      switch (sortBy) {
        case 'match':
          result = a.matchNum - b.matchNum;
          break;
        case 'assigned': {
          const assignedA = PLAYER_STATIONS.filter((station) => blockMap.get(a.matchNum)?.assignments[station]).length;
          const assignedB = PLAYER_STATIONS.filter((station) => blockMap.get(b.matchNum)?.assignments[station]).length;
          result = assignedA - assignedB;
          break;
        }
        case 'completed': {
          const completedA = blockMap.get(a.matchNum)?.completedStations?.length ?? 0;
          const completedB = blockMap.get(b.matchNum)?.completedStations?.length ?? 0;
          result = completedA - completedB;
          break;
        }
      }

      return sortDirection === 'asc' ? result : -result;
    });

    return rows;
  }, [blockMap, scheduleRows, searchFilter, sortBy, sortDirection]);

  const getSortIcon = (option: SortOption) => {
    if (sortBy !== option) return null;
    return sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />;
  };

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      return;
    }

    setSortBy(option);
    setSortDirection('asc');
  };

  const getAssignedScout = (matchNum: number, station: string) => {
    if (!PLAYER_STATIONS.includes(station as PlayerStation)) {
      return undefined;
    }

    return blockMap.get(matchNum)?.assignments[station as PlayerStation];
  };

  const isStationCompleted = (matchNum: number, station: PlayerStation) => {
    return blockMap.get(matchNum)?.completedStations?.includes(station) ?? false;
  };

  const getScoutColorClass = (scoutName: string) => {
    const scoutIndex = scoutsList.indexOf(scoutName);
    if (scoutIndex < 0) {
      return 'bg-muted text-muted-foreground border-muted-foreground/30';
    }

    const colorClasses = [
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
      'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
      'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800',
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
      'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800',
      'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800',
    ];

    const colorClass = colorClasses[scoutIndex % colorClasses.length];
    return colorClass ?? 'bg-muted text-muted-foreground border-muted-foreground/30';
  };

  const stationCellClass = (
    _matchNum: number,
    station: PlayerStation,
    hasAssignment: boolean,
    isCompleted: boolean,
  ) => {
    const allianceClass = station.startsWith('red')
      ? 'bg-red-50/60 dark:bg-red-950/20'
      : 'bg-blue-50/60 dark:bg-blue-950/20';

    if (!hasAssignment) {
      return `${allianceClass} text-muted-foreground`;
    }

    if (isCompleted) {
      return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
    }

    return `${allianceClass} font-medium`;
  };

  const exportAssignments = () => {
    const rows = [
      ['Match', 'Station', 'Scout', 'Completed'],
      ...assignmentBlocks.flatMap((block) =>
        PLAYER_STATIONS
          .filter((station) => block.assignments[station])
          .map((station) => [
            String(block.matchNumber),
            station,
            block.assignments[station] || '',
            block.completedStations?.includes(station) ? 'Yes' : 'No',
          ]),
      ),
    ];

    const csvString = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'match-assignments.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TableProperties className="h-5 w-5" />
            Match Assignment Results ({scheduleRows.length} matches)
          </div>
          <div className="hidden md:flex items-center justify-center gap-2">
            <AssignmentActionButtons
              assignmentMode={assignmentMode}
              assignmentsConfirmed={assignmentsConfirmed}
              assignmentsLength={assignedStationsCount}
              onClearAllAssignments={onClearAllAssignments}
              onConfirmAssignments={onConfirmAssignments}
              isMobile={false}
            />
            <Button
              onClick={exportAssignments}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={assignedStationsCount === 0}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardTitle>

        <div className="flex gap-4 mt-2 text-sm">
          <div className="flex items-center gap-1">
            <Badge variant="secondary">{completedStationsCount}</Badge>
            <span className="text-muted-foreground">Completed Stations</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline">{assignedStationsCount}</Badge>
            <span className="text-muted-foreground">Assigned Stations</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline">
              {Math.max(scheduleRows.length * PLAYER_STATIONS.length - assignedStationsCount, 0)}
            </Badge>
            <span className="text-muted-foreground">Unassigned Stations</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {scoutsList.length > 0 && (
          <MatchScoutLegend
            scoutsList={scoutsList}
            assignmentCountsByScout={assignmentCountsByScout}
            interactive={assignmentMode === 'manual' && !assignmentsConfirmed}
            selectedScoutForAssignment={selectedScoutForAssignment}
            onScoutSelectionChange={onScoutSelectionChange}
            completedCount={completedStationsCount}
            totalCount={assignedStationsCount}
            mobileActions={
              <div className="md:hidden mt-3">
                <AssignmentActionButtons
                  assignmentMode={assignmentMode}
                  assignmentsConfirmed={assignmentsConfirmed}
                  assignmentsLength={assignedStationsCount}
                  onClearAllAssignments={onClearAllAssignments}
                  onConfirmAssignments={onConfirmAssignments}
                  isMobile={true}
                />
              </div>
            }
            helpText={
              assignmentMode === 'manual' && !assignmentsConfirmed
                ? selectedScoutForAssignment
                  ? `Selected: ${selectedScoutForAssignment}. Drag across station cells to assign.`
                  : 'Select a scout above, then drag across station cells to assign.'
                : 'Click assigned stations to toggle completion. Right-click a station to clear assignment.'
            }
          />
        )}

        <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search match number or scout..."
              value={searchFilter}
              onChange={(event) => setSearchFilter(event.target.value)}
              className="pl-10 w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={sortBy === 'match' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('match')}
            >
              Match {getSortIcon('match')}
            </Button>
            <Button
              variant={sortBy === 'assigned' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('assigned')}
            >
              Assigned {getSortIcon('assigned')}
            </Button>
            <Button
              variant={sortBy === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('completed')}
            >
              Completed {getSortIcon('completed')}
            </Button>
          </div>
        </div>

        <MatchAssignmentTable
          filteredRows={filteredRows}
          matchNumber=""
          stationCellClass={stationCellClass}
          getAssignedScout={getAssignedScout}
          isStationCompleted={isStationCompleted}
          getScoutColorClass={getScoutColorClass}
          isManualMode={assignmentMode === 'manual'}
          assignmentsConfirmed={assignmentsConfirmed}
          selectedScoutForAssignment={selectedScoutForAssignment}
          isDragAssigning={isDragAssigning}
          onStationPointerDown={onStationPointerDown}
          onStationPointerEnter={onStationPointerEnter}
          onStationPointerUp={onStationPointerUp}
          onStationClear={onStationClear}
          onStationToggleCompleted={onStationToggleCompleted}
        />
      </CardContent>
    </Card>
  );
};

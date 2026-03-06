import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import type { MatchScheduleTransferEntry } from '@/core/lib/matchScheduleTransfer';
import { PLAYER_STATIONS, type PlayerStation } from '@/core/lib/matchScoutAssignments';

interface MatchTeamDisplaySectionProps {
  filteredRows: MatchScheduleTransferEntry[];
  matchNumber: string;
  stationCellClass: (station: string, hasAssignment: boolean) => string;
  getAssignedScout: (matchNum: number, station: string) => string | undefined;
  getScoutColorClass: (scoutName: string) => string;
  isManualMode: boolean;
  selectedScoutForAssignment: string | null;
  isDragAssigning: boolean;
  onStationPointerDown: (matchNum: number, station: PlayerStation) => void;
  onStationPointerEnter: (matchNum: number, station: PlayerStation) => void;
  onStationPointerUp: () => void;
  onStationClear: (matchNum: number, station: PlayerStation) => void;
}

export const MatchTeamDisplaySection: React.FC<MatchTeamDisplaySectionProps> = ({
  filteredRows,
  matchNumber,
  stationCellClass,
  getAssignedScout,
  getScoutColorClass,
  isManualMode,
  selectedScoutForAssignment,
  isDragAssigning,
  onStationPointerDown,
  onStationPointerEnter,
  onStationPointerUp,
  onStationClear,
}) => {
  return (
    <div className="min-h-[600px] grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto p-1">
      {filteredRows.map((row) => (
        <Card key={`match-card-${row.matchNum}`} data-state={String(row.matchNum) === matchNumber ? 'selected' : undefined}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Match {row.matchNum}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs space-y-1">
              <p className="text-red-700 dark:text-red-300">Red: {row.redAlliance.join(' ')}</p>
              <p className="text-blue-700 dark:text-blue-300">Blue: {row.blueAlliance.join(' ')}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {PLAYER_STATIONS.map((station) => {
                const assignedScout = getAssignedScout(row.matchNum, station);
                const scoutColorClass = assignedScout ? getScoutColorClass(assignedScout) : '';
                const canAssign = isManualMode && Boolean(selectedScoutForAssignment);
                const canClear = isManualMode && Boolean(assignedScout);
                const isInteractive = canAssign || canClear;

                return (
                  <div
                    key={`card-${row.matchNum}-${station}`}
                    className={`rounded border p-2 transition-all ${stationCellClass(station, Boolean(assignedScout))} ${
                      isInteractive ? 'cursor-pointer hover:ring-2 hover:ring-blue-500/20' : ''
                    } ${canAssign ? 'select-none' : ''}`}
                    onPointerDown={() => {
                      if (canAssign) {
                        onStationPointerDown(row.matchNum, station);
                      }
                    }}
                    onPointerEnter={() => {
                      if (isDragAssigning && canAssign) {
                        onStationPointerEnter(row.matchNum, station);
                      }
                    }}
                    onPointerUp={onStationPointerUp}
                    onContextMenu={(event) => {
                      if (!canClear) return;
                      event.preventDefault();
                      onStationClear(row.matchNum, station);
                    }}
                    title={
                      canAssign
                        ? `${station.toUpperCase()} - Drag to assign ${selectedScoutForAssignment}`
                        : canClear
                          ? `${station.toUpperCase()} - Right click to clear`
                          : `${station.toUpperCase()} - Unassigned`
                    }
                  >
                    <p className="text-[11px] font-semibold uppercase">{station}</p>
                    {assignedScout ? (
                      <span className={`inline-block mt-1 rounded border px-2 py-0.5 text-xs font-medium ${scoutColorClass}`}>
                        {assignedScout}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Break / Unassigned</span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

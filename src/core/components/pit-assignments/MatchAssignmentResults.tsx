import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table';
import type { MatchScheduleTransferEntry } from '@/core/lib/matchScheduleTransfer';
import { PLAYER_STATIONS, type PlayerStation } from '@/core/lib/matchScoutAssignments';

interface MatchAssignmentResultsProps {
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

export const MatchAssignmentResults: React.FC<MatchAssignmentResultsProps> = ({
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
    <div className="min-h-[600px] rounded-md border overflow-auto max-h-[600px]">
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
          {filteredRows.map((row) => (
            <TableRow key={row.matchNum} data-state={String(row.matchNum) === matchNumber ? 'selected' : undefined}>
              <TableCell className="font-medium">{row.matchNum}</TableCell>
              <TableCell className="text-[14px] leading-4 text-red-700 dark:text-red-300">
                {row.redAlliance.join(' ')}
              </TableCell>
              <TableCell className="text-[12px] leading-4 text-blue-700 dark:text-blue-300">
                {row.blueAlliance.join(' ')}
              </TableCell>
              {PLAYER_STATIONS.map((station) => {
                const assignedScout = getAssignedScout(row.matchNum, station);
                const scoutColorClass = assignedScout ? getScoutColorClass(assignedScout) : '';
                const canAssign = isManualMode && Boolean(selectedScoutForAssignment);
                const canClear = isManualMode && Boolean(assignedScout);
                const isInteractive = canAssign || canClear;

                return (
                  <TableCell
                    key={`${row.matchNum}-${station}`}
                    className={`${stationCellClass(station, Boolean(assignedScout))} ${
                      isInteractive ? 'cursor-pointer select-none' : ''
                    }`}
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

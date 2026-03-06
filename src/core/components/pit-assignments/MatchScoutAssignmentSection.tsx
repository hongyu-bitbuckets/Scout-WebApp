import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useWebRTC } from '@/core/contexts/WebRTCContext';
import type { MatchScheduleTransferEntry } from '@/core/lib/matchScheduleTransfer';
import {
  buildMatchScoutAssignmentsPayload,
  loadMatchScoutAssignmentBlocks,
  saveMatchScoutAssignmentBlocks,
  type MatchScoutAssignmentBlock,
  type PlayerStation,
  PLAYER_STATIONS,
} from '@/core/lib/matchScoutAssignments';
import { MatchAssignmentControlsCard } from './match/MatchAssignmentControlsCard';
import { MatchAssignmentResults } from './match/MatchAssignmentResults';

type MatchAssignmentMode = 'sequential' | 'manual';

interface MatchScoutAssignmentSectionProps {
  eventKey: string;
  schedule: MatchScheduleTransferEntry[];
  availableScouts: string[];
  readyConnectedScoutsCount: number;
}

const getInitialAssignmentsConfirmed = (mode: MatchAssignmentMode): boolean => {
  return mode === 'sequential';
};

const createEmptyBlock = (matchNumber: number): MatchScoutAssignmentBlock => ({
  matchNumber,
  assignments: {},
  completedStations: [],
  updatedAt: Date.now(),
});

const toBlockMap = (blocks: MatchScoutAssignmentBlock[]) => {
  return new Map<number, MatchScoutAssignmentBlock>(blocks.map((block) => [block.matchNumber, block]));
};

export const MatchScoutAssignmentSection: React.FC<MatchScoutAssignmentSectionProps> = ({
  eventKey,
  schedule,
  availableScouts,
  readyConnectedScoutsCount,
}) => {
  const { pushDataToAll } = useWebRTC();
  const [assignmentMode, setAssignmentMode] = useState<MatchAssignmentMode>('sequential');
  const [chunkSize, setChunkSize] = useState<number>(3);
  const [selectedScoutForAssignment, setSelectedScoutForAssignment] = useState<string | null>(null);
  const [assignmentsConfirmed, setAssignmentsConfirmed] = useState<boolean>(true);
  const [assignmentBlocks, setAssignmentBlocks] = useState<MatchScoutAssignmentBlock[]>([]);
  const [isDragAssigning, setIsDragAssigning] = useState(false);

  useEffect(() => {
    if (!eventKey) {
      setAssignmentBlocks([]);
      return;
    }

    setAssignmentBlocks(loadMatchScoutAssignmentBlocks(eventKey));
  }, [eventKey]);

  useEffect(() => {
    if (!eventKey) {
      return;
    }

    saveMatchScoutAssignmentBlocks(eventKey, assignmentBlocks);
  }, [assignmentBlocks, eventKey]);

  useEffect(() => {
    const stopDragAssigning = () => setIsDragAssigning(false);
    window.addEventListener('pointerup', stopDragAssigning);

    return () => {
      window.removeEventListener('pointerup', stopDragAssigning);
    };
  }, []);

  const hasAssignments = useMemo(
    () => assignmentBlocks.some((block) => Object.keys(block.assignments).length > 0),
    [assignmentBlocks],
  );

  const updateStationAssignment = useCallback(
    (matchNum: number, station: PlayerStation, scoutName: string) => {
      setAssignmentBlocks((previous) => {
        const blockMap = toBlockMap(previous);
        const current = blockMap.get(matchNum) ?? createEmptyBlock(matchNum);

        blockMap.set(matchNum, {
          ...current,
          assignments: {
            ...current.assignments,
            [station]: scoutName,
          },
          updatedAt: Date.now(),
        });

        return Array.from(blockMap.values()).sort((a, b) => a.matchNumber - b.matchNumber);
      });
    },
    [],
  );

  const clearStationAssignment = useCallback((matchNum: number, station: PlayerStation) => {
    setAssignmentBlocks((previous) => {
      const blockMap = toBlockMap(previous);
      const current = blockMap.get(matchNum);

      if (!current) {
        return previous;
      }

      const nextAssignments = { ...current.assignments };
      delete nextAssignments[station];

      const nextCompleted = (current.completedStations ?? []).filter(
        (completedStation) => completedStation !== station,
      );

      blockMap.set(matchNum, {
        ...current,
        assignments: nextAssignments,
        completedStations: nextCompleted,
        updatedAt: Date.now(),
      });

      return Array.from(blockMap.values()).sort((a, b) => a.matchNumber - b.matchNumber);
    });
  }, []);

  const toggleStationCompleted = useCallback((matchNum: number, station: PlayerStation) => {
    setAssignmentBlocks((previous) => {
      const blockMap = toBlockMap(previous);
      const current = blockMap.get(matchNum);

      if (!current || !current.assignments[station]) {
        return previous;
      }

      const completedStations = new Set(current.completedStations ?? []);
      if (completedStations.has(station)) {
        completedStations.delete(station);
      } else {
        completedStations.add(station);
      }

      blockMap.set(matchNum, {
        ...current,
        completedStations: Array.from(completedStations),
        updatedAt: Date.now(),
      });

      return Array.from(blockMap.values()).sort((a, b) => a.matchNumber - b.matchNumber);
    });
  }, []);

  const handleAssignmentModeChange = (mode: MatchAssignmentMode) => {
    setAssignmentMode(mode);
    setSelectedScoutForAssignment(null);
    setAssignmentsConfirmed(getInitialAssignmentsConfirmed(mode));

    if (mode === 'manual') {
      setAssignmentBlocks([]);
    }
  };

  const handleChunkSizeChange = (value: number) => {
    const normalizedChunkSize = Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
    setChunkSize(normalizedChunkSize);
  };

  const handleGenerateAssignments = () => {
    if (!eventKey) {
      toast.error('No active event selected');
      return;
    }

    if (availableScouts.length === 0) {
      toast.error('Add or connect at least one scout before generating assignments');
      return;
    }

    if (schedule.length === 0) {
      toast.error('Load match schedule data before generating assignments');
      return;
    }

    if (assignmentMode === 'manual') {
      setAssignmentBlocks([]);
      setAssignmentsConfirmed(false);
      toast.info('Manual mode ready. Select a scout and assign station cells.');
      return;
    }

    const nextBlocks = schedule.map((row, rowIndex) => {
      const chunkIndex = Math.floor(rowIndex / chunkSize);
      const assignments: Partial<Record<PlayerStation, string>> = {};

      PLAYER_STATIONS.forEach((station, stationIndex) => {
        const scoutIndex = (chunkIndex * PLAYER_STATIONS.length + stationIndex) % availableScouts.length;
        const scoutName = availableScouts[scoutIndex];
        if (scoutName) {
          assignments[station] = scoutName;
        }
      });

      return {
        matchNumber: row.matchNum,
        assignments,
        completedStations: [],
        updatedAt: Date.now(),
      };
    });

    setAssignmentBlocks(nextBlocks);
    setAssignmentsConfirmed(true);
    toast.success(`Generated assignments for ${nextBlocks.length} matches`);
  };

  const handleConfirmAssignments = () => {
    setAssignmentsConfirmed(true);
    setSelectedScoutForAssignment(null);
  };

  const handleClearAssignments = () => {
    setAssignmentBlocks([]);
    setAssignmentsConfirmed(getInitialAssignmentsConfirmed(assignmentMode));
    setSelectedScoutForAssignment(null);
    setIsDragAssigning(false);
  };

  const handleStationPointerDown = (matchNum: number, station: PlayerStation) => {
    if (assignmentMode !== 'manual' || assignmentsConfirmed || !selectedScoutForAssignment) {
      return;
    }

    updateStationAssignment(matchNum, station, selectedScoutForAssignment);
    setIsDragAssigning(true);
  };

  const handleStationPointerEnter = (matchNum: number, station: PlayerStation) => {
    if (!isDragAssigning || assignmentMode !== 'manual' || assignmentsConfirmed || !selectedScoutForAssignment) {
      return;
    }

    updateStationAssignment(matchNum, station, selectedScoutForAssignment);
  };

  const handlePushAssignments = () => {
    if (!eventKey) {
      toast.error('No active event selected');
      return;
    }

    if (!hasAssignments) {
      toast.error('Generate or create assignments first');
      return;
    }

    if (readyConnectedScoutsCount === 0) {
      toast.error('No connected scouts available to receive assignments');
      return;
    }

    const sourceScoutName = localStorage.getItem('currentScout') || 'Lead Scout';
    const payload = buildMatchScoutAssignmentsPayload(eventKey, sourceScoutName, assignmentBlocks);

    pushDataToAll(payload, 'match');
    toast.success(
      `Pushed match assignments to ${readyConnectedScoutsCount} connected scout${
        readyConnectedScoutsCount === 1 ? '' : 's'
      }`,
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <MatchAssignmentControlsCard
          assignmentMode={assignmentMode}
          chunkSize={chunkSize}
          hasAssignments={hasAssignments}
          hasSchedule={schedule.length > 0}
          readyConnectedScoutsCount={readyConnectedScoutsCount}
          onAssignmentModeChange={handleAssignmentModeChange}
          onChunkSizeChange={handleChunkSizeChange}
          onGenerateAssignments={handleGenerateAssignments}
          onPushAssignments={handlePushAssignments}
        />
      </div>

      <MatchAssignmentResults
        scheduleRows={schedule}
        assignmentBlocks={assignmentBlocks}
        scoutsList={availableScouts}
        assignmentMode={assignmentMode}
        assignmentsConfirmed={assignmentsConfirmed}
        selectedScoutForAssignment={selectedScoutForAssignment}
        isDragAssigning={isDragAssigning}
        onScoutSelectionChange={setSelectedScoutForAssignment}
        onStationPointerDown={handleStationPointerDown}
        onStationPointerEnter={handleStationPointerEnter}
        onStationPointerUp={() => setIsDragAssigning(false)}
        onStationClear={clearStationAssignment}
        onStationToggleCompleted={toggleStationCompleted}
        onConfirmAssignments={handleConfirmAssignments}
        onClearAllAssignments={handleClearAssignments}
      />
    </div>
  );
};

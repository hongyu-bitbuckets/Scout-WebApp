import React from 'react';
import type { PitAssignment } from '@/core/lib/pitAssignmentTypes';
import { ScoutSelectionBar } from '../shared/ScoutSelectionBar';

interface PitScoutSelectionBarProps {
  scoutsList: string[];
  assignments: PitAssignment[];
  assignmentMode: 'sequential' | 'spatial' | 'manual';
  assignmentsConfirmed: boolean;
  selectedScoutForAssignment?: string | null;
  onScoutSelectionChange?: (scoutName: string | null) => void;
  hasAssignments: boolean;
}

export const PitScoutSelectionBar: React.FC<PitScoutSelectionBarProps> = ({
  scoutsList,
  assignments,
  assignmentMode,
  assignmentsConfirmed,
  selectedScoutForAssignment,
  onScoutSelectionChange,
  hasAssignments: _hasAssignments
}) => {
  const isInteractive = assignmentMode === 'manual' && !assignmentsConfirmed;
  const scouts = scoutsList.map((scout) => {
    const scoutAssignments = assignments.filter((assignment) => assignment.scoutName === scout);
    const completedCount = scoutAssignments.filter((assignment) => assignment.completed).length;

    return {
      scoutName: scout,
      totalAssignments: scoutAssignments.length,
      completedAssignments: completedCount,
    };
  });

  return (
    <ScoutSelectionBar
      scouts={scouts}
      isInteractive={isInteractive}
      selectedScoutForAssignment={selectedScoutForAssignment}
      onScoutSelectionChange={onScoutSelectionChange}
    />
  );
};
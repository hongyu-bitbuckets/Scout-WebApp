import React from 'react';
import { PitScoutSelectionBar } from './PitScoutSelectionBar';
import { AssignmentActionButtons as PitAssignmentActionButtons } from '../shared/AssignmentActionButtons';
import { AssignmentLegend } from '../shared/AssignmentLegend';
import type { PitAssignment } from '@/core/lib/pitAssignmentTypes';

interface PitScoutLegendProps {
  scoutsList: string[];
  assignments: PitAssignment[];
  assignmentMode: 'sequential' | 'spatial' | 'manual';
  assignmentsConfirmed: boolean;
  selectedScoutForAssignment?: string | null;
  onScoutSelectionChange?: (scoutName: string | null) => void;
  onClearAllAssignments?: () => void;
  onConfirmAssignments?: () => void;
  hasAssignments: boolean;
  showMobileActions?: boolean;
  helpText?: string;
}

export const PitScoutLegend: React.FC<PitScoutLegendProps> = ({
  scoutsList,
  assignments,
  assignmentMode,
  assignmentsConfirmed,
  selectedScoutForAssignment,
  onScoutSelectionChange,
  onClearAllAssignments,
  onConfirmAssignments,
  hasAssignments,
  showMobileActions = false,
  helpText
}) => {
  const completedCount = assignments.filter((assignment) => assignment.completed).length;
  const title = assignmentMode === 'manual' && !assignmentsConfirmed
    ? 'Scouts (Click to Select):'
    : 'Assignment Legend:';

  return (
    <AssignmentLegend
      title={title}
      scoutsCount={scoutsList.length}
      selectionContent={
        <PitScoutSelectionBar
          scoutsList={scoutsList}
          assignments={assignments}
          assignmentMode={assignmentMode}
          assignmentsConfirmed={assignmentsConfirmed}
          selectedScoutForAssignment={selectedScoutForAssignment}
          onScoutSelectionChange={onScoutSelectionChange}
          hasAssignments={hasAssignments}
        />
      }
      progress={
        hasAssignments
          ? {
              completedCount,
              totalCount: assignments.length,
            }
          : undefined
      }
      mobileActions={
        showMobileActions ? (
          <div className="md:hidden mt-3">
            <PitAssignmentActionButtons
              assignmentMode={assignmentMode}
              assignmentsConfirmed={assignmentsConfirmed}
              assignmentsLength={assignments.length}
              onClearAllAssignments={onClearAllAssignments}
              onConfirmAssignments={onConfirmAssignments}
              isMobile={true}
            />
          </div>
        ) : undefined
      }
      helpText={helpText}
    />
  );
};
import React from 'react';
import { AssignmentLegend } from '../shared/AssignmentLegend';
import { ScoutSelectionBar, type ScoutSelectionItem } from '../shared/ScoutSelectionBar';

interface MatchScoutLegendProps {
  scoutsList: string[];
  assignmentCountsByScout: Record<string, { assigned: number; completed?: number }>;
  selectedScoutForAssignment?: string | null;
  onScoutSelectionChange?: (scoutName: string | null) => void;
  interactive?: boolean;
  title?: string;
  helpText?: string;
  showProgress?: boolean;
  completedCount?: number;
  totalCount?: number;
  mobileActions?: React.ReactNode;
}

export const MatchScoutLegend: React.FC<MatchScoutLegendProps> = ({
  scoutsList,
  assignmentCountsByScout,
  selectedScoutForAssignment,
  onScoutSelectionChange,
  interactive = false,
  title = 'Scout Assignments:',
  helpText,
  showProgress = true,
  completedCount,
  totalCount,
  mobileActions,
}) => {
  const scouts: ScoutSelectionItem[] = scoutsList.map((scoutName) => {
    const counts = assignmentCountsByScout[scoutName];

    return {
      scoutName,
      totalAssignments: counts?.assigned ?? 0,
      completedAssignments: counts?.completed ?? 0,
    };
  });

  const derivedTotalCount = totalCount ?? scouts.reduce((sum, scout) => sum + scout.totalAssignments, 0);
  const derivedCompletedCount =
    completedCount ?? scouts.reduce((sum, scout) => sum + (scout.completedAssignments ?? 0), 0);

  return (
    <AssignmentLegend
      title={title}
      scoutsCount={scoutsList.length}
      selectionContent={
        <ScoutSelectionBar
          scouts={scouts}
          isInteractive={interactive}
          selectedScoutForAssignment={selectedScoutForAssignment}
          onScoutSelectionChange={onScoutSelectionChange}
        />
      }
      progress={
        showProgress
          ? {
              completedCount: derivedCompletedCount,
              totalCount: derivedTotalCount,
            }
          : undefined
      }
      mobileActions={mobileActions}
      helpText={helpText}
    />
  );
};

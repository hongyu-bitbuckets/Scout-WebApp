import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { getScoutColor } from './scoutUtils';

export interface ScoutSelectionItem {
  scoutName: string;
  totalAssignments: number;
  completedAssignments?: number;
}

interface ScoutSelectionBarProps {
  scouts: ScoutSelectionItem[];
  isInteractive: boolean;
  selectedScoutForAssignment?: string | null;
  onScoutSelectionChange?: (scoutName: string | null) => void;
}

export const ScoutSelectionBar: React.FC<ScoutSelectionBarProps> = ({
  scouts,
  isInteractive,
  selectedScoutForAssignment,
  onScoutSelectionChange,
}) => {
  const handleScoutSelect = (scoutName: string) => {
    if (!isInteractive) {
      return;
    }

    if (selectedScoutForAssignment === scoutName) {
      onScoutSelectionChange?.(null);
      return;
    }

    onScoutSelectionChange?.(scoutName);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {scouts.map((scout, index) => {
        const completedCount = scout.completedAssignments ?? 0;
        const isSelected = isInteractive && selectedScoutForAssignment === scout.scoutName;

        return (
          <Button
            key={scout.scoutName}
            variant={isSelected ? 'default' : 'outline'}
            size="default"
            className={`${getScoutColor(index)} px-2 ${
              isInteractive
                ? `transition-all hover:scale-105 active:scale-95 ${
                    isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-sm'
                  }`
                : 'cursor-default'
            }`}
            title={
              isInteractive
                ? `${scout.scoutName} - ${scout.totalAssignments} assignments - Click to select for assignment`
                : `${completedCount}/${scout.totalAssignments} assignments completed`
            }
            onClick={isInteractive ? () => handleScoutSelect(scout.scoutName) : undefined}
            disabled={false}
          >
            <div className="flex items-center gap-1">
              {isInteractive && <Plus className="h-3 w-3" />}
              <span>{scout.scoutName} ({scout.totalAssignments})</span>
            </div>
          </Button>
        );
      })}
    </div>
  );
};

import React from 'react';
import { Progress } from "@/core/components/ui/progress";
interface AssignmentProgressBarFromItemsProps {
  assignments: Array<{ completed: boolean }>;
  className?: string;
}

interface AssignmentProgressBarFromCountsProps {
  completedCount: number;
  totalCount: number;
  className?: string;
}

type AssignmentProgressBarProps = AssignmentProgressBarFromItemsProps | AssignmentProgressBarFromCountsProps;

export const AssignmentProgressBar: React.FC<AssignmentProgressBarProps> = (props) => {
  const className = props.className ?? '';

  const counts = 'assignments' in props
    ? {
        completedCount: props.assignments.filter((assignment) => assignment.completed).length,
        totalCount: props.assignments.length,
      }
    : {
        completedCount: props.completedCount,
        totalCount: props.totalCount,
      };

  const { completedCount, totalCount } = counts;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="font-medium">Progress:</span>
        <span>{completedCount} of {totalCount} completed ({percentage}%)</span>
      </div>
      <Progress 
        value={totalCount > 0 ? (completedCount / totalCount) * 100 : 0}
        className="w-full"
      />
    </div>
  );
};
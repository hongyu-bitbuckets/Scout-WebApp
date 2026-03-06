import React from 'react';
import { AssignmentProgressBar } from './AssignmentProgressBar';

interface AssignmentLegendProps {
  title: string;
  scoutsCount: number;
  selectionContent: React.ReactNode;
  progress?: {
    completedCount: number;
    totalCount: number;
  };
  mobileActions?: React.ReactNode;
  helpText?: string;
  className?: string;
}

export const AssignmentLegend: React.FC<AssignmentLegendProps> = ({
  title,
  scoutsCount,
  selectionContent,
  progress,
  mobileActions,
  helpText,
  className = '',
}) => {
  return (
    <div className={`mb-4 p-4 rounded-lg border ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{scoutsCount} scouts</div>
      </div>

      <div className="mb-3">{selectionContent}</div>

      {progress && (
        <div className="mt-3 p-3">
          <AssignmentProgressBar
            completedCount={progress.completedCount}
            totalCount={progress.totalCount}
          />
          {mobileActions}
        </div>
      )}

      {helpText && <div className="text-xs text-muted-foreground pt-4">{helpText}</div>}
    </div>
  );
};

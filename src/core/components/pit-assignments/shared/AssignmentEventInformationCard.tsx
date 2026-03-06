import React from 'react';
import { AlertCircle, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Alert, AlertDescription } from '@/core/components/ui/alert';

type TeamDataSource = 'nexus' | 'tba' | null;

interface AssignmentEventInformationCardProps {
  variant: 'pit' | 'match';
  selectedEvent: string;
  teamDataSource: TeamDataSource;
  teamCount: number;
  hasData: boolean;
  scheduleCount?: number;
  pitLocationCount?: number;
}

const renderDataSource = (teamDataSource: TeamDataSource, variant: 'pit' | 'match') => {
  if (teamDataSource === 'nexus') {
    if (variant === 'pit') {
      return (
        <span className="text-blue-600 flex items-center gap-1">
          <span>Nexus</span>
          <span className="text-xs text-muted-foreground">(with pit locations)</span>
        </span>
      );
    }

    return <span className="text-blue-600">Nexus</span>;
  }

  if (teamDataSource === 'tba') {
    return <span className="text-orange-600">TBA</span>;
  }

  return <span className="text-muted-foreground">Unknown</span>;
};

export const AssignmentEventInformationCard: React.FC<AssignmentEventInformationCardProps> = ({
  variant,
  selectedEvent,
  teamDataSource,
  teamCount,
  hasData,
  scheduleCount,
  pitLocationCount,
}) => {
  const emptyMessage =
    variant === 'pit'
      ? 'No team data found. Please import team lists from the TBA Data page or load demo data from the home page.'
      : 'No event data found. Import TBA data first so schedules and team lists are available.';

  const footerMessage =
    variant === 'pit'
      ? teamDataSource === 'nexus'
        ? 'Teams extracted from Nexus pit addresses. Pit locations available for enhanced assignments.'
        : 'Teams imported from The Blue Alliance. Import new data on the TBA Data page to change events.'
      : 'Use Assignment Controls to auto-generate station chunk rotations, or switch to manual mode and drag to assign scouts by station.';

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Event Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{emptyMessage}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Event:</span>
                <span className="text-lg font-semibold text-primary">{selectedEvent}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {variant === 'pit' ? 'Teams to Scout:' : 'Teams Loaded:'}
                </span>
                <span className="text-lg font-semibold">{teamCount}</span>
              </div>

              {variant === 'match' && typeof scheduleCount === 'number' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Matches Loaded:</span>
                  <span className="text-lg font-semibold">{scheduleCount}</span>
                </div>
              )}

              {variant === 'pit' && typeof pitLocationCount === 'number' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">With Pit Locations:</span>
                  <span className="text-sm font-semibold text-blue-600">{pitLocationCount} teams</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Data Source:</span>
                <span className="text-sm font-medium capitalize">
                  {renderDataSource(teamDataSource, variant)}
                </span>
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t">{footerMessage}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

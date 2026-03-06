import React from 'react';
import { AlertCircle, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Alert, AlertDescription } from '@/core/components/ui/alert';

interface MatchEventInformationCardProps {
  selectedEvent: string;
  teamDataSource: 'nexus' | 'tba' | null;
  teamCount: number;
  scheduleCount: number;
}

export const MatchEventInformationCard: React.FC<MatchEventInformationCardProps> = ({
  selectedEvent,
  teamDataSource,
  teamCount,
  scheduleCount,
}) => {
  const hasData = selectedEvent.trim().length > 0;

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
            <AlertDescription>
              No event data found. Import TBA data first so schedules and team lists are available.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Event:</span>
              <span className="text-base font-semibold text-primary">{selectedEvent}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Teams Loaded:</span>
              <span className="text-base font-semibold">{teamCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Matches Loaded:</span>
              <span className="text-base font-semibold">{scheduleCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Data Source:</span>
              <span className="text-sm font-medium capitalize">
                {teamDataSource === 'nexus' ? (
                  <span className="text-blue-600">Nexus</span>
                ) : teamDataSource === 'tba' ? (
                  <span className="text-orange-600">TBA</span>
                ) : (
                  <span className="text-muted-foreground">Unknown</span>
                )}
              </span>
            </div>
            <p className="text-xs text-muted-foreground pt-2 border-t">
              Use Assignment Controls to auto-generate station chunk rotations. Manual block editing will be added later.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

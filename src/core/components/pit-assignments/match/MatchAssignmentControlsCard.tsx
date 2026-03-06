import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Shuffle, Upload } from 'lucide-react';

type MatchAssignmentMode = 'sequential' | 'manual';

interface MatchAssignmentControlsCardProps {
  assignmentMode: MatchAssignmentMode;
  chunkSize: number;
  hasAssignments: boolean;
  hasSchedule: boolean;
  readyConnectedScoutsCount: number;
  onAssignmentModeChange: (mode: MatchAssignmentMode) => void;
  onChunkSizeChange: (value: number) => void;
  onGenerateAssignments: () => void;
  onPushAssignments: () => void;
}

export const MatchAssignmentControlsCard: React.FC<MatchAssignmentControlsCardProps> = ({
  assignmentMode,
  chunkSize,
  hasAssignments,
  hasSchedule,
  readyConnectedScoutsCount,
  onAssignmentModeChange,
  onChunkSizeChange,
  onGenerateAssignments,
  onPushAssignments,
}) => {
  const modeDescription =
    assignmentMode === 'sequential'
      ? 'Auto Rotation: assign scouts in fixed match chunks, then rotate station ownership between chunks for balanced coverage.'
      : 'Manual Assignment: select a scout, then click-and-drag across station cells to assign quickly.';

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shuffle className="h-5 w-5" />
          Assignment Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Assignment Mode:</label>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={assignmentMode === 'sequential' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onAssignmentModeChange('sequential')}
              >
                Auto Rotation
              </Button>
              <Button
                variant={assignmentMode === 'manual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onAssignmentModeChange('manual')}
              >
                Manual Assignment
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{modeDescription}</p>
          </div>

          {assignmentMode === 'sequential' && (
            <div>
              <label className="text-sm font-medium mb-2 block" htmlFor="chunk-size-input">
                Matches Per Chunk:
              </label>
              <Input
                id="chunk-size-input"
                type="number"
                min={1}
                step={1}
                value={chunkSize}
                onChange={(event) => onChunkSizeChange(Number.parseInt(event.target.value, 10) || 1)}
                className="max-w-40"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Scouts keep station assignments inside each chunk and rotate when the next chunk starts.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              disabled={!hasSchedule || hasAssignments}
              onClick={onGenerateAssignments}
              className="flex items-center gap-2"
            >
              <Shuffle className="h-4 w-4" />
              Generate Assignments
            </Button>

            <Button
              variant="outline"
              disabled={!hasAssignments || readyConnectedScoutsCount === 0}
              onClick={onPushAssignments}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Push Assignments ({readyConnectedScoutsCount})
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

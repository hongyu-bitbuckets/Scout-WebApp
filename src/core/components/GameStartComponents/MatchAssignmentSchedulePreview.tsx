import { useMemo } from "react";
import { Badge } from "@/core/components/ui/badge";
import { Label } from "@/core/components/ui/label";
import { formatTeamDisplayForEvent } from "@/core/lib/teamMetadata";
import { loadMatchScoutAssignmentBlocks, type PlayerStation } from "@/core/lib/matchScoutAssignments";

interface MatchAssignmentSchedulePreviewProps {
  eventKey: string;
  currentScout: string;
  matchNumber: string;
}

const TRACKED_TEAM_NUMBER = "4183";

const getStationDisplayLabel = (station: PlayerStation): string => {
  const [alliance = "", position = ""] = station.split("-");
  return `${alliance.toUpperCase()} ${position}`;
};

const getAssignedTeamForStation = (
  assignedMatchNumber: number,
  station: PlayerStation,
): string | null => {
  try {
    const rawMatchData = localStorage.getItem("matchData");
    const parsedMatchData = rawMatchData ? JSON.parse(rawMatchData) : null;

    if (!Array.isArray(parsedMatchData)) {
      return null;
    }

    const matchRow = parsedMatchData[assignedMatchNumber - 1];
    if (!matchRow || typeof matchRow !== "object") {
      return null;
    }

    const [alliance = "", stationIndex = ""] = station.split("-");
    const allianceKey = alliance === "red" ? "redAlliance" : "blueAlliance";
    const index = Number.parseInt(stationIndex, 10) - 1;
    const teams = (matchRow as Record<string, unknown>)[allianceKey];

    if (!Array.isArray(teams) || index < 0 || index >= teams.length) {
      return null;
    }

    const team = String(teams[index] ?? "").trim();
    return team || null;
  } catch {
    return null;
  }
};

export const MatchAssignmentSchedulePreview = ({
  eventKey,
  currentScout,
  matchNumber,
}: MatchAssignmentSchedulePreviewProps) => {
  const currentMatchNumberAsInt = Number.parseInt(matchNumber, 10);

  const assignmentSchedulePreview = useMemo(() => {
    if (!eventKey || !currentScout) {
      return [] as Array<{ matchNumber: number; station: PlayerStation }>;
    }

    const normalizedScout = currentScout.trim().toLowerCase();
    const blocks = loadMatchScoutAssignmentBlocks(eventKey);

    return blocks
      .map((block) => {
        const assignedStation = Object.entries(block.assignments).find(([, assignedScoutName]) => {
          return assignedScoutName?.trim().toLowerCase() === normalizedScout;
        })?.[0] as PlayerStation | undefined;

        if (!assignedStation) {
          return null;
        }

        return {
          matchNumber: block.matchNumber,
          station: assignedStation,
        };
      })
      .filter((assignment): assignment is { matchNumber: number; station: PlayerStation } => assignment !== null)
      .sort((a, b) => a.matchNumber - b.matchNumber);
  }, [eventKey, currentScout]);

  const visibleAssignmentSchedule = useMemo(() => {
    if (assignmentSchedulePreview.length <= 8) {
      return assignmentSchedulePreview;
    }

    if (!Number.isFinite(currentMatchNumberAsInt) || currentMatchNumberAsInt <= 0) {
      return assignmentSchedulePreview.slice(0, 8);
    }

    const startIndex = Math.max(
      0,
      assignmentSchedulePreview.findIndex((assignment) => assignment.matchNumber >= currentMatchNumberAsInt) - 1,
    );

    return assignmentSchedulePreview.slice(startIndex, startIndex + 8);
  }, [assignmentSchedulePreview, currentMatchNumberAsInt]);

  const trackedTeamMatches = useMemo(() => {
    return assignmentSchedulePreview
      .map((assignment) => {
        const assignedTeam = getAssignedTeamForStation(assignment.matchNumber, assignment.station);
        if (assignedTeam !== TRACKED_TEAM_NUMBER) {
          return null;
        }

        return assignment.matchNumber;
      })
      .filter((matchNum): matchNum is number => matchNum !== null);
  }, [assignmentSchedulePreview]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Assignment Schedule Preview</Label>
        <span className="text-xs text-muted-foreground">
          {assignmentSchedulePreview.length > 0
            ? `${assignmentSchedulePreview.length} assigned matches`
            : "No assignments for this scout"}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Team {TRACKED_TEAM_NUMBER} matches: {trackedTeamMatches.length > 0 ? trackedTeamMatches.join(", ") : "none"}
      </p>

      {visibleAssignmentSchedule.length > 0 ? (
        <div className="rounded-md border border-input bg-muted/40 p-3 space-y-2">
          {visibleAssignmentSchedule.map((assignment) => {
            const isCurrentMatch = Number.isFinite(currentMatchNumberAsInt)
              && assignment.matchNumber === currentMatchNumberAsInt;
            const assignedTeam = getAssignedTeamForStation(assignment.matchNumber, assignment.station);
            const isTrackedTeam = assignedTeam === TRACKED_TEAM_NUMBER;

            return (
              <div
                key={`${assignment.matchNumber}-${assignment.station}`}
                className={`flex items-center justify-between rounded px-2 py-1.5 ${isCurrentMatch ? "bg-primary/15 border border-primary/30" : isTrackedTeam ? "bg-amber-100/70 border border-amber-300/60" : "bg-background/70"}`}
              >
                <div className="flex items-center gap-2">
                  <Badge variant={isCurrentMatch ? "default" : "secondary"}>
                    Match {assignment.matchNumber}
                  </Badge>
                  <span className="text-sm font-medium">{getStationDisplayLabel(assignment.station)}</span>
                  {isCurrentMatch && (
                    <Badge variant="outline" className="text-xs">Current</Badge>
                  )}
                  {isTrackedTeam && (
                    <Badge variant="outline" className="text-xs">Team {TRACKED_TEAM_NUMBER}</Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {assignedTeam ? formatTeamDisplayForEvent(eventKey, assignedTeam) : "Team TBD"}
                </span>
              </div>
            );
          })}

          {assignmentSchedulePreview.length > visibleAssignmentSchedule.length && (
            <p className="text-xs text-muted-foreground pt-1">
              Showing {visibleAssignmentSchedule.length} of {assignmentSchedulePreview.length} assigned matches.
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No match assignment schedule found for {currentScout} in this event yet.
        </p>
      )}
    </div>
  );
};

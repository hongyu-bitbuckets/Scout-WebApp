import React, { useState } from "react";
import { CardTitle } from "@/core/components/ui/card";
import { Label } from "@/core/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/core/components/ui/select";

interface Props {
  matchNumber: string;
}

const PLAYER_STATIONS = ["red-1","red-2","red-3","blue-1","blue-2","blue-3"];

export const MatchScoutAssignmentSection: React.FC<Props> = ({ matchNumber }) => {
  const [roleAssignments, setRoleAssignments] = useState(() => {
    const initial: Record<string, string> = {};
    PLAYER_STATIONS.forEach(station => {
      initial[station] = localStorage.getItem(`role-assignment-${matchNumber}-${station}`) || "dataScouter";
    });
    return initial;
  });

  const handleRoleChange = (station: string, role: string) => {
    setRoleAssignments(prev => ({ ...prev, [station]: role }));
    localStorage.setItem(`role-assignment-${matchNumber}-${station}`, role);
  };

  return (
    <div className="space-y-2">
      <CardTitle className="text-lg">Assign Roles to Player Stations</CardTitle>
      <div className="grid grid-cols-2 gap-4">
        {PLAYER_STATIONS.map(station => (
          <div key={station} className="flex flex-col gap-1">
            <Label>{station.toUpperCase()}</Label>
            <Select
              value={roleAssignments[station]}
              onValueChange={role => handleRoleChange(station, role)}
            >
              <SelectTrigger className="w-full h-10 text-base" />
              <SelectContent>
                <SelectItem value="commentScouter">Comment Scouter</SelectItem>
                <SelectItem value="dataScouter">Data Scouter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground pt-2">Roles are bonded to player station for this match. Scouts will receive their assigned role when selecting their station.</p>
    </div>
  );
};

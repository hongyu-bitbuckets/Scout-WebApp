import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Label } from "@/core/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/core/components/ui/select";
import { Button } from "@/core/components/ui/button";
import { Upload, Users, X } from 'lucide-react';
import { useWebRTC } from '@/core/contexts/WebRTCContext';
import { toast } from 'sonner';

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

  const { connectedScouts, pushDataToAll } = useWebRTC();

  const readyConnectedScoutsCount = useMemo(() => {
    return connectedScouts.filter((scout) => {
      const channelState = scout.channel?.readyState || scout.dataChannel?.readyState;
      return scout.status === 'connected' && channelState === 'open';
    }).length;
  }, [connectedScouts]);

  const handlePushRoles = () => {
    if (readyConnectedScoutsCount === 0) {
      toast.error('No connected scouts available to receive roles');
      return;
    }

    const sourceScoutName = localStorage.getItem('currentScout') || 'Lead Scout';
    const payload = {
      matchNumber,
      roles: roleAssignments,
      sourceScoutName,
      generatedAt: Date.now(),
    };

    pushDataToAll(payload, 'match');
    toast.success(`Pushed roles to ${readyConnectedScoutsCount} connected scout${readyConnectedScoutsCount === 1 ? '' : 's'}`);
  };

  const handleClearRoles = () => {
    PLAYER_STATIONS.forEach(station => {
      localStorage.removeItem(`role-assignment-${matchNumber}-${station}`);
    });
    const reset: Record<string, string> = {};
    PLAYER_STATIONS.forEach(station => reset[station] = 'dataScouter');
    setRoleAssignments(reset);
    toast.success('Cleared role assignments for this match');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Roles — Match {matchNumber}
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button onClick={handleClearRoles} variant="outline" className="text-sm">
              <X className="h-4 w-4" />
              Clear
            </Button>
            <Button onClick={handlePushRoles} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Push Roles ({readyConnectedScoutsCount})
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
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
      {/* Mobile action buttons */}
      <div className="pt-3 md:hidden flex gap-2">
        <Button onClick={handleClearRoles} variant="outline" className="flex-1">
          Clear
        </Button>
        <Button onClick={handlePushRoles} disabled={readyConnectedScoutsCount === 0} className="flex-1">
          Push Roles ({readyConnectedScoutsCount})
        </Button>
      </div>
      </CardContent>
    </Card>
  );
};

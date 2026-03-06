import { useMemo } from 'react';
import type { ConnectedScout } from '@/core/contexts/WebRTCContext';

interface ScoutAvailabilityResult {
  availableScouts: string[];
  readyConnectedScoutsCount: number;
}

export const useScoutAvailability = (
  scoutsList: string[],
  connectedScouts: ConnectedScout[]
): ScoutAvailabilityResult => {
  const availableScouts = useMemo(() => {
    const activeConnectedScoutNames = connectedScouts
      .filter((scout) => scout.status !== 'disconnected')
      .map((scout) => scout.name.trim())
      .filter((name) => name.length > 0);

    return Array.from(new Set([...scoutsList, ...activeConnectedScoutNames])).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [scoutsList, connectedScouts]);

  const readyConnectedScoutsCount = useMemo(() => {
    return connectedScouts.filter((scout) => {
      const channelState = scout.channel?.readyState || scout.dataChannel?.readyState;
      return scout.status === 'connected' && channelState === 'open';
    }).length;
  }, [connectedScouts]);

  return {
    availableScouts,
    readyConnectedScoutsCount,
  };
};

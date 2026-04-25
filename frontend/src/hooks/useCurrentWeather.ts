import { useQuery } from '@tanstack/react-query';
import { api, HAState } from '../api/client';
import { CURRENT_ENTITY_IDS, POLL_INTERVAL_MS } from '../constants/entities';

export function useCurrentWeather() {
  return useQuery({
    queryKey: ['current-weather'],
    queryFn: () => api.states(CURRENT_ENTITY_IDS).then((r) => r.data),
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: true,
    staleTime: POLL_INTERVAL_MS - 5000,
    select: (data: Record<string, HAState>) => data,
  });
}

export function val(states: Record<string, HAState> | undefined, id: string): string {
  return states?.[id]?.state ?? '—';
}

export function numVal(states: Record<string, HAState> | undefined, id: string): number | null {
  const v = parseFloat(states?.[id]?.state ?? '');
  return isNaN(v) ? null : v;
}

export function unit(states: Record<string, HAState> | undefined, id: string): string {
  return (states?.[id]?.attributes?.unit_of_measurement as string) ?? '';
}

export function lastUpdated(states: Record<string, HAState> | undefined, id: string): Date | null {
  const s = states?.[id]?.last_updated;
  return s ? new Date(s) : null;
}

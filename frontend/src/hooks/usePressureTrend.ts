import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { ENTITIES } from '../constants/entities';

export type PressureTrend = 'rising' | 'falling' | 'steady';

async function fetchTrend(): Promise<PressureTrend> {
  const { data } = await api.history(ENTITIES.pressure, 3);
  if (!data || data.length < 4) return 'steady';

  const quarter = Math.max(1, Math.floor(data.length / 4));
  const early = data.slice(0, quarter).reduce((s, p) => s + p.v, 0) / quarter;
  const late  = data.slice(-quarter).reduce((s, p) => s + p.v, 0) / quarter;
  const delta = late - early;

  if (delta > 0.05) return 'rising';
  if (delta < -0.05) return 'falling';
  return 'steady';
}

export function usePressureTrend() {
  return useQuery({
    queryKey: ['pressure-trend'],
    queryFn: fetchTrend,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

import { useQuery } from '@tanstack/react-query';
import { api, HistoryPoint } from '../api/client';
import { HISTORY_REFRESH_MS } from '../constants/entities';

export function useHistoricalData(entityId: string, hours: number) {
  return useQuery({
    queryKey: ['history', entityId, hours],
    queryFn: () => api.history(entityId, hours).then((r) => r.data),
    refetchInterval: HISTORY_REFRESH_MS,
    staleTime: HISTORY_REFRESH_MS - 30_000,
    enabled: !!entityId,
    select: (data: HistoryPoint[]) => data,
  });
}

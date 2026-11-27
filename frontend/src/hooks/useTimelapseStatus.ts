import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useTimelapseStatus() {
  return useQuery({
    queryKey: ['timelapse-status'],
    queryFn: () => api.timelapse().then((r) => r.data),
    refetchInterval: 5 * 60_000,
  });
}

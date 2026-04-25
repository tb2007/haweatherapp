import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useWebcam() {
  return useQuery({
    queryKey: ['webcam-config'],
    queryFn: () => api.webcam().then((r) => r.data),
    staleTime: Infinity,
  });
}

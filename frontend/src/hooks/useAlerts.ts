import { useQuery } from '@tanstack/react-query';
import { alertsService } from '@/services/alerts.service';

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: alertsService.getAlerts,
    refetchInterval: 60000, // Refrescar cada minuto
  });
}

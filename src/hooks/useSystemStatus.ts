import { useEmergencyData } from '@/src/context/EmergencyDataContext';

export function useSystemStatus() {
  const { telemetry, isLoading, error, refreshData, stats } = useEmergencyData();

  return {
    telemetry,
    isLoading,
    error,
    refreshData,
    stats,
  };
}

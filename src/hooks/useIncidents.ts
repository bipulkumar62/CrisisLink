import { useMemo, useState } from 'react';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { IncidentSeverity, IncidentStatus, IncidentCategory } from '@/src/types/incident';

export interface IncidentFilters {
  severity: IncidentSeverity | 'ALL';
  status: IncidentStatus | 'ALL';
  category: IncidentCategory | 'ALL';
  searchQuery: string;
}

export function useIncidents() {
  const {
    incidents,
    selectedIncident,
    setSelectedIncident,
    selectIncidentById,
    selectIncidentByCode,
    updateIncidentStatus,
    assignResourceToIncident,
    removeResourceFromIncident,
    isLoading,
    error,
    refreshData,
    stats,
  } = useEmergencyData();

  const [filters, setFilters] = useState<IncidentFilters>({
    severity: 'ALL',
    status: 'ALL',
    category: 'ALL',
    searchQuery: '',
  });

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (filters.severity !== 'ALL' && inc.severity !== filters.severity) {
        return false;
      }
      if (filters.status !== 'ALL' && inc.status !== filters.status) {
        return false;
      }
      if (filters.category !== 'ALL' && inc.category !== filters.category) {
        return false;
      }
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesCode = inc.code.toLowerCase().includes(q);
        const matchesTitle = inc.title.toLowerCase().includes(q);
        const matchesLocation = inc.location.address.toLowerCase().includes(q);
        const matchesSector = inc.location.sector.toLowerCase().includes(q);
        if (!matchesCode && !matchesTitle && !matchesLocation && !matchesSector) {
          return false;
        }
      }
      return true;
    });
  }, [incidents, filters]);

  return {
    incidents: filteredIncidents,
    allIncidents: incidents,
    selectedIncident,
    setSelectedIncident,
    selectIncidentById,
    selectIncidentByCode,
    updateIncidentStatus,
    assignResourceToIncident,
    removeResourceFromIncident,
    filters,
    setFilters,
    isLoading,
    error,
    refreshData,
    stats,
  };
}

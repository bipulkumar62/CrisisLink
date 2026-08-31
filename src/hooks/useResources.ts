import { useState, useMemo } from 'react';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { UnitStatus, UnitType } from '@/src/types/resource';

export function useResources() {
  const { resources, updateResourceStatus, isLoading, error, refreshData } = useEmergencyData();
  const [filterStatus, setFilterStatus] = useState<UnitStatus | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<UnitType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      if (filterStatus !== 'ALL' && res.status !== filterStatus) return false;
      if (filterType !== 'ALL' && res.type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          res.callsign.toLowerCase().includes(q) ||
          res.station.toLowerCase().includes(q) ||
          res.specialties.some((s) => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [resources, filterStatus, filterType, searchQuery]);

  return {
    resources: filteredResources,
    allResources: resources,
    filterStatus,
    setFilterStatus,
    filterType,
    setFilterType,
    searchQuery,
    setSearchQuery,
    updateResourceStatus,
    isLoading,
    error,
    refreshData,
  };
}

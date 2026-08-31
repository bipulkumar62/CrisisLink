import { useState, useMemo } from 'react';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { CitizenReportStatus } from '@/src/types/report';
import { IncidentCategory } from '@/src/types/incident';

export function useReports() {
  const { reports, submitCitizenReport, isLoading, error, refreshData } = useEmergencyData();
  const [filterStatus, setFilterStatus] = useState<CitizenReportStatus | 'ALL'>('ALL');
  const [filterCategory, setFilterCategory] = useState<IncidentCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
      if (filterCategory !== 'ALL' && r.incidentCategory !== filterCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.trackingToken.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.location.address.toLowerCase().includes(q) ||
          (r.reporter.name && r.reporter.name.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [reports, filterStatus, filterCategory, searchQuery]);

  return {
    reports: filteredReports,
    allReports: reports,
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    searchQuery,
    setSearchQuery,
    submitCitizenReport,
    isLoading,
    error,
    refreshData,
  };
}

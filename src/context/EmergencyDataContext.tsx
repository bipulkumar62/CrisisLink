import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Incident, IncidentStatus, IncidentSeverity } from '@/src/types/incident';
import { CitizenReport, ReportSubmissionPayload } from '@/src/types/report';
import { ResourceUnit, UnitStatus } from '@/src/types/resource';
import { SystemTelemetry } from '@/src/types/system';
import { services } from '@/src/services';
import { ENV } from '@/src/config/env';
import { supabase } from '@/src/lib/supabaseClient';

interface EmergencyDataContextType {
  incidents: Incident[];
  selectedIncident: Incident | null;
  resources: ResourceUnit[];
  reports: CitizenReport[];
  telemetry: SystemTelemetry | null;
  isLoading: boolean;
  error: string | null;
  setSelectedIncident: (incident: Incident | null) => void;
  selectIncidentById: (id: string) => void;
  selectIncidentByCode: (code: string) => void;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus) => Promise<void>;
  assignResourceToIncident: (incidentId: string, resourceId: string) => Promise<void>;
  removeResourceFromIncident: (incidentId: string, resourceId: string) => Promise<void>;
  submitCitizenReport: (payload: ReportSubmissionPayload) => Promise<CitizenReport>;
  updateResourceStatus: (resourceId: string, status: UnitStatus) => Promise<void>;
  createIncident: (payload: Partial<Incident>) => Promise<Incident>;
  clusterReportToIncident: (reportId: string, incidentId: string) => Promise<CitizenReport>;
  refreshData: () => Promise<void>;
  stats: {
    criticalCount: number;
    highCount: number;
    activeCount: number;
    availableCount: number;
    resolvedCount: number;
  };
}

const EmergencyDataContext = createContext<EmergencyDataContextType | undefined>(undefined);

export const EmergencyDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [resources, setResources] = useState<ResourceUnit[]>([]);
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [telemetry, setTelemetry] = useState<SystemTelemetry | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const refreshData = useCallback(async () => {
    try {
      setError(null);
      const [incList, resList, repList, tel] = await Promise.all([
        services.incidentService.getIncidents(),
        services.resourceService.getResources(),
        services.reportService.getReports().catch((err) => {
          console.warn('[EmergencyData] Citizen reports restricted or unavailable for current session:', err);
          return [];
        }),
        services.systemService.getSystemTelemetry(),
      ]);

      setIncidents(incList);
      setResources(resList);
      setReports(repList);
      setTelemetry(tel);

      // Default select top critical incident if none selected
      setSelectedIncident((curr) => {
        if (curr) {
          const fresh = incList.find((i) => i.id === curr.id);
          return fresh || curr;
        }
        return incList.find((i) => i.severity === 'CRITICAL') || incList[0] || null;
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown network failure during CAD refresh';
      console.error('[CrisisLink CAD Data Refresh Error]:', msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced refresh to eliminate thundering herd storms on concurrent realtime events
  const debouncedRefreshData = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = setTimeout(() => {
      refreshData().catch((err) => console.warn('[EmergencyData] Background refresh failed:', err));
    }, 300);
  }, [refreshData]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // ─── Supabase Real-time Subscriptions (Leak-proof & Throttled) ───────────
  useEffect(() => {
    if (!ENV.IS_SUPABASE_MODE) return;

    let isSubscribed = true;
    const channel = supabase
      .channel('crisislink-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'incidents' },
        () => {
          if (isSubscribed) debouncedRefreshData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'resources' },
        () => {
          if (isSubscribed) debouncedRefreshData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'citizen_reports' },
        () => {
          if (isSubscribed) debouncedRefreshData();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.info('[CrisisLink] 🔴 Real-time channel subscribed — live updates active');
        }
      });

    return () => {
      isSubscribed = false;
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [debouncedRefreshData]);

  const selectIncidentById = useCallback(
    (id: string) => {
      const target = incidents.find((i) => i.id === id);
      if (target) setSelectedIncident(target);
    },
    [incidents]
  );

  const selectIncidentByCode = useCallback(
    (code: string) => {
      const target = incidents.find(
        (i) => i.code.toLowerCase() === code.toLowerCase()
      );
      if (target) setSelectedIncident(target);
    },
    [incidents]
  );

  const updateIncidentStatus = useCallback(
    async (incidentId: string, status: IncidentStatus) => {
      try {
        const updated = await services.incidentService.updateIncidentStatus(incidentId, status);
        setIncidents((prev) => prev.map((i) => (i.id === incidentId ? updated : i)));
        if (selectedIncident?.id === incidentId) {
          setSelectedIncident(updated);
        }
      } catch (err) {
        console.error('Failed to update incident status:', err);
        throw err;
      }
    },
    [selectedIncident]
  );

  const assignResourceToIncident = useCallback(
    async (incidentId: string, resourceId: string) => {
      let incidentAssigned = false;
      try {
        const updatedIncident = await services.incidentService.assignResourceToIncident(
          incidentId,
          resourceId
        );
        incidentAssigned = true;

        const updatedResource = await services.resourceService.updateResourceStatus(
          resourceId,
          'EN_ROUTE',
          incidentId
        );

        setIncidents((prev) => prev.map((i) => (i.id === incidentId ? updatedIncident : i)));
        setResources((prev) => prev.map((r) => (r.id === resourceId ? updatedResource : r)));

        if (selectedIncident?.id === incidentId) {
          setSelectedIncident(updatedIncident);
        }
      } catch (err) {
        console.error('Failed to assign resource:', err);
        // Compensating rollback: if incident assignment succeeded but resource status failed
        if (incidentAssigned) {
          try {
            await services.incidentService.removeResourceFromIncident(incidentId, resourceId);
          } catch (rollbackErr) {
            console.error('Compensating rollback failed for incident assignment:', rollbackErr);
          }
        }
        throw err;
      }
    },
    [selectedIncident]
  );

  const removeResourceFromIncident = useCallback(
    async (incidentId: string, resourceId: string) => {
      let incidentRemoved = false;
      try {
        const updatedIncident = await services.incidentService.removeResourceFromIncident(
          incidentId,
          resourceId
        );
        incidentRemoved = true;

        const updatedResource = await services.resourceService.updateResourceStatus(
          resourceId,
          'AVAILABLE'
        );

        setIncidents((prev) => prev.map((i) => (i.id === incidentId ? updatedIncident : i)));
        setResources((prev) => prev.map((r) => (r.id === resourceId ? updatedResource : r)));

        if (selectedIncident?.id === incidentId) {
          setSelectedIncident(updatedIncident);
        }
      } catch (err) {
        console.error('Failed to release resource:', err);
        // Compensating rollback: if incident was removed but resource status failed
        if (incidentRemoved) {
          try {
            await services.incidentService.assignResourceToIncident(incidentId, resourceId);
          } catch (rollbackErr) {
            console.error('Compensating rollback failed for resource release:', rollbackErr);
          }
        }
        throw err;
      }
    },
    [selectedIncident]
  );

  const createIncident = useCallback(async (payload: Partial<Incident>) => {
    try {
      const newIncident = await services.incidentService.createIncident(payload);
      setIncidents((prev) => [newIncident, ...prev]);
      return newIncident;
    } catch (err) {
      console.error('Failed to create incident:', err);
      throw err;
    }
  }, []);

  const clusterReportToIncident = useCallback(async (reportId: string, incidentId: string) => {
    try {
      const updatedReport = await services.reportService.clusterReportToIncident(reportId, incidentId);
      setReports((prev) => prev.map((r) => (r.id === reportId ? updatedReport : r)));
      return updatedReport;
    } catch (err) {
      console.error('Failed to cluster report:', err);
      throw err;
    }
  }, []);

  const submitCitizenReport = useCallback(
    async (payload: ReportSubmissionPayload) => {
      try {
        const newReport = await services.reportService.submitCitizenReport(payload);
        setReports((prev) => [newReport, ...prev]);

        // If high/critical severity, automatically create or link incident for responsiveness
        if (payload.severity === 'CRITICAL' || payload.severity === 'HIGH') {
          try {
            const newIncident = await services.incidentService.createIncident({
              title: `${payload.category} Emergency - ${payload.address.slice(0, 24)}`,
              description: payload.description,
              category: payload.category,
              severity: payload.severity as IncidentSeverity,
              location: {
                address: payload.address,
                sector: 'Sector 1 - Central Hub',
                latitude: payload.latitude || 26.9124,
                longitude: payload.longitude || 75.7873,
              },
            });
            setIncidents((prev) => [newIncident, ...prev]);

            // Attempt to cluster report to newly created incident
            try {
              const clustered = await services.reportService.clusterReportToIncident(newReport.id, newIncident.id);
              setReports((prev) => prev.map((r) => (r.id === newReport.id ? clustered : r)));
            } catch (linkErr) {
              console.warn('Auto-cluster link failed:', linkErr);
            }
          } catch (autoIncErr) {
            console.warn('Auto-incident creation failed, report remains in triage queue:', autoIncErr);
          }
        }

        return newReport;
      } catch (err) {
        console.error('Failed to submit report:', err);
        throw err;
      }
    },
    []
  );

  const updateResourceStatus = useCallback(
    async (resourceId: string, status: UnitStatus) => {
      try {
        const updated = await services.resourceService.updateResourceStatus(resourceId, status);
        setResources((prev) => prev.map((r) => (r.id === resourceId ? updated : r)));
      } catch (err) {
        console.error('Failed to update resource status:', err);
        throw err;
      }
    },
    []
  );

  // Compute live operational summary stats
  const stats = {
    criticalCount: incidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length,
    highCount: incidents.filter((i) => i.severity === 'HIGH' && i.status !== 'RESOLVED').length,
    activeCount: incidents.filter((i) => i.status === 'ACTIVE' || i.status === 'TRIAGED' || i.status === 'DISPATCHED' || i.status === 'ON_SCENE').length,
    availableCount: resources.filter((r) => r.status === 'AVAILABLE').length,
    resolvedCount: incidents.filter((i) => i.status === 'RESOLVED').length,
  };

  return (
    <EmergencyDataContext.Provider
      value={{
        incidents,
        selectedIncident,
        resources,
        reports,
        telemetry,
        isLoading,
        error,
        setSelectedIncident,
        selectIncidentById,
        selectIncidentByCode,
        updateIncidentStatus,
        assignResourceToIncident,
        removeResourceFromIncident,
        submitCitizenReport,
        updateResourceStatus,
        createIncident,
        clusterReportToIncident,
        refreshData,
        stats,
      }}
    >
      {children}
    </EmergencyDataContext.Provider>
  );
};

export function useEmergencyData(): EmergencyDataContextType {
  const context = useContext(EmergencyDataContext);
  if (!context) {
    throw new Error('useEmergencyData must be used within an EmergencyDataProvider');
  }
  return context;
}

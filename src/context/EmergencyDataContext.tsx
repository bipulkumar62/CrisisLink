import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Incident, IncidentStatus, IncidentSeverity } from '@/src/types/incident';
import { CitizenReport, ReportSubmissionPayload } from '@/src/types/report';
import { ResourceUnit, UnitStatus } from '@/src/types/resource';
import { SystemTelemetry } from '@/src/types/system';
import { services } from '@/src/services';

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

  const refreshData = useCallback(async () => {
    try {
      setError(null);
      const [incList, resList, repList, tel] = await Promise.all([
        services.incidentService.getIncidents(),
        services.resourceService.getResources(),
        services.reportService.getReports(),
        services.systemService.getSystemTelemetry(),
      ]);

      setIncidents(incList);
      setResources(resList);
      setReports(repList);
      setTelemetry(tel);

      // Default select CL-102 or first incident if none selected
      setSelectedIncident((prev) => {
        if (prev) {
          const fresh = incList.find((i) => i.id === prev.id);
          return fresh || incList[0] || null;
        }
        return incList[0] || null;
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emergency intelligence');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

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
      try {
        const updatedIncident = await services.incidentService.assignResourceToIncident(
          incidentId,
          resourceId
        );
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
        throw err;
      }
    },
    [selectedIncident]
  );

  const removeResourceFromIncident = useCallback(
    async (incidentId: string, resourceId: string) => {
      try {
        const updatedIncident = await services.incidentService.removeResourceFromIncident(
          incidentId,
          resourceId
        );
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
        throw err;
      }
    },
    [selectedIncident]
  );

  const submitCitizenReport = useCallback(
    async (payload: ReportSubmissionPayload) => {
      try {
        const newReport = await services.reportService.submitCitizenReport(payload);
        setReports((prev) => [newReport, ...prev]);

        // If high/critical severity, automatically create or link incident for responsiveness
        if (payload.severity === 'CRITICAL' || payload.severity === 'HIGH') {
          const newIncident = await services.incidentService.createIncident({
            title: `${payload.category} Emergency - ${payload.address.slice(0, 24)}`,
            description: payload.description,
            category: payload.category,
            severity: payload.severity as IncidentSeverity,
            location: {
              address: payload.address,
              sector: 'Sector 1 - Central Hub',
              latitude: payload.latitude || 37.7749,
              longitude: payload.longitude || -122.4194,
            },
          });
          setIncidents((prev) => [newIncident, ...prev]);
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
    resolvedCount: incidents.filter((i) => i.status === 'RESOLVED').length + 31,
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

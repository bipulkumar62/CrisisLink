import React, { useState } from 'react';
import { Shield, Truck, HeartPulse, Check, Navigation, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Incident } from '@/src/types/incident';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';

interface ResourceAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident;
}

export const ResourceAssignModal: React.FC<ResourceAssignModalProps> = ({
  isOpen,
  onClose,
  incident,
}) => {
  const { resources, assignResourceToIncident, removeResourceFromIncident } = useEmergencyData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'RESCUE_TEAM':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'AMBULANCE':
        return <HeartPulse className="w-4 h-4 text-emerald-600" />;
      default:
        return <Truck className="w-4 h-4 text-amber-600" />;
    }
  };

  const handleToggle = async (resourceId: string, isAssigned: boolean) => {
    setIsSubmitting(true);
    try {
      if (isAssigned) {
        await removeResourceFromIncident(incident.id, resourceId);
      } else {
        await assignResourceToIncident(incident.id, resourceId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Resource Dispatch & Coordination — ${incident.code}`}
      subtitle={`Assign tactical emergency units to ${incident.title} (${incident.location.address})`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Recommended AI Units */}
        {incident.recommendedResources.length > 0 && (
          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded text-xs text-blue-900">
            <div className="flex items-center gap-1.5 font-semibold text-blue-800 mb-1">
              <Navigation className="w-3.5 h-3.5" />
              AI-Recommended Deployment Package:
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {incident.recommendedResources.map((rec) => (
                <span
                  key={rec.unitId}
                  className="px-2 py-0.5 bg-white border border-blue-200 rounded font-mono-data text-[11px] font-semibold text-blue-700 shadow-2xs"
                >
                  {rec.name} (~{rec.etaMinutes} min ETA)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Resources List */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {resources.map((res) => {
            const isAssigned = incident.assignedResourceIds.includes(res.id);
            const isBusyElsewhere = res.status !== 'AVAILABLE' && !isAssigned;

            return (
              <div
                key={res.id}
                className={`flex items-center justify-between p-3 rounded border transition-all ${
                  isAssigned
                    ? 'border-blue-300 bg-blue-50/40'
                    : isBusyElsewhere
                    ? 'border-slate-200 bg-slate-50 opacity-60'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded border border-slate-200">
                    {getIcon(res.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 font-heading">
                        {res.callsign}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono-data font-semibold uppercase ${
                          res.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : isAssigned
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isAssigned ? 'ASSIGNED ON SCENE' : res.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {res.station} • {res.personnelCount} Personnel • Battery: {res.batteryOrFuelPercent}%
                    </p>
                  </div>
                </div>

                <button
                  disabled={isSubmitting || (isBusyElsewhere && !isAssigned)}
                  onClick={() => handleToggle(res.id, isAssigned)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors ${
                    isAssigned
                      ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                      : isBusyElsewhere
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-[#0051d5] text-white hover:bg-[#0041ab]'
                  }`}
                >
                  {isAssigned ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Release Unit
                    </>
                  ) : isBusyElsewhere ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      Engaged
                    </>
                  ) : (
                    'Dispatch Unit'
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded font-medium text-xs hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

import React, { useState } from 'react';
import {
  AlertTriangle,
  MapPin,
  Camera,
  Upload,
  User,
  Users,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Flame,
  Droplets,
  Zap,
  Car,
  Biohazard,
  Activity,
  Phone,
  Shield,
} from 'lucide-react';
import { RoutePath } from '@/src/config/constants';
import { IncidentCategory, IncidentSeverity } from '@/src/types/incident';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';

interface ReportEmergencyPageProps {
  onNavigate: (route: RoutePath) => void;
  onReportSubmitted: (trackingToken: string) => void;
}

export const ReportEmergencyPage: React.FC<ReportEmergencyPageProps> = ({
  onNavigate,
  onReportSubmitted,
}) => {
  const { submitCitizenReport } = useEmergencyData();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [category, setCategory] = useState<IncidentCategory>('FLOOD');
  const [severity, setSeverity] = useState<IncidentSeverity>('HIGH');
  const [description, setDescription] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [peopleAtRisk, setPeopleAtRisk] = useState<number>(1);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [reporterName, setReporterName] = useState<string>('');
  const [reporterPhone, setReporterPhone] = useState<string>('');
  const [reporterEmail, setReporterEmail] = useState<string>('');
  const [evidenceFiles, setEvidenceFiles] = useState<{ name: string; type: 'PHOTO' | 'TEXT' | 'AUDIO'; sizeBytes: number }[]>([]);

  const categories: { id: IncidentCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'FLOOD', label: 'Flood / Water Surge', icon: Droplets },
    { id: 'FIRE', label: 'Structure Fire / Wildfire', icon: Flame },
    { id: 'TRAFFIC', label: 'Major Traffic Crash', icon: Car },
    { id: 'POWER_OUTAGE', label: 'Power Grid Outage', icon: Zap },
    { id: 'HAZMAT', label: 'Chemical / Hazmat Spill', icon: Biohazard },
    { id: 'MEDICAL', label: 'Mass Medical Emergency', icon: Activity },
    { id: 'STRUCTURE_COLLAPSE', label: 'Structural Collapse', icon: AlertTriangle },
    { id: 'OTHER', label: 'Other Hazardous Incident', icon: Shield },
  ];

  const handleSimulatePhotoUpload = () => {
    const fileNum = evidenceFiles.length + 1;
    setEvidenceFiles((prev) => [
      ...prev,
      {
        name: `eyewitness_capture_0${fileNum}.jpg`,
        type: 'PHOTO',
        sizeBytes: 2400000,
      },
    ]);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setAddress('Sector 7, Lower Downtown Area (GPS Pinpoint)');
        },
        () => {
          setAddress('742 Market St, Civic Center District');
        }
      );
    } else {
      setAddress('742 Market St, Civic Center District');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const report = await submitCitizenReport({
        category,
        severity,
        description: description.trim() || `${category} reported at ${address}`,
        address: address.trim() || 'Sector 7 Civic Center, Downtown',
        latitude: 37.7794,
        longitude: -122.4180,
        isAnonymous,
        reporterName: isAnonymous ? undefined : reporterName,
        reporterPhone: isAnonymous ? undefined : reporterPhone,
        reporterEmail: isAnonymous ? undefined : reporterEmail,
        peopleAtRiskCount: peopleAtRisk,
        evidenceFiles,
      });

      onReportSubmitted(report.trackingToken);
      onNavigate('citizen-confirmation');
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold uppercase tracking-wider">
          <AlertTriangle className="w-3.5 h-3.5" />
          Official Citizen Emergency Intake
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Report an Emergency Incident
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Your report transmits directly to active dispatch command. Please provide accurate details.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 text-xs font-semibold">
        <div
          className={`flex items-center gap-2 ${
            step >= 1 ? 'text-[#0051d5]' : 'text-slate-400'
          }`}
        >
          <span className="w-6 h-6 rounded-full flex items-center justify-center border font-mono-data text-xs font-bold border-current">
            1
          </span>
          <span>Incident Type</span>
        </div>
        <div className="w-12 h-px bg-slate-200" />
        <div
          className={`flex items-center gap-2 ${
            step >= 2 ? 'text-[#0051d5]' : 'text-slate-400'
          }`}
        >
          <span className="w-6 h-6 rounded-full flex items-center justify-center border font-mono-data text-xs font-bold border-current">
            2
          </span>
          <span>Location & Severity</span>
        </div>
        <div className="w-12 h-px bg-slate-200" />
        <div
          className={`flex items-center gap-2 ${
            step >= 3 ? 'text-[#0051d5]' : 'text-slate-400'
          }`}
        >
          <span className="w-6 h-6 rounded-full flex items-center justify-center border font-mono-data text-xs font-bold border-current">
            3
          </span>
          <span>Review & Submit</span>
        </div>
      </div>

      {/* Step Forms */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 font-heading">
              Select the Nature of the Emergency
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-3.5 rounded-lg border text-left flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'border-[#0051d5] bg-blue-50/80 ring-2 ring-[#0051d5]/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`p-2 rounded ${
                        isSelected ? 'bg-[#0051d5] text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-slate-900 leading-tight">
                        {cat.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-[#0051d5] hover:bg-[#0041ab] text-white rounded text-xs font-bold flex items-center gap-2 transition-colors"
              >
                Continue to Location
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            {/* Location Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Incident Location / Address
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 742 Market St or Intersection of 5th & Pine"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded text-xs font-semibold whitespace-nowrap transition-colors"
                >
                  Use My GPS
                </button>
              </div>
            </div>

            {/* Severity Rating */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Immediate Hazard Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSeverity('CRITICAL')}
                  className={`p-3 rounded border text-center transition-all ${
                    severity === 'CRITICAL'
                      ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold block">CRITICAL</span>
                  <span className="text-[10px] text-slate-500 block">Life Threatened</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSeverity('HIGH')}
                  className={`p-3 rounded border text-center transition-all ${
                    severity === 'HIGH'
                      ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold block">HIGH</span>
                  <span className="text-[10px] text-slate-500 block">Escalating Risk</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSeverity('ACTIVE')}
                  className={`p-3 rounded border text-center transition-all ${
                    severity === 'ACTIVE'
                      ? 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold block">ACTIVE</span>
                  <span className="text-[10px] text-slate-500 block">Monitoring/Stable</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Eyewitness Description & Situation Details
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe what you see: water depth, visible smoke, entrapped individuals, blocked exits..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Evidence Uploader (Simulated) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Attach Photo / Video Evidence
                </label>
                <span className="text-[11px] text-slate-500 font-mono-data">
                  {evidenceFiles.length} attached
                </span>
              </div>
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs text-slate-600">Drag & drop photos, or</p>
                <button
                  type="button"
                  onClick={handleSimulatePhotoUpload}
                  className="mt-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Photo Capture
                </button>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-slate-600 text-xs font-semibold hover:text-slate-900 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 bg-[#0051d5] hover:bg-[#0041ab] text-white rounded text-xs font-bold flex items-center gap-2 transition-colors"
              >
                Review & Confirm
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-slate-900 font-heading">
              Reporter Identity & Final Verification
            </h2>

            {/* Anonymous Toggle */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Submit Anonymously</span>
                <span className="text-[11px] text-slate-500 block">
                  Your location and report will still be triaged with full urgency.
                </span>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            {!isAnonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Estimated people at risk */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimated People at Immediate Risk
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPeopleAtRisk(num)}
                    className={`px-3 py-1.5 rounded border text-xs font-bold font-mono-data ${
                      peopleAtRisk === num
                        ? 'bg-[#0051d5] text-white border-[#0051d5]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {num === 10 ? '10+' : `${num}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold text-slate-900 font-mono-data">{category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Severity:</span>
                <span className="font-bold text-red-600 font-mono-data">{severity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                  {address || 'Sector 7 Downtown'}
                </span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-slate-600 text-xs font-semibold hover:text-slate-900 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-red-700/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  'Transmitting to CAD...'
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Transmit Emergency Report
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

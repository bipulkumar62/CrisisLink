import React, { useState, useRef, useEffect } from 'react';
import {
  AlertTriangle,
  Flame,
  Droplets,
  Zap,
  MapPin,
  Camera,
  Mic,
  MicOff,
  Square,
  UploadCloud,
  X,
  CheckCircle,
  HelpCircle,
  Shield,
  Loader2,
  Users,
  Navigation,
  Compass,
  FileText,
  Lock,
  RefreshCw,
  Info,
  Check,
  AlertCircle,
  Eye,
  Sliders,
} from 'lucide-react';
import { RoutePath, APP_CONFIG } from '@/src/config/constants';
import { useEmergencyData } from '@/src/context/EmergencyDataContext';
import { IncidentCategory, IncidentSeverity } from '@/src/types/incident';
import { ReportSubmissionPayload } from '@/src/types/report';
import { useBrowserGeolocation } from '@/src/hooks/useBrowserGeolocation';
import { useBrowserSpeech } from '@/src/hooks/useBrowserSpeech';
import { LocationPickerModal } from '@/src/components/common/LocationPickerModal';

interface ReportEmergencyPageProps {
  onNavigate: (route: RoutePath) => void;
  onReportSubmitted: (token: string) => void;
}

export interface UploadedMediaItem {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  sizeFormatted: string;
  mimeType: string;
  previewUrl: string;
  width?: number;
  height?: number;
  isSizeWarning?: boolean;
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
];

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB hard limit
const WARN_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB size warning

export const ReportEmergencyPage: React.FC<ReportEmergencyPageProps> = ({
  onNavigate,
  onReportSubmitted,
}) => {
  const { submitCitizenReport } = useEmergencyData();

  // Form State
  const [category, setCategory] = useState<IncidentCategory>('FLOOD');
  const [severity, setSeverity] = useState<IncidentSeverity>('HIGH');
  const [description, setDescription] = useState<string>('');
  const [address, setAddress] = useState<string>('MI Road & Paanch Batti, Jaipur');
  const [peopleCount, setPeopleCount] = useState<number | 'UNKNOWN'>('UNKNOWN');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [reporterName, setReporterName] = useState<string>('');
  const [reporterPhone, setReporterPhone] = useState<string>('');

  // Coordinates
  const [currentLat, setCurrentLat] = useState<number>(26.918);
  const [currentLng, setCurrentLng] = useState<number>(75.815);

  // Validation State
  const [formErrors, setFormErrors] = useState<{
    category?: string;
    description?: string;
    location?: string;
    peopleCount?: string;
    media?: string;
  }>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Browser Geolocation Hook
  const {
    status: geoStatus,
    errorMessage: geoErrorMessage,
    location: geoResult,
    acquireGPS,
    setManualLocation,
  } = useBrowserGeolocation();

  // Manual Map Picker Modal State
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);

  // Browser Speech Recognition Hook
  const {
    isSupported: isSpeechSupported,
    isListening,
    status: speechStatus,
    errorMessage: speechError,
    interimTranscript,
    recordingSeconds,
    startListening,
    stopListening,
  } = useBrowserSpeech({
    onTranscriptChange: (newTranscript) => {
      setDescription((prev) => {
        if (!prev) return newTranscript;
        // Avoid duplicate appending if phrase already present
        if (prev.endsWith(newTranscript)) return prev;
        return `${prev.trim()} ${newTranscript}`.trim();
      });
    },
  });

  // Media / File Upload State
  const [mediaList, setMediaList] = useState<UploadedMediaItem[]>([]);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Submission Pipeline Progress
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionStep, setSubmissionStep] = useState<string>('');
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Sync GPS Coordinates when acquired
  useEffect(() => {
    if (geoResult) {
      setCurrentLat(geoResult.latitude);
      setCurrentLng(geoResult.longitude);
      setAddress(geoResult.address);
      setFormErrors((prev) => ({ ...prev, location: undefined }));
    }
  }, [geoResult]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      mediaList.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [mediaList]);

  // Emergency Categories
  const categories: { id: IncidentCategory; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'FLOOD',
      label: 'Flood / Waterlogging',
      icon: <Droplets className="w-5 h-5 text-blue-600" />,
      desc: 'Submerged roads, drain breach, trapped commuters',
    },
    {
      id: 'FIRE',
      label: 'Fire / Blaze',
      icon: <Flame className="w-5 h-5 text-amber-600" />,
      desc: 'Building fire, transformer spark, gas ignition',
    },
    {
      id: 'TRAFFIC',
      label: 'Traffic Collision',
      icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
      desc: 'Multi-vehicle crash, arterial road blockage',
    },
    {
      id: 'STRUCTURE_COLLAPSE',
      label: 'Structural Collapse',
      icon: <Shield className="w-5 h-5 text-red-600" />,
      desc: 'Wall / building failure, debris hazard',
    },
    {
      id: 'HAZMAT',
      label: 'Gas / Chemical Hazard',
      icon: <Zap className="w-5 h-5 text-purple-600" />,
      desc: 'PNG pipeline leak, chemical fumes',
    },
    {
      id: 'MEDICAL',
      label: 'Medical Trauma',
      icon: <AlertTriangle className="w-5 h-5 text-emerald-600" />,
      desc: 'Mass casualties, serious injuries',
    },
    {
      id: 'POWER_OUTAGE',
      label: 'Power Grid Failure',
      icon: <Zap className="w-5 h-5 text-yellow-600" />,
      desc: 'Downed live wire, feeder transformer blackout',
    },
    {
      id: 'OTHER',
      label: 'Not Sure / Other',
      icon: <HelpCircle className="w-5 h-5 text-slate-600" />,
      desc: 'General hazard requiring CAD triage',
    },
  ];

  // Helper format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Image Processing & Validation
  const processSelectedFiles = (files: FileList | File[]) => {
    setMediaError(null);
    const fileArray = Array.from(files);

    if (fileArray.length === 0) return;

    const newItems: UploadedMediaItem[] = [];

    for (const file of fileArray) {
      // 1. Allowed MIME Type Check
      const isAllowedType =
        ALLOWED_IMAGE_TYPES.includes(file.type) ||
        file.name.match(/\.(jpg|jpeg|png|webp|gif|heic|heif)$/i);

      if (!isAllowedType) {
        setMediaError(
          `Invalid file format for "${file.name}". Only standard images (JPEG, PNG, WebP, GIF, HEIC) are accepted.`
        );
        continue;
      }

      // 2. Hard Size Limit Check (25MB)
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setMediaError(
          `File "${file.name}" exceeds the maximum 25 MB payload limit. Please attach a smaller photo.`
        );
        continue;
      }

      // 3. Size Warning Indicator (> 8MB)
      const isSizeWarning = file.size > WARN_FILE_SIZE_BYTES;

      // 4. Create local blob preview and extract metadata
      const previewUrl = URL.createObjectURL(file);
      const mediaId = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const item: UploadedMediaItem = {
        id: mediaId,
        file,
        name: file.name,
        sizeBytes: file.size,
        sizeFormatted: formatFileSize(file.size),
        mimeType: file.type || 'image/jpeg',
        previewUrl,
        isSizeWarning,
      };

      // Extract image dimensions asynchronously
      const img = new Image();
      img.onload = () => {
        setMediaList((prev) =>
          prev.map((m) => (m.id === mediaId ? { ...m, width: img.width, height: img.height } : m))
        );
      };
      img.src = previewUrl;

      newItems.push(item);
    }

    if (newItems.length > 0) {
      setMediaList((prev) => [...prev, ...newItems]);
      setFormErrors((prev) => ({ ...prev, media: undefined }));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processSelectedFiles(e.target.files);
    }
  };

  const handleRemoveMedia = (id: string) => {
    setMediaList((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((m) => m.id !== id);
    });
  };

  const handleManualLocationSelect = (lat: number, lng: number, formattedAddress: string) => {
    setCurrentLat(lat);
    setCurrentLng(lng);
    setAddress(formattedAddress);
    setManualLocation(lat, lng, formattedAddress);
    setFormErrors((prev) => ({ ...prev, location: undefined }));
  };

  // Comprehensive Form Validation
  const validateForm = (): boolean => {
    const errors: {
      category?: string;
      description?: string;
      location?: string;
      peopleCount?: string;
      media?: string;
    } = {};

    // 1. Category validation
    if (!category) {
      errors.category = 'Please select an emergency category.';
    }

    // 2. Description validation (min 8 characters)
    const cleanDesc = description.trim();
    if (!cleanDesc) {
      errors.description = 'Please provide an eyewitness description of the hazard.';
    } else if (cleanDesc.length < 8) {
      errors.description = 'Description is too short. Please describe what is happening in at least 8 characters.';
    }

    // 3. Location validation
    if (!address.trim()) {
      errors.location = 'Please provide an incident location address or select a location on the map.';
    }

    // 4. People count validation
    if (peopleCount !== 'UNKNOWN' && (isNaN(Number(peopleCount)) || Number(peopleCount) < 0)) {
      errors.peopleCount = 'Please enter a valid positive number for people affected.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submission Pipeline
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      category: true,
      description: true,
      location: true,
      peopleCount: true,
    });

    if (!validateForm()) {
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionStep('Transmitting emergency report to CAD intake queue...');

    const evidencePayload = mediaList.map((m) => ({
      name: m.name,
      type: 'PHOTO' as const,
      sizeBytes: m.sizeBytes,
    }));

    const reportPayload: ReportSubmissionPayload = {
      category,
      severity,
      description: description.trim(),
      address: address.trim(),
      latitude: currentLat,
      longitude: currentLng,
      isAnonymous,
      reporterName: isAnonymous ? undefined : reporterName.trim() || undefined,
      reporterPhone: isAnonymous ? undefined : reporterPhone.trim() || undefined,
      peopleAtRiskCount: peopleCount === 'UNKNOWN' ? 0 : Number(peopleCount),
      evidenceFiles: evidencePayload,
    };

    try {
      const report = await submitCitizenReport(reportPayload);
      setIsSubmitting(false);
      setSubmissionError(null);
      onReportSubmitted(report.trackingToken);
      onNavigate('citizen-confirmation');
    } catch (err: unknown) {
      setIsSubmitting(false);
      const errMsg = err instanceof Error ? err.message : 'Network communication to CAD intake failed';
      console.error('[CrisisLink Ingestion Failure]:', errMsg);

      // Cache failed submission in offline emergency storage so data is not lost
      try {
        const storedQueue = JSON.parse(localStorage.getItem('crisislink_offline_reports') || '[]');
        storedQueue.push({
          ...reportPayload,
          failedAt: new Date().toISOString(),
          errorReason: errMsg,
        });
        localStorage.setItem('crisislink_offline_reports', JSON.stringify(storedQueue));
      } catch (storageErr) {
        console.warn('Could not cache report to localStorage:', storageErr);
      }

      setSubmissionError(
        'Emergency transmission failed due to network or server disruption. Your entered report has been saved locally. In a life-threatening situation, immediately dial emergency dispatch directly.'
      );

      // Scroll to top error banner
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };


  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 px-2 sm:px-0">
      {/* Top Life Hazard Warning */}
      <div
        id="life-hazard-notice"
        className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-700 shadow-sm"
      >
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
        <div className="flex-1 space-y-1">
          <span className="font-bold block text-sm text-red-900">Critical Life Safety Notice</span>
          <p className="leading-relaxed">
            If you or someone nearby is in immediate life-threatening danger, call national emergency services directly at <strong className="font-bold underline">112</strong> or Fire <strong className="font-bold underline">101</strong>.
          </p>
        </div>
      </div>

      {/* Emergency Submission Failure Alert */}
      {submissionError && (
        <div
          id="emergency-submission-error"
          className="p-5 bg-amber-50 border-2 border-red-500 rounded-xl space-y-3 text-xs text-slate-900 shadow-md animate-in fade-in"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <h3 className="font-bold text-sm text-red-900">Emergency Transmission Alert</h3>
              <p className="text-xs text-slate-800 leading-relaxed font-sans">{submissionError}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-amber-200 flex flex-wrap gap-2">
            <a
              href="tel:112"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs text-xs"
            >
              <span>Call 112 (National Emergency)</span>
            </a>
            <a
              href="tel:100"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg flex items-center gap-1.5 text-xs"
            >
              <span>Call 100 (Police)</span>
            </a>
            <a
              href="tel:108"
              className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg flex items-center gap-1.5 text-xs"
            >
              <span>Call 108 (Ambulance)</span>
            </a>
          </div>
        </div>
      )}


      {/* Main Reporting Form Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-8 shadow-sm space-y-8">
        <div className="border-b border-slate-200 pb-4 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-[11px] font-mono-data font-bold text-slate-500 uppercase tracking-widest">
              CAD Intake Mesh • {APP_CONFIG.REGION_LABEL}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Report an Emergency Incident
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Eyewitness intelligence is validated locally and relayed directly to Jaipur emergency dispatchers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* 1. Emergency Category Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#101828]">
                1. Select Emergency Type <span className="text-red-500">*</span>
              </label>
              {formErrors.category && (
                <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.category}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {categories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`category-btn-${cat.id.toLowerCase()}`}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      setFormErrors((prev) => ({ ...prev, category: undefined }));
                    }}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all min-h-[96px] cursor-pointer touch-manipulation ${
                      isSelected
                        ? 'bg-blue-50/90 border-[#2563EB] ring-2 ring-[#2563EB]/25 shadow-xs'
                        : 'bg-[#F7F8FA] border-[#D9E0E7] hover:border-slate-400'
                    }`}
                  >
                    <div className="p-1.5 bg-white rounded-md border border-[#D9E0E7] w-fit shadow-2xs">
                      {cat.icon}
                    </div>
                    <div className="mt-2">
                      <span className="font-bold text-xs text-[#101828] block leading-tight">
                        {cat.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Incident Location & GPS Navigator */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#101828]">
                2. Incident Location & Landmark <span className="text-red-500">*</span>
              </label>

              {/* Geolocation Controls */}
              <div className="flex items-center gap-2">
                <button
                  id="acquire-gps-btn"
                  type="button"
                  onClick={acquireGPS}
                  disabled={geoStatus === 'LOCATING'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-[#2563EB] rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50 cursor-pointer min-h-[36px]"
                >
                  {geoStatus === 'LOCATING' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5" />
                  )}
                  <span>{geoStatus === 'LOCATING' ? 'Acquiring GPS...' : 'Use Device GPS'}</span>
                </button>

                <button
                  id="pick-map-btn"
                  type="button"
                  onClick={() => setIsMapModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D9E0E7] text-[#101828] rounded-lg text-xs font-semibold hover:bg-[#F7F8FA] hover:border-slate-400 transition-colors cursor-pointer min-h-[36px]"
                >
                  <Compass className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Pick on Map</span>
                </button>
              </div>
            </div>

            {/* Geolocation Status / Error Alerts */}
            {geoStatus === 'GRANTED' && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-[#16803A] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Location locked: <strong>{currentLat.toFixed(4)}° N, {currentLng.toFixed(4)}° E</strong> (±{geoResult?.accuracyMeters || 5}m accuracy)
                  </span>
                </div>
                <span className="text-[10px] font-mono-data uppercase bg-emerald-100 px-2 py-0.5 rounded font-bold">
                  {geoResult?.source || 'GPS'}
                </span>
              </div>
            )}

            {geoErrorMessage && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold block">
                      {geoStatus === 'PERMISSION_DENIED'
                        ? 'Location Permission Denied'
                        : geoStatus === 'TIMEOUT'
                        ? 'GPS Acquisition Timed Out'
                        : 'GPS Location Unavailable'}
                    </span>
                    <p className="text-[11px] text-amber-800 mt-0.5">{geoErrorMessage}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-6">
                  <button
                    type="button"
                    onClick={acquireGPS}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-amber-300 text-amber-900 rounded text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry GPS
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMapModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#2563EB] text-white rounded text-xs font-semibold hover:bg-[#1d4ed8] transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3 h-3" /> Select on Jaipur Map
                  </button>
                </div>
              </div>
            )}

            {/* Address Input Field */}
            <div className="space-y-2">
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#D92D20] absolute left-3 top-3" />
                <input
                  id="incident-address-input"
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (formErrors.location) {
                      setFormErrors((prev) => ({ ...prev, location: undefined }));
                    }
                  }}
                  placeholder="Street address, landmark, or sector in Jaipur..."
                  className={`w-full pl-9 pr-3 py-2.5 text-xs bg-[#F7F8FA] border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] text-[#101828] min-h-[44px] ${
                    formErrors.location ? 'border-red-400 bg-red-50/20' : 'border-[#D9E0E7]'
                  }`}
                />
              </div>

              {formErrors.location && (
                <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.location}
                </span>
              )}

              {/* Quick Jaipur Sector Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
                <span className="text-[#52606D] font-mono-data shrink-0 text-[10px]">Sectors:</span>
                {[
                  { name: 'MI Road & Paanch Batti', lat: 26.918, lng: 75.815 },
                  { name: 'Johari Bazaar Walled City', lat: 26.924, lng: 75.828 },
                  { name: 'Mansarovar Metro', lat: 26.872, lng: 75.768 },
                  { name: 'Vaishali Nagar', lat: 26.905, lng: 75.742 },
                  { name: 'Malviya Nagar / WTP', lat: 26.853, lng: 75.805 },
                  { name: 'Sitapura Industrial Area', lat: 26.775, lng: 75.832 },
                ].map((sec) => (
                  <button
                    key={sec.name}
                    type="button"
                    onClick={() => {
                      setAddress(sec.name + ', Jaipur');
                      setCurrentLat(sec.lat);
                      setCurrentLng(sec.lng);
                      setManualLocation(sec.lat, sec.lng, sec.name + ', Jaipur');
                    }}
                    className="px-2.5 py-1 bg-white border border-[#D9E0E7] text-[#52606D] hover:text-[#101828] hover:border-slate-400 rounded-md whitespace-nowrap transition-colors cursor-pointer touch-manipulation min-h-[30px]"
                  >
                    {sec.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Description & Voice-to-Text Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#101828]">
                3. Eyewitness Description <span className="text-red-500">*</span>
              </label>

              {/* Voice input status chip */}
              {isSpeechSupported ? (
                <span className="text-[11px] text-[#2563EB] font-mono-data font-semibold flex items-center gap-1">
                  <Mic className="w-3 h-3" /> Voice Speech Recognition Ready
                </span>
              ) : (
                <span className="text-[11px] text-[#52606D] font-mono-data">
                  Text input active
                </span>
              )}
            </div>

            <div className="relative">
              <textarea
                id="incident-description-input"
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (formErrors.description) {
                    setFormErrors((prev) => ({ ...prev, description: undefined }));
                  }
                }}
                placeholder="Describe what is happening: Are roads blocked? Are people trapped? Is there smoke, fire, or rising water?"
                className={`w-full p-3 text-xs bg-[#F7F8FA] border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] text-[#101828] leading-relaxed ${
                  formErrors.description ? 'border-red-400 bg-red-50/20' : 'border-[#D9E0E7]'
                }`}
              />
            </div>

            {formErrors.description && (
              <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {formErrors.description}
              </span>
            )}

            {/* Voice Memo Capture Component */}
            <div className="p-3.5 bg-[#F7F8FA] border border-[#D9E0E7] rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-xs font-bold text-[#101828]">
                    Voice Speech Recognition
                  </span>
                </div>

                {isSpeechSupported && (
                  <span className="text-[10px] text-[#52606D] font-mono-data">
                    Language: en-IN / Hindi Speech
                  </span>
                )}
              </div>

              {!isSpeechSupported ? (
                // Graceful fallback when browser Speech Recognition is not supported
                <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-md text-[11px] text-[#52606D] flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>
                    Speech-to-text is not supported in this browser. Please type your situation description directly in the box above.
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {!isListening ? (
                      <button
                        id="start-voice-memo-btn"
                        type="button"
                        onClick={startListening}
                        className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#D9E0E7] hover:border-[#2563EB] text-[#101828] text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px] touch-manipulation"
                      >
                        <Mic className="w-4 h-4 text-red-600" />
                        <span>Start Voice Eyewitness Memo</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between gap-3 w-full bg-red-50 border border-red-200 p-2 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700 text-xs font-mono-data font-bold">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                          <span>LISTENING 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}</span>
                        </div>

                        {/* Audio Waveform Effect */}
                        <div className="flex items-center gap-1 h-5 px-2">
                          {[35, 70, 95, 50, 85, 60, 90, 45, 80, 65, 95, 40].map((h, i) => (
                            <div
                              key={i}
                              className="w-1 bg-red-500 rounded-full animate-pulse"
                              style={{ height: `${h}%`, animationDelay: `${i * 90}ms` }}
                            />
                          ))}
                        </div>

                        <button
                          id="stop-voice-memo-btn"
                          type="button"
                          onClick={stopListening}
                          className="px-3.5 py-1.5 bg-[#0B1F33] hover:bg-slate-800 text-white text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Finish</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Interim Live Transcript */}
                  {interimTranscript && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-[#2563EB] font-mono-data animate-pulse">
                      Listening: "{interimTranscript}"
                    </div>
                  )}

                  {/* Speech Error Feedback */}
                  {speechError && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{speechError}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 4. Photo Evidence Upload & Mobile Camera */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#101828]">
                4. Photo Evidence (Real Browser Capture)
              </label>
              <span className="text-[11px] text-[#52606D]">
                JPEG, PNG, WebP up to 25MB
              </span>
            </div>

            {/* Hidden File and Camera Inputs */}
            <input
              id="file-gallery-input"
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/*"
              className="hidden"
            />

            <input
              id="mobile-camera-input"
              type="file"
              ref={cameraInputRef}
              onChange={handleFileInputChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {/* Upload Triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Drag and drop gallery button */}
              <div
                id="upload-gallery-box"
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#D9E0E7] hover:border-[#2563EB] rounded-xl p-5 text-center cursor-pointer bg-[#F7F8FA] hover:bg-blue-50/20 transition-all flex flex-col items-center justify-center min-h-[120px] touch-manipulation"
              >
                <UploadCloud className="w-7 h-7 text-[#2563EB] mb-1.5" />
                <span className="text-xs font-bold text-[#101828]">
                  Browse Photos / Files
                </span>
                <span className="text-[10px] text-[#52606D] mt-0.5">
                  Select one or multiple images from device
                </span>
              </div>

              {/* Direct Camera Shutter Trigger for Mobile/Desktop */}
              <div
                id="open-camera-box"
                onClick={() => cameraInputRef.current?.click()}
                className="border-2 border-dashed border-[#D9E0E7] hover:border-[#16803A] rounded-xl p-5 text-center cursor-pointer bg-[#F7F8FA] hover:bg-emerald-50/20 transition-all flex flex-col items-center justify-center min-h-[120px] touch-manipulation"
              >
                <Camera className="w-7 h-7 text-[#16803A] mb-1.5" />
                <span className="text-xs font-bold text-[#101828]">
                  Take Live Photo with Camera
                </span>
                <span className="text-[10px] text-[#52606D] mt-0.5">
                  Triggers native camera lens on mobile devices
                </span>
              </div>
            </div>

            {/* Media Error Alert */}
            {mediaError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{mediaError}</span>
              </div>
            )}

            {/* Uploaded Media Cards List with Preview & Metadata */}
            {mediaList.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-[#101828] uppercase tracking-wider block font-mono-data">
                  Attached Scene Photos ({mediaList.length})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mediaList.map((media) => (
                    <div
                      key={media.id}
                      className="p-3 bg-white border border-[#D9E0E7] rounded-xl flex items-start justify-between gap-3 shadow-2xs relative group"
                    >
                      <div className="flex items-start gap-3 overflow-hidden">
                        {/* Thumbnail Preview */}
                        <div className="w-14 h-14 rounded-lg bg-slate-100 border border-[#D9E0E7] overflow-hidden shrink-0 relative">
                          <img
                            src={media.previewUrl}
                            alt={media.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Metadata Details */}
                        <div className="overflow-hidden space-y-0.5 text-xs">
                          <span className="font-bold text-[#101828] block truncate max-w-[170px]" title={media.name}>
                            {media.name}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] font-mono-data text-[#52606D]">
                            <span>{media.sizeFormatted}</span>
                            <span>•</span>
                            <span className="uppercase">{media.mimeType.split('/')[1]}</span>
                          </div>
                          {media.width && media.height && (
                            <span className="text-[10px] font-mono-data text-slate-400 block">
                              {media.width} × {media.height} px
                            </span>
                          )}

                          {/* Size Warning Badge */}
                          {media.isSizeWarning && (
                            <span className="inline-flex items-center gap-1 text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold font-mono-data mt-1">
                              <AlertTriangle className="w-2.5 h-2.5" /> Large Media File
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(media.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Client-side Validation Disclaimer Note */}
            <div className="p-3 bg-slate-50 border border-[#D9E0E7] rounded-lg text-[11px] text-[#52606D] flex items-start gap-2">
              <Shield className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Privacy & Security Protection:</strong> Client-side validation checks image types before transmission. For production security, media undergoes EXIF privacy stripping, sandbox MIME verification, and hash checking on server ingestion.
              </p>
            </div>
          </div>

          {/* 5. People Affected Values */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#101828]">
                5. Estimated People at Immediate Risk
              </label>
              {formErrors.peopleCount && (
                <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.peopleCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {[1, 2, 3, 5, 10, 25].map((num) => (
                <button
                  key={num}
                  id={`people-count-btn-${num}`}
                  type="button"
                  onClick={() => {
                    setPeopleCount(num);
                    setFormErrors((prev) => ({ ...prev, peopleCount: undefined }));
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-mono-data font-bold border transition-colors cursor-pointer min-h-[44px] touch-manipulation ${
                    peopleCount === num
                      ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-2xs'
                      : 'bg-white text-[#101828] border-[#D9E0E7] hover:bg-[#F7F8FA]'
                  }`}
                >
                  {num} {num === 1 ? 'person' : 'people'}
                </button>
              ))}

              <button
                id="people-count-unknown-btn"
                type="button"
                onClick={() => {
                  setPeopleCount('UNKNOWN');
                  setFormErrors((prev) => ({ ...prev, peopleCount: undefined }));
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer min-h-[44px] touch-manipulation ${
                  peopleCount === 'UNKNOWN'
                    ? 'bg-[#0B1F33] text-white border-[#0B1F33] shadow-2xs'
                    : 'bg-white text-[#52606D] border-[#D9E0E7] hover:bg-[#F7F8FA]'
                }`}
              >
                Unknown / Unsure
              </button>
            </div>
          </div>

          {/* 6. Reporter Identity / Anonymous Option */}
          <div className="space-y-3 p-4 bg-[#F7F8FA] border border-[#D9E0E7] rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#101828]">
                6. Contact Information (Optional)
              </label>
              <label className="flex items-center gap-2 text-xs text-[#52606D] cursor-pointer min-h-[36px]">
                <input
                  id="anonymous-checkbox"
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span className="font-semibold">Submit Anonymously</span>
              </label>
            </div>

            {!isAnonymous ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  id="reporter-name-input"
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="p-2.5 text-xs bg-white border border-[#D9E0E7] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] text-[#101828] min-h-[44px]"
                />
                <input
                  id="reporter-phone-input"
                  type="tel"
                  placeholder="Phone Number for Dispatch Callback"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  className="p-2.5 text-xs bg-white border border-[#D9E0E7] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] text-[#101828] min-h-[44px]"
                />
              </div>
            ) : (
              <p className="text-[11px] text-[#52606D] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#16803A]" />
                Anonymous mode active. No personal metadata or identifiers will be recorded.
              </p>
            )}
          </div>

          {/* Submission Processing Dialog / CTA */}
          {isSubmitting ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-center">
              <div className="flex items-center justify-center gap-2 text-[#2563EB] font-bold text-xs font-mono-data">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{submissionStep}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-1.5 overflow-hidden max-w-xs mx-auto">
                <div className="bg-[#2563EB] h-full animate-pulse w-3/4"></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                id="submit-emergency-report-btn"
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer min-h-[50px] touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Transmit Emergency Report to CAD</span>
              </button>


              <button
                id="cancel-report-btn"
                type="button"
                onClick={() => onNavigate('citizen-landing')}
                className="px-6 py-4 bg-white border border-[#D9E0E7] hover:bg-[#F7F8FA] text-[#52606D] font-semibold text-xs rounded-xl transition-colors text-center cursor-pointer min-h-[50px] touch-manipulation"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Manual Location Selection Modal */}
      <LocationPickerModal
        isOpen={isMapModalOpen}
        initialLat={currentLat}
        initialLng={currentLng}
        onClose={() => setIsMapModalOpen(false)}
        onSelectLocation={handleManualLocationSelect}
      />
    </div>
  );
};

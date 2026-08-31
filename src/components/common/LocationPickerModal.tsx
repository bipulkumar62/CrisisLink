import React, { useState } from 'react';
import {
  MapPin,
  X,
  Check,
  Navigation,
  Compass,
  Search,
  Layers,
  Info,
} from 'lucide-react';
import { resolveNearestJaipurLandmark } from '@/src/hooks/useBrowserGeolocation';

interface LocationPickerModalProps {
  isOpen: boolean;
  initialLat?: number;
  initialLng?: number;
  onClose: () => void;
  onSelectLocation: (lat: number, lng: number, formattedAddress: string) => void;
}

const JAIPUR_LANDMARKS = [
  { name: 'MI Road & Paanch Batti Circle', sector: 'Sector 3', lat: 26.918, lng: 75.815 },
  { name: 'Johari Bazaar, Walled City', sector: 'Sector 1', lat: 26.924, lng: 75.828 },
  { name: 'Mansarovar Metro Station Grid', sector: 'Sector 4', lat: 26.872, lng: 75.768 },
  { name: 'Vaishali Nagar Amrapali Circle', sector: 'Sector 5', lat: 26.905, lng: 75.742 },
  { name: 'Malviya Nagar & World Trade Park (WTP)', sector: 'Sector 7', lat: 26.853, lng: 75.805 },
  { name: 'Sitapura Industrial Area Phase III', sector: 'Sector 8', lat: 26.775, lng: 75.832 },
  { name: 'Raja Park Commercial Avenue', sector: 'Sector 2', lat: 26.898, lng: 75.834 },
  { name: 'Jagatpura Railway Overbridge Area', sector: 'Sector 9', lat: 26.822, lng: 75.845 },
  { name: 'Sanganer Airport Environs', sector: 'Sector 6', lat: 26.828, lng: 75.805 },
  { name: 'Amer Fort Road Jal Mahal Corridor', sector: 'Sector 10', lat: 26.955, lng: 75.844 },
];

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  initialLat = 26.918,
  initialLng = 75.815,
  onClose,
  onSelectLocation,
}) => {
  const [selectedLat, setSelectedLat] = useState<number>(initialLat);
  const [selectedLng, setSelectedLng] = useState<number>(initialLng);
  const [customAddress, setCustomAddress] = useState<string>(() => {
    return resolveNearestJaipurLandmark(initialLat, initialLng).address;
  });
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  // Coordinate conversion to percentage within Jaipur bounding box
  // Lat: 26.76 (South) to 26.96 (North)
  // Lng: 75.72 (West) to 75.86 (East)
  const minLat = 26.76;
  const maxLat = 26.96;
  const minLng = 75.72;
  const maxLng = 75.86;

  const toMapPercent = (lat: number, lng: number) => {
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    return {
      top: `${Math.max(5, Math.min(95, y))}%`,
      left: `${Math.max(5, Math.min(95, x))}%`,
    };
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const percentX = Math.max(0, Math.min(1, clickX / rect.width));
    const percentY = Math.max(0, Math.min(1, clickY / rect.height));

    const newLng = minLng + percentX * (maxLng - minLng);
    const newLat = maxLat - percentY * (maxLat - minLat);

    setSelectedLat(Number(newLat.toFixed(5)));
    setSelectedLng(Number(newLng.toFixed(5)));

    const resolved = resolveNearestJaipurLandmark(newLat, newLng);
    setCustomAddress(resolved.address);
  };

  const handleSelectLandmark = (item: typeof JAIPUR_LANDMARKS[0]) => {
    setSelectedLat(item.lat);
    setSelectedLng(item.lng);
    const resolved = resolveNearestJaipurLandmark(item.lat, item.lng);
    setCustomAddress(resolved.address);
  };

  const handleConfirm = () => {
    onSelectLocation(selectedLat, selectedLng, customAddress);
    onClose();
  };

  const pinPos = toMapPercent(selectedLat, selectedLng);

  const filteredLandmarks = JAIPUR_LANDMARKS.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      id="location-picker-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0B1F33]/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl border border-[#D9E0E7] shadow-xl max-w-2xl w-full max-h-[96dvh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D9E0E7] flex items-center justify-between bg-[#F7F8FA] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 text-[#2563EB] flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#101828] font-heading">
                Select Incident Location on Jaipur Map
              </h3>
              <p className="text-[11px] text-[#52606D]">
                Click or tap anywhere on the municipal grid to drop an incident pinpoint
              </p>
            </div>
          </div>
          <button
            id="close-location-modal-btn"
            onClick={onClose}
            className="p-2 text-[#52606D] hover:text-[#101828] hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Quick Preset Filter */}
        <div className="p-3 sm:p-4 border-b border-[#D9E0E7] bg-white space-y-2.5 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Jaipur sectors, markets, or junctions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F8FA] border border-[#D9E0E7] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] text-[#101828]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
            {filteredLandmarks.slice(0, 6).map((lm) => (
              <button
                key={lm.name}
                type="button"
                onClick={() => handleSelectLandmark(lm)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors border cursor-pointer ${
                  Math.abs(selectedLat - lm.lat) < 0.01 && Math.abs(selectedLng - lm.lng) < 0.01
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-[#F7F8FA] text-[#52606D] border-[#D9E0E7] hover:border-slate-400 hover:text-[#101828]'
                }`}
              >
                {lm.name.split('&')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Tactical Map Selector Canvas */}
        <div className="flex-1 min-h-[260px] sm:min-h-[320px] relative bg-[#eef2f6] overflow-hidden select-none">
          {/* Map Surface Click Target */}
          <div
            id="interactive-map-surface"
            onClick={handleMapClick}
            className="w-full h-full relative cursor-crosshair"
          >
            {/* SVG Base Map */}
            <svg
              className="w-full h-full object-cover opacity-90 pointer-events-none"
              viewBox="0 0 1000 700"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="modal-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#d5dde4" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="1000" height="700" fill="#eef2f6" />
              <rect width="1000" height="700" fill="url(#modal-grid)" opacity="0.8" />

              {/* Pink City Walled Sector */}
              <rect x="580" y="100" width="220" height="130" fill="#edd6d2" stroke="#d4a39b" strokeWidth="2" rx="4" />
              {/* JLN Corridor */}
              <path d="M 640 160 L 610 380 L 590 560" fill="none" stroke="#ffffff" strokeWidth="14" />
              <path d="M 640 160 L 610 380 L 590 560" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="5 3" />
              {/* MI Road */}
              <path d="M 120 280 L 480 240 L 820 220" fill="none" stroke="#ffffff" strokeWidth="12" />
              <path d="M 120 280 L 480 240 L 820 220" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 3" />
              {/* Tonk Road */}
              <path d="M 520 220 L 560 460 L 680 700" fill="none" stroke="#ffffff" strokeWidth="12" />

              {/* Major Landmarks Text */}
              <text x="600" y="90" fill="#64748b" fontSize="13" fontWeight="bold">Walled City</text>
              <text x="380" y="230" fill="#64748b" fontSize="13" fontWeight="bold">MI Road / Paanch Batti</text>
              <text x="140" y="270" fill="#64748b" fontSize="13" fontWeight="bold">Vaishali Nagar</text>
              <text x="180" y="440" fill="#64748b" fontSize="13" fontWeight="bold">Mansarovar Metro</text>
              <text x="630" y="370" fill="#64748b" fontSize="13" fontWeight="bold">Malviya Nagar (WTP)</text>
              <text x="590" y="620" fill="#64748b" fontSize="13" fontWeight="bold">Sitapura</text>
            </svg>

            {/* Pulsing Pin Marker */}
            <div
              className="absolute -translate-x-1/2 -translate-y-full transition-all duration-150 pointer-events-none z-30 flex flex-col items-center"
              style={{ top: pinPos.top, left: pinPos.left }}
            >
              <div className="bg-[#0B1F33] text-white text-[10px] font-mono-data px-2 py-0.5 rounded shadow-md whitespace-nowrap mb-0.5 border border-white/20">
                {selectedLat.toFixed(4)}°N, {selectedLng.toFixed(4)}°E
              </div>
              <div className="w-8 h-8 rounded-full bg-[#D92D20] text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-[#D92D20]/30 animate-bounce">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="w-2 h-2 rounded-full bg-black/40 blur-2xs mt-[-2px]"></div>
            </div>

            {/* Click instruction banner */}
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#101828] border border-[#D9E0E7] shadow-xs flex items-center gap-1.5 pointer-events-none">
              <Info className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Tap on the map to place incident pin</span>
            </div>
          </div>
        </div>

        {/* Selected Coordinate & Address Preview */}
        <div className="p-4 bg-[#F7F8FA] border-t border-[#D9E0E7] space-y-3 shrink-0">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#101828] uppercase tracking-wider block">
              Resolved Street / Landmark Address
            </label>
            <input
              type="text"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#D9E0E7] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] text-[#101828] font-medium"
              placeholder="e.g. MI Road, Paanch Batti Circle, Jaipur"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="text-[11px] font-mono-data text-[#52606D] flex items-center gap-3 w-full sm:w-auto">
              <span>LAT: <strong className="text-[#101828]">{selectedLat.toFixed(5)}</strong></span>
              <span>LNG: <strong className="text-[#101828]">{selectedLng.toFixed(5)}</strong></span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-[#D9E0E7] text-[#52606D] hover:bg-slate-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Pin Location</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

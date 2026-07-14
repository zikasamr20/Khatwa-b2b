import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Globe, Info } from 'lucide-react';
import { Language } from '../types';

interface InteractiveMapProps {
  lat: number;
  lng: number;
  hotelName: string;
  address: string;
  lang: Language;
  onCoordinatesChange?: (lat: number, lng: number) => void;
  editable?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  lat,
  lng,
  hotelName,
  address,
  lang,
  onCoordinatesChange,
  editable = false,
}) => {
  const [mapType, setMapType] = useState<'vector' | 'satellite'>('vector');
  const [selectedPoi, setSelectedPoi] = useState<string | null>(null);

  // Egypt Bounds Approximation: Lat 22 to 32, Lng 25 to 35
  // We map Egypt coordinates onto our visual coordinate grid
  const getMapCoords = (cLat: number, cLng: number) => {
    // Standard linear scaling for our visual map boundaries (Giza to Red Sea)
    // Map bounds: Lat [24, 31.5], Lng [29.5, 35.5]
    const minLat = 24.0;
    const maxLat = 31.5;
    const minLng = 29.5;
    const maxLng = 35.5;

    const xPercent = ((cLng - minLng) / (maxLng - minLng)) * 100;
    const yPercent = 100 - ((cLat - minLat) / (maxLat - minLat)) * 100;

    // Clamp values to stay inside the container
    return {
      x: Math.max(5, Math.min(95, xPercent)),
      y: Math.max(5, Math.min(95, yPercent)),
    };
  };

  const currentPin = getMapCoords(lat, lng);

  const keyPois = [
    { nameEn: 'Cairo Pyramids', nameAr: 'أهرامات الجيزة', lat: 29.9792, lng: 31.1342, type: 'culture' },
    { nameEn: 'Sharm Marina', nameAr: 'مرسى شرم الشيخ', lat: 27.8600, lng: 34.2800, type: 'nature' },
    { nameEn: 'Hurghada Reefs', nameAr: 'شعاب الغردقة', lat: 27.2580, lng: 33.8130, type: 'nature' },
    { nameEn: 'Luxor Karnak Temple', nameAr: 'معبد الكرنك بالأقصر', lat: 25.7188, lng: 32.6573, type: 'culture' },
    { nameEn: 'Alexandria Citadel', nameAr: 'قلعة قايتباي بالإسكندرية', lat: 31.2140, lng: 29.8850, type: 'culture' },
  ];

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editable || !onCoordinatesChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    // Reverse mathematical translation
    const minLat = 24.0;
    const maxLat = 31.5;
    const minLng = 29.5;
    const maxLng = 35.5;

    const cLng = (xPercent / 100) * (maxLng - minLng) + minLng;
    const cLat = (1 - yPercent / 100) * (maxLat - minLat) + minLat;

    onCoordinatesChange(parseFloat(cLat.toFixed(4)), parseFloat(cLng.toFixed(4)));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden p-6 text-slate-700 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs tracking-wider uppercase">
            <Compass className="w-4 h-4 animate-spin-slow" />
            {lang === 'ar' ? 'نظام تحديد المواقع الجغرافي' : 'GPS Geographic Locator'}
          </div>
          <h4 className="text-xl font-bold text-slate-900 mt-1">
            {editable 
              ? (lang === 'ar' ? 'اختر الإحداثيات على الخريطة' : 'Click to Define Coordinates') 
              : hotelName
            }
          </h4>
          <p className="text-xs text-slate-500 mt-1">{address}</p>
        </div>

        {/* Map Type Switcher */}
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setMapType('vector')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              mapType === 'vector' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-850'
            }`}
          >
            {lang === 'ar' ? 'مخطط تضاريس' : 'Vector Map'}
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              mapType === 'satellite' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-850'
            }`}
          >
            {lang === 'ar' ? 'قمر صناعي' : 'Satellite Grid'}
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div 
        onClick={handleMapClick}
        className={`relative h-[350px] rounded-xl border overflow-hidden cursor-crosshair transition-all duration-500 ${
          mapType === 'satellite' 
            ? "bg-slate-950 border-slate-800" 
            : "bg-slate-50 border-slate-200"
        }`}
        style={{
          backgroundImage: mapType === 'satellite' 
            ? 'radial-gradient(rgba(245, 158, 11, 0.08) 1px, transparent 1px), radial-gradient(rgba(255, 255, 255, 0.02) 2px, transparent 2px)'
            : 'radial-gradient(rgba(100, 116, 139, 0.06) 1.5px, transparent 1.5px)',
          backgroundSize: mapType === 'satellite' ? '24px 24px, 48px 48px' : '20px 20px'
        }}
      >
        {/* Simplified Egypt Vector Landmark Lines */}
        <svg className={`absolute inset-0 w-full h-full stroke-1 fill-none pointer-events-none ${
          mapType === 'satellite' ? 'opacity-20 stroke-slate-700' : 'opacity-40 stroke-slate-300'
        }`}>
          {/* Nile River approximation */}
          <path d="M 50,350 Q 52,280 48,220 T 55,100 T 50,40 Q 55,10 70,10" className="stroke-sky-600/40 stroke-2" />
          {/* Delta fan */}
          <path d="M 50,40 Q 30,10 10,10 M 50,40 Q 70,10 90,10" className="stroke-sky-600/40 stroke-2" />
          {/* Suez Canal */}
          <line x1="75" y1="42" x2="73" y2="80" className="stroke-cyan-600/30" />
          {/* Gulf of Suez and Aqaba (Sinai Peninsula V-shape) */}
          <path d="M 73,80 L 80,140 L 88,100" className="stroke-amber-600/20 stroke-2" />
          {/* Grid lines */}
          <line x1="20%" y1="0" x2="20%" y2="100%" strokeDasharray="3,3" />
          <line x1="50%" y1="0" x2="50%" y2="100%" strokeDasharray="3,3" />
          <line x1="80%" y1="0" x2="80%" y2="100%" strokeDasharray="3,3" />
          <line x1="0" y1="30%" x2="100%" y2="30%" strokeDasharray="3,3" />
          <line x1="0" y1="60%" x2="100%" y2="60%" strokeDasharray="3,3" />
        </svg>

        {/* Dynamic Interactive Egyptian Regions Background overlays */}
        <div className={`absolute inset-0 flex flex-col justify-between p-4 pointer-events-none text-[10px] tracking-wider font-semibold ${
          mapType === 'satellite' ? 'text-slate-500' : 'text-slate-400'
        }`}>
          <div className="flex justify-between">
            <span>MEDITERRANEAN SEA (البحر المتوسط)</span>
            <span>SINAI (سيناء)</span>
          </div>
          <div className="flex justify-between items-center h-full">
            <span>WESTERN DESERT (الصحراء الغربية)</span>
            <span className="text-right">RED SEA (البحر الأحمر)</span>
          </div>
          <div className="flex justify-between">
            <span>UPPER EGYPT (الصعيد)</span>
            <span>EASTERN DESERT (الصحراء الشرقية)</span>
          </div>
        </div>

        {/* Render POIs */}
        {keyPois.map((poi, idx) => {
          const poiCoords = getMapCoords(poi.lat, poi.lng);
          return (
            <div
              key={idx}
              className="absolute group z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${poiCoords.x}%`, top: `${poiCoords.y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPoi(`${poi.lat},${poi.lng}`);
              }}
            >
              <div className={`w-2.5 h-2.5 rounded-full border-2 transition-all ${
                mapType === 'satellite'
                  ? 'bg-slate-800 border-slate-500 group-hover:bg-amber-400 group-hover:border-white'
                  : 'bg-white border-slate-400 group-hover:bg-amber-500 group-hover:border-slate-800'
              }`}></div>
              {/* Tooltip */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[9px] text-slate-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
                {lang === 'ar' ? poi.nameAr : poi.nameEn}
              </div>
            </div>
          );
        })}

        {/* Selected Coordinates Pin Point */}
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-full transition-all duration-300"
          style={{ left: `${currentPin.x}%`, top: `${currentPin.y}%` }}
        >
          <div className="flex flex-col items-center">
            {/* Animated Ring */}
            <span className="absolute bottom-0 w-8 h-8 bg-amber-500/20 rounded-full animate-ping pointer-events-none"></span>
            
            {/* Map Pin Icon */}
            <div className="bg-amber-500 text-slate-950 p-2 rounded-full shadow-md border-2 border-white hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5 fill-current" />
            </div>

            {/* Micro label */}
            <div className="mt-1.5 bg-slate-900 border border-slate-800 text-[10px] font-mono px-2 py-0.5 rounded shadow-md text-amber-400 whitespace-nowrap">
              {hotelName || (lang === 'ar' ? 'موقع محدد' : 'Pinpoint')}
            </div>
          </div>
        </div>

        {/* Compass Overlay in corner */}
        <div className={`absolute right-4 bottom-4 border p-2.5 rounded-xl shadow-xs flex items-center gap-2 pointer-events-none ${
          mapType === 'satellite'
            ? 'bg-slate-900/95 border-slate-800 text-slate-300'
            : 'bg-white/95 border-slate-200 text-slate-700'
        }`}>
          <Globe className="w-4 h-4 text-amber-500 animate-spin-slow" />
          <div className="font-mono text-[9px]">
            <div>LAT: {lat.toFixed(4)}°N</div>
            <div>LNG: {lng.toFixed(4)}°E</div>
          </div>
        </div>
      </div>

      {/* Footer Info or controls */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-150 pt-4 text-xs text-slate-550">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            {editable 
              ? (lang === 'ar' ? 'انقر على الخريطة لتحديث الإحداثيات الجغرافية للفندق الجديد.' : 'Click anywhere on the map grid to adjust coordinates for the new property.')
              : (lang === 'ar' ? 'موقع الفندق محدد بدقة لدعم عقود رحلات الحافلات وخدمات الاستقبال.' : 'The hotel location is verified for business transportation, routing and terminal reception.')
            }
          </span>
        </div>
        {!editable && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 hover:text-amber-700 flex items-center gap-1 font-semibold transition-colors hover:underline"
          >
            <Navigation className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}
          </a>
        )}
      </div>
    </div>
  );
};

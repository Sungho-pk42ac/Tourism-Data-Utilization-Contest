import { useState } from 'react'
import { MapPin, Star } from 'lucide-react'

/** 카테고리 → 배지 */
const CATEGORY_LABEL = {
  activity:  { label: '관광지', className: 'bg-blue-100 text-blue-700' },
  meal:      { label: '음식점', className: 'bg-orange-100 text-orange-700' },
  stay:      { label: '숙박',   className: 'bg-green-100 text-green-700' },
  logistics: { label: '교통',   className: 'bg-slate-100 text-slate-600' },
}

/** 혼잡도 → 배지 */
const CONGESTION_MAP = {
  'very-high': { label: '매우혼잡', className: 'bg-red-500 text-white' },
  high:        { label: '혼잡',     className: 'bg-orange-500 text-white' },
  medium:      { label: '보통',     className: 'bg-yellow-400 text-white' },
  low:         { label: '여유',     className: 'bg-green-500 text-white' },
}

export default function AttractionCard({ location, congestionLevel, onSelect }) {
  const [imgError, setImgError] = useState(false)
  const cat = CATEGORY_LABEL[location.category] || CATEGORY_LABEL.activity
  const cong = CONGESTION_MAP[congestionLevel]

  const fallbackImg = `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=60`

  return (
    <button
      onClick={() => onSelect?.(location)}
      className="group w-full text-left bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-150"
    >
      {/* 커버 이미지 */}
      <div className="relative h-32 overflow-hidden bg-slate-100">
        <img
          src={imgError ? fallbackImg : (location.imageUrl || fallbackImg)}
          alt={location.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* 혼잡도 배지 */}
        {cong && (
          <span className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded shadow ${cong.className}`}>
            {cong.label}
          </span>
        )}
        {/* 카테고리 배지 */}
        <span className={`absolute top-2 left-2 text-[10px] font-semibold px-1.5 py-0.5 rounded ${cat.className}`}>
          {cat.label}
        </span>
      </div>

      {/* 정보 */}
      <div className="px-3 py-2.5">
        <p className="text-sm font-semibold text-slate-700 truncate">{location.title}</p>
        {location.address && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <p className="text-[10px] text-slate-400 truncate">{location.address}</p>
          </div>
        )}
        {location.rating && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 text-yellow-400" />
            <span className="text-[11px] font-mono text-slate-500">{location.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </button>
  )
}

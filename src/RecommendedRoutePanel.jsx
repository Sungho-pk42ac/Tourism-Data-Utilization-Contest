import { useCallback, useState } from 'react'
import { ChevronRight, Clock, MapPin, Navigation, RefreshCw, Star } from 'lucide-react'

/** Haversine 거리 (km) */
function distanceKm(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const c =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c))
}

/** 혼잡도 패턴에서 특정 시간 혼잡도 가져오기 */
const HOURLY_CONGESTION = {
  6: 15, 7: 25, 8: 45, 9: 72, 10: 88, 11: 95,
  12: 92, 13: 85, 14: 80, 15: 78, 16: 70,
  17: 55, 18: 40, 19: 30, 20: 20,
}

function getCongestionAtHour(hour) {
  const keys = Object.keys(HOURLY_CONGESTION).map(Number)
  const nearest = keys.reduce((p, c) => Math.abs(c - hour) < Math.abs(p - hour) ? c : p, keys[0])
  return HOURLY_CONGESTION[nearest] || 50
}

/** 카테고리 선호도 가중치 */
const CATEGORY_WEIGHTS = {
  activity: { activity: 1.5, meal: 0.8, stay: 0.5, logistics: 0.3 },
  food:     { activity: 0.7, meal: 1.5, stay: 0.5, logistics: 0.3 },
  culture:  { activity: 1.2, meal: 0.9, stay: 0.8, logistics: 0.4 },
  rest:     { activity: 0.6, meal: 1.0, stay: 1.5, logistics: 0.5 },
}

/**
 * 그리디 Nearest Neighbor 기반 추천 동선 생성
 * @param {object[]} candidates - 후보 위치 목록
 * @param {object} startCoord - 출발 좌표
 * @param {number} availableHours - 가용 시간
 * @param {string[]} preferences - 선호 카테고리
 * @param {boolean} avoidCongestion - 혼잡 회피
 * @returns {object} - 추천 경로 및 점수
 */
function buildRecommendedRoute(candidates, startCoord, availableHours = 6, preferences = [], avoidCongestion = false) {
  if (!candidates.length) return null

  const startHour = 9
  const avgTimePerStop = 1.5 // 시간

  const prefWeight = (category) => {
    let weight = 1
    preferences.forEach((pref) => {
      const w = CATEGORY_WEIGHTS[pref]?.[category]
      if (w) weight = Math.max(weight, w)
    })
    return weight
  }

  const scoreCandidate = (loc, currentCoord, currentHour) => {
    const dist = distanceKm(currentCoord, loc.coordinates)
    const distPenalty = Math.min(dist / 50, 1) * 30
    const categoryBonus = prefWeight(loc.category) * 20
    const congestion = getCongestionAtHour(Math.round(currentHour))
    const congestionPenalty = avoidCongestion ? (congestion / 100) * 25 : 0
    const baseScore = 70 + categoryBonus - distPenalty - congestionPenalty
    return Math.max(10, Math.min(100, Math.round(baseScore)))
  }

  const visited = new Set()
  const route = []
  let current = startCoord
  let currentHour = startHour
  let totalScore = 0

  const maxStops = Math.floor(availableHours / avgTimePerStop)

  for (let i = 0; i < maxStops; i++) {
    let best = null
    let bestScore = -1

    candidates.forEach((loc) => {
      if (visited.has(loc.id)) return
      if (!loc.coordinates) return
      const score = scoreCandidate(loc, current, currentHour)
      if (score > bestScore) {
        bestScore = score
        best = loc
      }
    })

    if (!best) break

    visited.add(best.id)
    route.push({ ...best, score: bestScore, visitHour: Math.round(currentHour) })
    current = best.coordinates
    currentHour += avgTimePerStop
    totalScore += bestScore
  }

  if (!route.length) return null

  const avgScore = Math.round(totalScore / route.length)
  const totalDist = route.reduce((sum, stop, i) => {
    const prev = i === 0 ? startCoord : route[i - 1].coordinates
    return sum + distanceKm(prev, stop.coordinates)
  }, 0)

  return {
    stops: route,
    score: avgScore,
    totalDistKm: Math.round(totalDist),
    totalHours: route.length * avgTimePerStop,
    risk: avgScore >= 75 ? 'LOW' : avgScore >= 55 ? 'MEDIUM' : 'HIGH',
  }
}

/** 위험도 배지 */
function RiskBadge({ risk }) {
  const map = {
    LOW:    { label: 'LOW',    className: 'bg-green-100 text-green-700 border-green-200' },
    MEDIUM: { label: 'MEDIUM', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    HIGH:   { label: 'HIGH',   className: 'bg-red-100 text-red-700 border-red-200' },
  }
  const { label, className } = map[risk] || map.MEDIUM
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border tracking-wide ${className}`}>
      RISK: {label}
    </span>
  )
}

/** 점수 바 */
function ScoreBar({ score }) {
  const color = score >= 75 ? '#059669' : score >= 55 ? '#D97706' : '#DC2626'
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono font-bold" style={{ color }}>
        PRIORITY: {score}/100
      </span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

const PREFERENCES = [
  { id: 'activity', label: '자연/레저' },
  { id: 'food',     label: '맛집'     },
  { id: 'culture',  label: '문화'     },
  { id: 'rest',     label: '힐링'     },
]

const BASECAMP = { lat: 33.4996, lng: 126.5312 }

export default function RecommendedRoutePanel({ tripDocument, onSelectLocation }) {
  const [selectedPrefs, setSelectedPrefs] = useState(['activity'])
  const [availableHours, setAvailableHours] = useState(6)
  const [avoidCongestion, setAvoidCongestion] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const togglePref = (id) => {
    setSelectedPrefs((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }

  const generateRoute = useCallback(async () => {
    setLoading(true)
    try {
      // TourAPI에서 후보 위치 가져오기
      const res = await fetch('/api/tour/search?areaCode=39&numOfRows=20')
      const data = await res.json()
      const candidates = data.items || []

      // tripDocument의 위치도 후보에 추가
      const docLocations = (tripDocument?.locations || []).filter(
        (l) => l.category !== 'logistics',
      )
      const allCandidates = [
        ...candidates,
        ...docLocations.filter((dl) => !candidates.find((c) => c.id === dl.id)),
      ]

      const route = buildRecommendedRoute(
        allCandidates,
        BASECAMP,
        availableHours,
        selectedPrefs,
        avoidCongestion,
      )
      setResult(route)
    } catch {
      // mock 위치로 폴백
      const mockCandidates = tripDocument?.locations?.filter(
        (l) => l.category !== 'logistics',
      ) || []
      const route = buildRecommendedRoute(
        mockCandidates,
        BASECAMP,
        availableHours,
        selectedPrefs,
        avoidCongestion,
      )
      setResult(route)
    }
    setLoading(false)
  }, [tripDocument, selectedPrefs, availableHours, avoidCongestion])

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
        <Navigation className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-semibold text-slate-700">추천 동선 엔진</span>
        <span className="text-[10px] font-mono text-slate-400 ml-auto">PALANTIR v2</span>
      </div>

      <div className="p-4 space-y-3">
        {/* 선호도 선택 */}
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            여행 선호도
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PREFERENCES.map((pref) => (
              <button
                key={pref.id}
                onClick={() => togglePref(pref.id)}
                className={`
                  text-xs px-2.5 py-1 rounded border transition-colors
                  ${selectedPrefs.includes(pref.id)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}
                `}
              >
                {pref.label}
              </button>
            ))}
          </div>
        </div>

        {/* 가용 시간 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-600">가용 시간</span>
          </div>
          <div className="flex items-center gap-1">
            {[4, 6, 8, 10].map((h) => (
              <button
                key={h}
                onClick={() => setAvailableHours(h)}
                className={`
                  text-xs w-8 h-7 rounded border transition-colors
                  ${availableHours === h
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}
                `}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>

        {/* 혼잡 회피 */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600">혼잡 지역 회피</span>
          <button
            onClick={() => setAvoidCongestion((v) => !v)}
            className={`
              relative w-10 h-5 rounded-full transition-colors
              ${avoidCongestion ? 'bg-blue-600' : 'bg-slate-200'}
            `}
          >
            <span className={`
              absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
              ${avoidCongestion ? 'translate-x-5' : 'translate-x-0.5'}
            `} />
          </button>
        </div>

        {/* 생성 버튼 */}
        <button
          onClick={generateRoute}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading
            ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> 경로 생성 중...</>
            : <><Navigation className="w-3.5 h-3.5" /> 최적 경로 생성</>
          }
        </button>

        {/* 결과 */}
        {result && (
          <div className="border border-slate-200 rounded-lg p-3 space-y-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 tracking-wide">ROUTE A: 최적 동선</span>
              <RiskBadge risk={result.risk} />
            </div>

            <ScoreBar score={result.score} />

            <div className="flex gap-4 text-[10px] text-slate-500 font-mono">
              <span>📍 {result.stops.length}개 장소</span>
              <span>⏱ {result.totalHours}시간</span>
              <span>🛣 {result.totalDistKm}km</span>
            </div>

            {/* 경유지 목록 */}
            <div className="space-y-1.5">
              {result.stops.map((stop, i) => (
                <button
                  key={stop.id}
                  onClick={() => onSelectLocation?.(stop)}
                  className="w-full flex items-center gap-2 text-left group"
                >
                  <div className="w-5 h-5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                      {stop.title}
                    </p>
                    <p className="text-[10px] text-slate-400">{stop.visitHour}시 방문</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400">{stop.score}</span>
                    <Star className="w-3 h-3 text-yellow-400" />
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

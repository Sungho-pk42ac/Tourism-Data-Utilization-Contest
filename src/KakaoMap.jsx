import { useCallback, useEffect, useRef, useState } from 'react'
import { Layers3, Navigation, X } from 'lucide-react'
import { DAYS, TIME_SLOTS } from './tripData'
import { parseEntityKey } from './tripModel'

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY

/** 차량 convoy 색상 — route.tone 기반 */
const TONE_COLORS = {
  info: '#1D4ED8',
  warning: '#D97706',
  success: '#059669',
  critical: '#DC2626',
  violet: '#7C3AED',
  muted: '#64748B',
}

/** 카테고리별 마커 색상 */
const CATEGORY_COLORS = {
  activity: '#1D4ED8',
  meal: '#D97706',
  stay: '#059669',
  logistics: '#64748B',
  park: '#059669',
}

const MIN_ROUTE_LOOP_SECONDS = 16
const MAX_ROUTE_LOOP_SECONDS = 34
const SPEED_FACTOR = 0.75

/** clamp 유틸 */
function clamp01(v) {
  return Math.min(1, Math.max(0, v))
}

function lerp(a, b, t) {
  return a + (b - a) * clamp01(t)
}

/** 두 좌표 사이 거리 (m) — Haversine */
function haversineDistance(a, b) {
  const R = 6371000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const c = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng
  return R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c))
}

/** 경로 거리 프로파일 빌드 */
function buildPathDistanceProfile(path) {
  if (!path?.length || path.length < 2) return null
  const cumulative = [0]
  let total = 0
  for (let i = 1; i < path.length; i++) {
    total += haversineDistance(path[i - 1], path[i])
    cumulative.push(total)
  }
  if (!total) return null
  return { path, cumulative, totalDistance: total }
}

/** 경로상 progress(0~1) 위치 보간 */
function interpolateAlongPath(pathProfile, progress) {
  const path = pathProfile?.path
  if (!path?.length) return null
  if (path.length === 1 || !pathProfile.totalDistance) return path[0]

  const target = clamp01(progress) * pathProfile.totalDistance
  for (let i = 1; i < path.length; i++) {
    const segEnd = pathProfile.cumulative[i]
    if (segEnd < target) continue
    const segStart = pathProfile.cumulative[i - 1]
    const segLen = segEnd - segStart
    const ratio = segLen ? (target - segStart) / segLen : 0
    const a = path[i - 1]
    const b = path[i]
    return {
      lat: lerp(a.lat, b.lat, clamp01(ratio)),
      lng: lerp(a.lng, b.lng, clamp01(ratio)),
    }
  }
  return path[path.length - 1]
}

function matchesDay(dayId, focusDayId) {
  return focusDayId === 'all' || dayId === 'all' || dayId === focusDayId
}

function getVehicleColor(route) {
  return TONE_COLORS[route?.tone] || TONE_COLORS.info
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return ''
  const mins = Math.round(seconds / 60)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (!h) return `${mins}분`
  if (!m) return `${h}시간`
  return `${h}시간 ${m}분`
}

function formatDistance(meters) {
  if (!Number.isFinite(meters) || meters <= 0) return ''
  const km = meters / 1000
  return km >= 10 ? `${Math.round(km)}km` : `${km.toFixed(1)}km`
}

/** 카카오 SDK 스크립트 로더 (한 번만 실행) */
let kakaoLoadPromise = null
function loadKakaoSdk(appKey) {
  if (!appKey) return Promise.resolve(false)
  if (window.kakao?.maps) return Promise.resolve(true)
  if (kakaoLoadPromise) return kakaoLoadPromise

  kakaoLoadPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services,heatmap&autoload=false`
    script.onload = () => {
      window.kakao.maps.load(() => resolve(true))
    }
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })
  return kakaoLoadPromise
}

/** 혼잡도 히트맵용 시간대별 제주 좌표 데이터 */
const CONGESTION_HEATMAP_DATA = {
  6: [{ lat: 33.4588, lng: 126.9425, weight: 0.2 }, { lat: 33.3617, lng: 126.5292, weight: 0.15 }],
  9: [
    { lat: 33.4588, lng: 126.9425, weight: 0.7 },
    { lat: 33.3617, lng: 126.5292, weight: 0.6 },
    { lat: 33.2491, lng: 126.4122, weight: 0.5 },
    { lat: 33.5135, lng: 126.5248, weight: 0.4 },
    { lat: 33.5432, lng: 126.6698, weight: 0.35 },
  ],
  11: [
    { lat: 33.4588, lng: 126.9425, weight: 0.95 },
    { lat: 33.3617, lng: 126.5292, weight: 0.8 },
    { lat: 33.2491, lng: 126.4122, weight: 0.75 },
    { lat: 33.5135, lng: 126.5248, weight: 0.65 },
    { lat: 33.5432, lng: 126.6698, weight: 0.6 },
    { lat: 33.4996, lng: 126.5312, weight: 0.5 },
  ],
  14: [
    { lat: 33.4588, lng: 126.9425, weight: 0.85 },
    { lat: 33.3617, lng: 126.5292, weight: 0.75 },
    { lat: 33.2491, lng: 126.4122, weight: 0.8 },
    { lat: 33.5135, lng: 126.5248, weight: 0.7 },
    { lat: 33.5432, lng: 126.6698, weight: 0.55 },
  ],
  17: [
    { lat: 33.4588, lng: 126.9425, weight: 0.5 },
    { lat: 33.3617, lng: 126.5292, weight: 0.45 },
    { lat: 33.2491, lng: 126.4122, weight: 0.6 },
    { lat: 33.5135, lng: 126.5248, weight: 0.55 },
  ],
  20: [
    { lat: 33.5135, lng: 126.5248, weight: 0.3 },
    { lat: 33.4996, lng: 126.5312, weight: 0.25 },
  ],
}

const TOTAL_SLOTS = TIME_SLOTS.length * DAYS.length

/** cursorSlot(슬롯 인덱스) → 가장 가까운 히트맵 시간 키 */
function getNearestHeatmapHour(cursorSlot) {
  const slotInDay = cursorSlot % TIME_SLOTS.length
  const hour = Math.round((slotInDay / TIME_SLOTS.length) * 24)
  const keys = Object.keys(CONGESTION_HEATMAP_DATA).map(Number)
  return keys.reduce((prev, cur) => (Math.abs(cur - hour) < Math.abs(prev - hour) ? cur : prev), keys[0])
}

export default function KakaoMap({
  tripDocument,
  currentSelection,
  focusDayId = 'all',
  cursorSlot = 0,
  isPlayingBack = false,
  onSelectEntity,
  onSelectLocation,
  agentMapCommands = null,
}) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const searchMarkersRef = useRef([])
  const polylinesRef = useRef([])
  const vehicleOverlaysRef = useRef({})
  const heatmapRef = useRef(null)
  const animFrameRef = useRef(null)
  const routePathsRef = useRef({})
  const animStartTimeRef = useRef(null)
  const lastCursorSlotRef = useRef(cursorSlot)
  const [sdkReady, setSdkReady] = useState(false)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [routeInfo, setRouteInfo] = useState(null)
  const [noKey, setNoKey] = useState(false)

  // SDK 로드
  useEffect(() => {
    if (!KAKAO_MAP_KEY) {
      setNoKey(true)
      return
    }
    loadKakaoSdk(KAKAO_MAP_KEY).then((ok) => setSdkReady(ok))
  }, [])

  // 지도 초기화
  useEffect(() => {
    if (!sdkReady || !mapContainerRef.current) return
    if (mapRef.current) return

    const map = new window.kakao.maps.Map(mapContainerRef.current, {
      center: new window.kakao.maps.LatLng(33.4996, 126.5312),
      level: 9,
    })
    mapRef.current = map

    // 줌 컨트롤
    const zoomControl = new window.kakao.maps.ZoomControl()
    map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT)
  }, [sdkReady])

  /** 기존 정적 마커 전부 제거 */
  const clearLocationMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []
  }, [])

  /** 기존 검색 마커 전부 제거 */
  const clearSearchMarkers = useCallback(() => {
    searchMarkersRef.current.forEach((m) => m.setMap(null))
    searchMarkersRef.current = []
  }, [])

  /** 폴리라인 전부 제거 */
  const clearPolylines = useCallback(() => {
    polylinesRef.current.forEach((p) => p.setMap(null))
    polylinesRef.current = []
  }, [])

  /** 차량 오버레이 전부 제거 */
  const clearVehicleOverlays = useCallback(() => {
    Object.values(vehicleOverlaysRef.current).forEach((ov) => ov.setMap(null))
    vehicleOverlaysRef.current = {}
  }, [])

  /** 커스텀 오버레이로 마커 생성 */
  const createLocationMarker = useCallback((map, location) => {
    if (!location?.coordinates) return null
    const { lat, lng } = location.coordinates
    const color = CATEGORY_COLORS[location.category] || CATEGORY_COLORS.activity
    const isSelected = currentSelection?.id === location.id

    const content = `
      <div style="
        position:relative;
        cursor:pointer;
        user-select:none;
      ">
        <div style="
          background:${color};
          border:2px solid ${isSelected ? '#fff' : 'rgba(255,255,255,0.6)'};
          border-radius:50%;
          width:${isSelected ? '20px' : '14px'};
          height:${isSelected ? '20px' : '14px'};
          box-shadow:0 2px 6px rgba(0,0,0,0.3);
          transition:all 0.15s;
        "></div>
        <div style="
          position:absolute;
          bottom:100%;
          left:50%;
          transform:translateX(-50%);
          background:rgba(255,255,255,0.95);
          color:#1E293B;
          font-size:11px;
          font-weight:600;
          padding:2px 6px;
          border-radius:3px;
          white-space:nowrap;
          box-shadow:0 1px 4px rgba(0,0,0,0.2);
          margin-bottom:4px;
          pointer-events:none;
          display:${isSelected ? 'block' : 'none'};
        ">${location.title}</div>
      </div>
    `
    const overlay = new window.kakao.maps.CustomOverlay({
      map,
      position: new window.kakao.maps.LatLng(lat, lng),
      content,
      yAnchor: 1,
    })

    // 클릭 이벤트 — overlay DOM에 직접 리스너 부착
    setTimeout(() => {
      const el = overlay.getContent()
      if (el?.addEventListener) {
        el.addEventListener('click', () => {
          onSelectLocation?.(location)
        })
      }
    }, 0)

    return overlay
  }, [currentSelection, onSelectLocation])

  /** 차량 convoy 오버레이 생성/업데이트 */
  const upsertVehicleOverlay = useCallback((map, routeId, position, color, label) => {
    const pos = new window.kakao.maps.LatLng(position.lat, position.lng)
    const content = `
      <div style="
        background:${color};
        border:2px solid #fff;
        border-radius:3px;
        padding:2px 6px;
        color:#fff;
        font-size:10px;
        font-weight:700;
        white-space:nowrap;
        box-shadow:0 2px 6px rgba(0,0,0,0.4);
        pointer-events:none;
      ">${label}</div>
    `
    if (vehicleOverlaysRef.current[routeId]) {
      vehicleOverlaysRef.current[routeId].setPosition(pos)
      vehicleOverlaysRef.current[routeId].setContent(content)
    } else {
      vehicleOverlaysRef.current[routeId] = new window.kakao.maps.CustomOverlay({
        map,
        position: pos,
        content,
        yAnchor: 1,
        zIndex: 10,
      })
    }
  }, [])

  /** Kakao Directions API 또는 mock으로 경로 좌표 획득 */
  const fetchRoutePath = useCallback(async (route) => {
    if (!route?.originCoordinates || !route?.destinationCoordinates) return null
    const cacheKey = route.id
    if (routePathsRef.current[cacheKey]) return routePathsRef.current[cacheKey]

    try {
      const origin = { x: route.originCoordinates.lng, y: route.originCoordinates.lat }
      const destination = { x: route.destinationCoordinates.lng, y: route.destinationCoordinates.lat }
      const res = await fetch('/api/directions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination }),
      })
      const data = await res.json()
      if (data.path?.length) {
        routePathsRef.current[cacheKey] = data.path
        return data.path
      }
    } catch (_) { /* mock 폴백 */ }

    // 직선 경로 폴백
    const fallback = [route.originCoordinates, route.destinationCoordinates]
    routePathsRef.current[route.id] = fallback
    return fallback
  }, [])

  /** 지도 위 위치 마커 렌더링 */
  const renderLocationMarkers = useCallback(() => {
    const map = mapRef.current
    if (!map || !tripDocument) return

    clearLocationMarkers()
    const locations = tripDocument.locations || []
    locations.forEach((location) => {
      const overlay = createLocationMarker(map, location)
      if (overlay) markersRef.current.push(overlay)
    })
  }, [tripDocument, clearLocationMarkers, createLocationMarker])

  /** 경로 폴리라인 렌더링 */
  const renderRoutes = useCallback(async () => {
    const map = mapRef.current
    if (!map || !tripDocument) return

    clearPolylines()
    const routes = tripDocument.routes || []

    for (const route of routes) {
      if (!matchesDay(route.dayId, focusDayId)) continue
      const path = await fetchRoutePath(route)
      if (!path?.length) continue

      const color = getVehicleColor(route)
      const polyline = new window.kakao.maps.Polyline({
        map,
        path: path.map((p) => new window.kakao.maps.LatLng(p.lat, p.lng)),
        strokeWeight: 3,
        strokeColor: color,
        strokeOpacity: 0.75,
        strokeStyle: 'solid',
      })
      polylinesRef.current.push(polyline)
    }
  }, [tripDocument, focusDayId, clearPolylines, fetchRoutePath])

  /** convoy 애니메이션 루프 */
  const runConvoyAnimation = useCallback(() => {
    const map = mapRef.current
    if (!map || !isPlayingBack) return

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    animStartTimeRef.current = null

    const animate = (now) => {
      if (!animStartTimeRef.current) animStartTimeRef.current = now
      const elapsed = (now - animStartTimeRef.current) / 1000

      const routes = (tripDocument?.routes || []).filter((r) => matchesDay(r.dayId, focusDayId))

      routes.forEach((route) => {
        const path = routePathsRef.current[route.id]
        if (!path?.length) return

        const profile = buildPathDistanceProfile(path)
        if (!profile) return

        const loopSeconds = Math.min(
          MAX_ROUTE_LOOP_SECONDS,
          Math.max(MIN_ROUTE_LOOP_SECONDS, (profile.totalDistance / 1000 / 60) * SPEED_FACTOR * 60),
        )
        const rawProgress = (elapsed % loopSeconds) / loopSeconds
        const position = interpolateAlongPath(profile, rawProgress)
        if (!position) return

        const color = getVehicleColor(route)
        const families = route.familyIds || []
        const label = families.length > 1 ? `${families.length}대` : route.title?.slice(0, 4) || '차량'
        upsertVehicleOverlay(map, route.id, position, color, label)
      })

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isPlayingBack, tripDocument, focusDayId, upsertVehicleOverlay])

  /** 혼잡도 히트맵 업데이트 */
  const updateHeatmap = useCallback((visible, cursorSlotValue) => {
    const map = mapRef.current
    if (!map) return

    if (!visible) {
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null)
        heatmapRef.current = null
      }
      return
    }

    const hour = getNearestHeatmapHour(cursorSlotValue)
    const points = CONGESTION_HEATMAP_DATA[hour] || []
    const data = points.map((p) => ({
      latLng: new window.kakao.maps.LatLng(p.lat, p.lng),
      count: Math.round(p.weight * 100),
    }))

    if (heatmapRef.current) {
      heatmapRef.current.setData({ max: 100, data })
    } else {
      heatmapRef.current = new window.kakao.maps.HeatMap(map, { radius: 60, opacity: 0.6 })
      heatmapRef.current.setData({ max: 100, data })
    }
  }, [])

  // 위치 마커 & 경로 렌더링
  useEffect(() => {
    if (!sdkReady || !mapRef.current) return
    renderLocationMarkers()
  }, [sdkReady, tripDocument, currentSelection, renderLocationMarkers])

  useEffect(() => {
    if (!sdkReady || !mapRef.current) return
    renderRoutes()
  }, [sdkReady, tripDocument, focusDayId, renderRoutes])

  // convoy 애니메이션
  useEffect(() => {
    if (!sdkReady || !mapRef.current) return
    if (!isPlayingBack) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      clearVehicleOverlays()
      return
    }
    const cleanup = runConvoyAnimation()
    return cleanup
  }, [sdkReady, isPlayingBack, runConvoyAnimation, clearVehicleOverlays])

  // 히트맵
  useEffect(() => {
    if (!sdkReady || !mapRef.current) return
    updateHeatmap(showHeatmap, cursorSlot)
  }, [sdkReady, showHeatmap, cursorSlot, updateHeatmap])

  // 현재 선택된 위치로 지도 이동
  useEffect(() => {
    const map = mapRef.current
    if (!map || !currentSelection) return

    const { type, id } = currentSelection
    if (type === 'location' || type === 'activity' || type === 'meal' || type === 'stay') {
      const locations = tripDocument?.locations || []
      const loc = locations.find((l) => l.id === id)
      if (loc?.coordinates) {
        map.setCenter(new window.kakao.maps.LatLng(loc.coordinates.lat, loc.coordinates.lng))
        if (map.getLevel() > 7) map.setLevel(7)
      }
    }
  }, [currentSelection, tripDocument])

  // AI 에이전트 명령 처리
  useEffect(() => {
    if (!agentMapCommands || !sdkReady || !mapRef.current) return
    const map = mapRef.current
    const { command, args } = agentMapCommands

    if (command === 'setCenter') {
      map.setCenter(new window.kakao.maps.LatLng(args.lat, args.lng))
      if (args.level) map.setLevel(args.level)
    } else if (command === 'markLocations') {
      clearSearchMarkers()
      ;(args.locations || []).forEach((loc) => {
        if (!loc.coordinates) return
        const color = CATEGORY_COLORS[loc.category] || CATEGORY_COLORS.activity
        const content = `
          <div style="
            background:${color};
            border:3px solid #fff;
            border-radius:50%;
            width:18px;
            height:18px;
            box-shadow:0 3px 8px rgba(0,0,0,0.4);
            cursor:pointer;
          " title="${loc.title}"></div>
        `
        const overlay = new window.kakao.maps.CustomOverlay({
          map,
          position: new window.kakao.maps.LatLng(loc.coordinates.lat, loc.coordinates.lng),
          content,
          yAnchor: 1,
        })
        searchMarkersRef.current.push(overlay)
      })
      if (args.locations?.length) {
        const first = args.locations[0]
        if (first.coordinates) {
          map.setCenter(new window.kakao.maps.LatLng(first.coordinates.lat, first.coordinates.lng))
          map.setLevel(8)
        }
      }
    } else if (command === 'clearSearchMarkers') {
      clearSearchMarkers()
    } else if (command === 'showHeatmap') {
      setShowHeatmap(true)
      updateHeatmap(true, args.hour * (TIME_SLOTS.length / 24))
    }
  }, [agentMapCommands, sdkReady, clearSearchMarkers, updateHeatmap])

  // 경로 정보 오버레이
  useEffect(() => {
    if (!currentSelection) { setRouteInfo(null); return }
    const { type, id } = parseEntityKey(currentSelection)
    if (type === 'route') {
      const route = (tripDocument?.routes || []).find((r) => r.id === id)
      if (route) {
        setRouteInfo({
          title: route.title,
          duration: formatDuration(route.durationSeconds),
          distance: formatDistance(route.distanceMeters),
        })
        return
      }
    }
    setRouteInfo(null)
  }, [currentSelection, tripDocument])

  if (noKey) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-100 gap-3">
        <Navigation className="w-10 h-10 text-slate-400" />
        <p className="text-sm font-semibold text-slate-600">카카오지도 API 키 미설정</p>
        <p className="text-xs text-slate-400 text-center px-8">
          .env 파일에 <code className="bg-slate-200 px-1 rounded">VITE_KAKAO_MAP_KEY</code>를 추가하면 지도가 표시됩니다.
        </p>
      </div>
    )
  }

  if (!sdkReady) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">카카오지도 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* 지도 컨테이너 */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* 히트맵 토글 버튼 */}
      <button
        onClick={() => setShowHeatmap((v) => !v)}
        className={`
          absolute top-3 right-12 z-10
          flex items-center gap-1.5 px-3 py-1.5
          rounded text-xs font-semibold shadow-md
          transition-colors duration-150
          ${showHeatmap
            ? 'bg-orange-500 text-white'
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}
        `}
        title="시간대별 혼잡도 히트맵"
      >
        <Layers3 className="w-3.5 h-3.5" />
        혼잡도
      </button>

      {/* 경로 정보 오버레이 */}
      {routeInfo && (
        <div className="absolute bottom-4 left-3 z-10 bg-white border border-slate-200 rounded shadow-md px-3 py-2 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-slate-700">{routeInfo.title}</span>
            <button onClick={() => setRouteInfo(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-3 mt-1 text-slate-500">
            {routeInfo.duration && <span>⏱ {routeInfo.duration}</span>}
            {routeInfo.distance && <span>📍 {routeInfo.distance}</span>}
          </div>
        </div>
      )}

      {/* 검색 마커 개수 표시 */}
      {searchMarkersRef.current.length > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded shadow-md flex items-center gap-1.5">
          <span>{searchMarkersRef.current.length}개 검색 결과</span>
          <button
            onClick={() => { clearSearchMarkers(); }}
            className="ml-1 hover:bg-blue-700 rounded p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}

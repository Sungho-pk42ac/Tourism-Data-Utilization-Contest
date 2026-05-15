import { Router } from 'express'

const router = Router()
const TOUR_API_BASE = 'https://apis.data.go.kr/B551011/KorService1'

/** TourAPI 응답을 공통 Location 형태로 변환 */
function transformItem(item) {
  return {
    id: `tour-${item.contentid}`,
    contentId: item.contentid,
    contentTypeId: item.contenttypeid,
    title: item.title,
    address: `${item.addr1 || ''}${item.addr2 ? ' ' + item.addr2 : ''}`.trim(),
    coordinates: {
      lat: parseFloat(item.mapy) || 0,
      lng: parseFloat(item.mapx) || 0,
    },
    imageUrl: item.firstimage || item.firstimage2 || null,
    tel: item.tel || null,
    areaCode: item.areacode,
    sigunguCode: item.sigungucode,
    category: mapContentTypeToCategory(item.contenttypeid),
  }
}

function mapContentTypeToCategory(typeId) {
  const map = {
    12: 'activity',  // 관광지
    14: 'activity',  // 문화시설
    15: 'activity',  // 행사/공연/축제
    25: 'activity',  // 여행코스
    28: 'activity',  // 레포츠
    32: 'stay',      // 숙박
    38: 'logistics', // 쇼핑
    39: 'meal',      // 음식점
  }
  return map[typeId] || 'activity'
}

/** Mock 데이터 — API 키 없을 때 반환 */
function getMockLocations(keyword) {
  const mocks = [
    {
      id: 'mock-seongsan',
      contentId: '126508',
      contentTypeId: '12',
      title: '성산일출봉',
      address: '제주특별자치도 서귀포시 성산읍 일출로 284-12',
      coordinates: { lat: 33.4588, lng: 126.9425 },
      imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=900&q=80',
      areaCode: '39',
      category: 'activity',
    },
    {
      id: 'mock-hallasan',
      contentId: '126530',
      contentTypeId: '12',
      title: '한라산국립공원',
      address: '제주특별자치도 제주시 한라산길',
      coordinates: { lat: 33.3617, lng: 126.5292 },
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=900&q=80',
      areaCode: '39',
      category: 'activity',
    },
    {
      id: 'mock-jungmun',
      contentId: '125453',
      contentTypeId: '12',
      title: '중문관광단지',
      address: '제주특별자치도 서귀포시 중문관광로',
      coordinates: { lat: 33.2491, lng: 126.4122 },
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80',
      areaCode: '39',
      category: 'activity',
    },
    {
      id: 'mock-hamdeok',
      contentId: '127455',
      contentTypeId: '12',
      title: '함덕해수욕장',
      address: '제주특별자치도 제주시 조천읍 함덕리',
      coordinates: { lat: 33.5432, lng: 126.6698 },
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
      areaCode: '39',
      category: 'activity',
    },
    {
      id: 'mock-dongmun',
      contentId: '126887',
      contentTypeId: '39',
      title: '동문재래시장',
      address: '제주특별자치도 제주시 관덕로 14길 20',
      coordinates: { lat: 33.5135, lng: 126.5248 },
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
      areaCode: '39',
      category: 'meal',
    },
  ]
  if (!keyword) return mocks
  const matched = mocks.filter((m) => m.title.includes(keyword) || m.address.includes(keyword))
  return matched.length ? matched : mocks
}

/** GET /api/tour/search?keyword=성산&areaCode=39&contentTypeId=12&numOfRows=10 */
function toRadians(value) {
  return (value * Math.PI) / 180
}

function distanceMetersBetween(left, right) {
  if (!left || !right) return Number.POSITIVE_INFINITY
  const earthRadius = 6371000
  const dLat = toRadians(right.lat - left.lat)
  const dLng = toRadians(right.lng - left.lng)
  const lat1 = toRadians(left.lat)
  const lat2 = toRadians(right.lat)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getDistanceToRouteMeters(location, route) {
  const point = location?.coordinates
  const path = Array.isArray(route?.path) ? route.path : []
  if (!point || !path.length) return Number.POSITIVE_INFINITY
  return Math.min(...path.map((routePoint) => distanceMetersBetween(point, routePoint)))
}

function getRouteSamplePoints(route) {
  const path = Array.isArray(route?.path) ? route.path.filter((point) =>
    Number.isFinite(point?.lat) && Number.isFinite(point?.lng),
  ) : []
  if (path.length <= 4) return path
  const indexes = new Set([0, Math.floor(path.length * 0.33), Math.floor(path.length * 0.66), path.length - 1])
  return [...indexes].map((index) => path[index]).filter(Boolean)
}

function normalizeTourItems(raw) {
  const list = Array.isArray(raw) ? raw : raw ? [raw] : []
  return list
    .map(transformItem)
    .filter((item) => item.title && Number.isFinite(item.coordinates.lat) && Number.isFinite(item.coordinates.lng))
}

async function fetchTourItems(endpointName, params) {
  const response = await fetch(`${TOUR_API_BASE}/${endpointName}?${params}`)
  const data = await response.json()
  const raw = data?.response?.body?.items?.item ?? []
  return normalizeTourItems(raw)
}

function uniqueByContentId(items) {
  const seen = new Set()
  return items.filter((item) => {
    const key = item.contentId || item.id
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function rankRouteRecommendations(items, route, keyword = '') {
  const normalizedKeyword = String(keyword || '').trim().toLowerCase()
  return [...items]
    .map((item) => {
      const haystack = `${item.title || ''} ${item.address || ''}`.toLowerCase()
      const keywordBoost = normalizedKeyword && haystack.includes(normalizedKeyword) ? -2500 : 0
      const routeDistanceMeters = getDistanceToRouteMeters(item, route)
      return {
        ...item,
        routeDistanceMeters,
        score: (Number.isFinite(routeDistanceMeters) ? routeDistanceMeters : 999999999) + keywordBoost,
      }
    })
    .sort((left, right) => left.score - right.score)
}

router.post('/recommend', async (req, res) => {
  const apiKey = process.env.TOUR_API_KEY
  const {
    keyword = '',
    areaCode = '39',
    contentTypeId = '',
    numOfRows = 5,
    route = null,
  } = req.body || {}
  const limit = Math.min(Math.max(Number(numOfRows) || 5, 1), 12)
  const fallbackItems = rankRouteRecommendations(getMockLocations(keyword), route, keyword).slice(0, limit)

  if (!apiKey) {
    return res.json({ items: fallbackItems, isMock: true, source: 'mock-route-fallback' })
  }

  try {
    const routePoints = getRouteSamplePoints(route)
    let items = []

    if (routePoints.length) {
      const routeResults = await Promise.all(routePoints.map((point) => {
        const params = new URLSearchParams({
          serviceKey: apiKey,
          numOfRows: '20',
          pageNo: '1',
          MobileOS: 'ETC',
          MobileApp: 'FamilyTripKorea',
          _type: 'json',
          arrange: 'E',
          mapX: String(point.lng),
          mapY: String(point.lat),
          radius: '12000',
          ...(contentTypeId && { contentTypeId }),
        })
        return fetchTourItems('locationBasedList1', params)
      }))
      items = routeResults.flat()
    }

    if (!items.length) {
      const params = new URLSearchParams({
        serviceKey: apiKey,
        numOfRows: String(Math.max(limit, 10)),
        pageNo: '1',
        MobileOS: 'ETC',
        MobileApp: 'FamilyTripKorea',
        _type: 'json',
        ...(keyword && { keyword }),
        ...(areaCode && { areaCode }),
        ...(contentTypeId && { contentTypeId }),
      })
      items = await fetchTourItems(keyword ? 'searchKeyword1' : 'areaBasedList1', params)
    }

    const ranked = rankRouteRecommendations(uniqueByContentId(items), route, keyword).slice(0, limit)
    res.json({
      items: ranked.length ? ranked : fallbackItems,
      isMock: !ranked.length,
      source: ranked.length ? 'tourapi-location-route' : 'mock-route-fallback',
    })
  } catch (err) {
    console.error('TourAPI recommend error:', err.message)
    res.json({ items: fallbackItems, isMock: true, source: 'mock-route-fallback', error: err.message })
  }
})

router.get('/search', async (req, res) => {
  const apiKey = process.env.TOUR_API_KEY
  if (!apiKey) {
    return res.json({ items: getMockLocations(req.query.keyword), isMock: true })
  }

  const { keyword = '', areaCode = '', contentTypeId = '', numOfRows = '10', pageNo = '1' } = req.query
  try {
    const endpoint = keyword
      ? `${TOUR_API_BASE}/searchKeyword1`
      : `${TOUR_API_BASE}/areaBasedList1`

    const params = new URLSearchParams({
      serviceKey: apiKey,
      numOfRows,
      pageNo,
      MobileOS: 'ETC',
      MobileApp: 'FamilyTripKorea',
      _type: 'json',
      ...(keyword && { keyword }),
      ...(areaCode && { areaCode }),
      ...(contentTypeId && { contentTypeId }),
    })

    const response = await fetch(`${endpoint}?${params}`)
    const data = await response.json()
    const raw = data?.response?.body?.items?.item ?? []
    const items = Array.isArray(raw) ? raw.map(transformItem) : raw ? [transformItem(raw)] : []

    res.json({ items: items.length ? items : getMockLocations(keyword), isMock: !items.length })
  } catch (err) {
    console.error('TourAPI 검색 오류:', err.message)
    res.json({ items: getMockLocations(keyword), isMock: true, error: err.message })
  }
})

/** GET /api/tour/detail/:contentId */
router.get('/detail/:contentId', async (req, res) => {
  const apiKey = process.env.TOUR_API_KEY
  const { contentId } = req.params

  if (!apiKey) {
    return res.json({ detail: null, isMock: true })
  }

  try {
    const params = new URLSearchParams({
      serviceKey: apiKey,
      MobileOS: 'ETC',
      MobileApp: 'FamilyTripKorea',
      _type: 'json',
      contentId,
      defaultYN: 'Y',
      firstImageYN: 'Y',
      areacodeYN: 'Y',
      addrinfoYN: 'Y',
      mapinfoYN: 'Y',
      overviewYN: 'Y',
    })

    const response = await fetch(`${TOUR_API_BASE}/detailCommon1?${params}`)
    const data = await response.json()
    const item = data?.response?.body?.items?.item?.[0] ?? null
    res.json({ detail: item, isMock: false })
  } catch (err) {
    console.error('TourAPI 상세 오류:', err.message)
    res.json({ detail: null, isMock: true, error: err.message })
  }
})

const AREA_DATA = {
  '1':  { name: '서울', topAttractions: [{ name: '경복궁', visitors: 5200000, congestionLevel: 'very-high' }, { name: '남산서울타워', visitors: 4100000, congestionLevel: 'very-high' }, { name: '인사동', visitors: 3400000, congestionLevel: 'high' }, { name: '광장시장', visitors: 2900000, congestionLevel: 'high' }, { name: '북촌한옥마을', visitors: 2600000, congestionLevel: 'high' }], scale: 3.2 },
  '2':  { name: '인천', topAttractions: [{ name: '월미도', visitors: 2100000, congestionLevel: 'high' }, { name: '차이나타운', visitors: 1900000, congestionLevel: 'high' }, { name: '송도센트럴파크', visitors: 1600000, congestionLevel: 'medium' }, { name: '강화도', visitors: 1200000, congestionLevel: 'medium' }, { name: '을왕리해수욕장', visitors: 900000, congestionLevel: 'low' }], scale: 1.4 },
  '6':  { name: '부산', topAttractions: [{ name: '해운대해수욕장', visitors: 4800000, congestionLevel: 'very-high' }, { name: '광안리해수욕장', visitors: 3600000, congestionLevel: 'high' }, { name: '자갈치시장', visitors: 2900000, congestionLevel: 'high' }, { name: '감천문화마을', visitors: 2400000, congestionLevel: 'high' }, { name: '태종대', visitors: 1800000, congestionLevel: 'medium' }], scale: 2.1 },
  '4':  { name: '대구', topAttractions: [{ name: '동성로', visitors: 2200000, congestionLevel: 'high' }, { name: '서문시장', visitors: 1800000, congestionLevel: 'high' }, { name: '팔공산', visitors: 1500000, congestionLevel: 'medium' }, { name: '수성못', visitors: 1200000, congestionLevel: 'medium' }, { name: '김광석거리', visitors: 900000, congestionLevel: 'low' }], scale: 1.1 },
  '31': { name: '경기도', topAttractions: [{ name: '에버랜드', visitors: 6200000, congestionLevel: 'very-high' }, { name: '수원화성', visitors: 2800000, congestionLevel: 'high' }, { name: '한국민속촌', visitors: 2100000, congestionLevel: 'high' }, { name: '가평 자라섬', visitors: 1600000, congestionLevel: 'medium' }, { name: '양평 두물머리', visitors: 1300000, congestionLevel: 'medium' }], scale: 2.6 },
  '32': { name: '강원도', topAttractions: [{ name: '설악산국립공원', visitors: 3900000, congestionLevel: 'very-high' }, { name: '경포해수욕장', visitors: 3100000, congestionLevel: 'high' }, { name: '남이섬', visitors: 2600000, congestionLevel: 'high' }, { name: '정동진', visitors: 2000000, congestionLevel: 'medium' }, { name: '오대산', visitors: 1400000, congestionLevel: 'medium' }], scale: 1.7 },
  '37': { name: '경상북도', topAttractions: [{ name: '불국사', visitors: 2900000, congestionLevel: 'high' }, { name: '첨성대', visitors: 2400000, congestionLevel: 'high' }, { name: '안동 하회마을', visitors: 1900000, congestionLevel: 'medium' }, { name: '주왕산', visitors: 1300000, congestionLevel: 'medium' }, { name: '독도', visitors: 800000, congestionLevel: 'low' }], scale: 1.3 },
  '38': { name: '경상남도', topAttractions: [{ name: '통영 케이블카', visitors: 2100000, congestionLevel: 'high' }, { name: '남해 독일마을', visitors: 1600000, congestionLevel: 'medium' }, { name: '거제 해금강', visitors: 1400000, congestionLevel: 'medium' }, { name: '산청 지리산', visitors: 1100000, congestionLevel: 'medium' }, { name: '창녕 우포늪', visitors: 700000, congestionLevel: 'low' }], scale: 1.2 },
  '35': { name: '전라북도', topAttractions: [{ name: '전주 한옥마을', visitors: 3400000, congestionLevel: 'very-high' }, { name: '내장산', visitors: 2200000, congestionLevel: 'high' }, { name: '군산 근대문화유산', visitors: 1700000, congestionLevel: 'medium' }, { name: '변산반도', visitors: 1200000, congestionLevel: 'medium' }, { name: '임실 치즈마을', visitors: 800000, congestionLevel: 'low' }], scale: 1.1 },
  '36': { name: '전라남도', topAttractions: [{ name: '여수 밤바다', visitors: 3800000, congestionLevel: 'very-high' }, { name: '순천만국가정원', visitors: 3100000, congestionLevel: 'high' }, { name: '보성 녹차밭', visitors: 1900000, congestionLevel: 'medium' }, { name: '담양 죽녹원', visitors: 1600000, congestionLevel: 'medium' }, { name: '목포 근대역사문화공간', visitors: 1100000, congestionLevel: 'medium' }], scale: 1.6 },
  '39': { name: '제주특별자치도', topAttractions: [{ name: '성산일출봉', visitors: 3200000, congestionLevel: 'very-high' }, { name: '한라산국립공원', visitors: 2800000, congestionLevel: 'high' }, { name: '중문관광단지', visitors: 2100000, congestionLevel: 'high' }, { name: '함덕해수욕장', visitors: 1800000, congestionLevel: 'medium' }, { name: '동문시장', visitors: 1500000, congestionLevel: 'medium' }], scale: 1.0 },
}

const BASE_MONTHLY = [890,820,1050,1280,1450,1320,1680,1920,1380,1250,980,1100].map((d,i)=>({month:`${i+1}월`,d,f:Math.round(d*0.052)}))

/** GET /api/tour/stats?areaCode=39 — 방문객 통계 (mock) */
router.get('/stats', async (req, res) => {
  const { areaCode = '39' } = req.query
  const area = AREA_DATA[areaCode] || AREA_DATA['39']
  const scale = area.scale
  const monthlyVisitors = BASE_MONTHLY.map(({ month, d, f }) => ({
    month,
    domestic: Math.round(d * scale * 1000 * (0.9 + Math.random() * 0.2)),
    foreign: Math.round(f * scale * 1000 * (0.9 + Math.random() * 0.2)),
  }))
  res.json({
    areaCode,
    areaName: area.name,
    year: 2024,
    monthlyVisitors,
    topAttractions: area.topAttractions,
    hourlyPattern: [
      { hour: 6, congestion: 15 }, { hour: 7, congestion: 25 }, { hour: 8, congestion: 45 },
      { hour: 9, congestion: 72 }, { hour: 10, congestion: 88 }, { hour: 11, congestion: 95 },
      { hour: 12, congestion: 92 }, { hour: 13, congestion: 85 }, { hour: 14, congestion: 80 },
      { hour: 15, congestion: 78 }, { hour: 16, congestion: 70 }, { hour: 17, congestion: 55 },
      { hour: 18, congestion: 40 }, { hour: 19, congestion: 30 }, { hour: 20, congestion: 20 },
    ],
    isMock: true,
  })
})

export { router as tourRouter }

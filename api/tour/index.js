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

/** GET /api/tour/stats?areaCode=39 — 방문객 통계 (mock) */
router.get('/stats', async (req, res) => {
  const { areaCode = '39' } = req.query
  // TourAPI 통계 API는 별도 승인 필요 — 현재는 현실적인 mock 데이터 반환
  const mockStats = {
    areaCode,
    areaName: areaCode === '39' ? '제주특별자치도' : '전국',
    year: 2024,
    monthlyVisitors: [
      { month: '1월', domestic: 890000, foreign: 45000 },
      { month: '2월', domestic: 820000, foreign: 38000 },
      { month: '3월', domestic: 1050000, foreign: 62000 },
      { month: '4월', domestic: 1280000, foreign: 89000 },
      { month: '5월', domestic: 1450000, foreign: 112000 },
      { month: '6월', domestic: 1320000, foreign: 98000 },
      { month: '7월', domestic: 1680000, foreign: 135000 },
      { month: '8월', domestic: 1920000, foreign: 158000 },
      { month: '9월', domestic: 1380000, foreign: 105000 },
      { month: '10월', domestic: 1250000, foreign: 92000 },
      { month: '11월', domestic: 980000, foreign: 68000 },
      { month: '12월', domestic: 1100000, foreign: 75000 },
    ],
    topAttractions: [
      { name: '성산일출봉', visitors: 3200000, congestionLevel: 'very-high' },
      { name: '한라산국립공원', visitors: 2800000, congestionLevel: 'high' },
      { name: '중문관광단지', visitors: 2100000, congestionLevel: 'high' },
      { name: '함덕해수욕장', visitors: 1800000, congestionLevel: 'medium' },
      { name: '동문시장', visitors: 1500000, congestionLevel: 'medium' },
    ],
    hourlyPattern: [
      { hour: 6, congestion: 15 },
      { hour: 7, congestion: 25 },
      { hour: 8, congestion: 45 },
      { hour: 9, congestion: 72 },
      { hour: 10, congestion: 88 },
      { hour: 11, congestion: 95 },
      { hour: 12, congestion: 92 },
      { hour: 13, congestion: 85 },
      { hour: 14, congestion: 80 },
      { hour: 15, congestion: 78 },
      { hour: 16, congestion: 70 },
      { hour: 17, congestion: 55 },
      { hour: 18, congestion: 40 },
      { hour: 19, congestion: 30 },
      { hour: 20, congestion: 20 },
    ],
    isMock: true,
  }
  res.json(mockStats)
})

export { router as tourRouter }

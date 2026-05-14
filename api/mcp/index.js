import { Router } from 'express'

const router = Router()

// ---------------------------------------------------------------------------
// Tool definitions (MCP standard schema)
// ---------------------------------------------------------------------------

const TOOL_DEFINITIONS = [
  {
    name: 'plan_trip',
    description: '자연어로 여행 계획을 세워줍니다. 목적지·인원·기간을 포함한 문장을 입력하면 상세 일정을 생성합니다.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '여행 계획 요청 (예: "부부 2명 제주도 3박 4일 힐링 여행 계획 짜줘")',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'find_restaurants',
    description: '목적지의 음식점을 검색합니다. TourAPI 또는 큐레이션 데이터를 반환합니다.',
    inputSchema: {
      type: 'object',
      properties: {
        destination: { type: 'string', description: '검색할 목적지 (예: 제주도, 서울, 부산)' },
        cuisine: { type: 'string', description: '음식 종류 필터 (예: 한식, 해산물, 카페)' },
        priceRange: {
          type: 'string',
          enum: ['₩', '₩₩', '₩₩₩'],
          description: '가격대 필터',
        },
        count: { type: 'number', description: '반환할 음식점 수 (기본 5, 최대 10)' },
      },
      required: ['destination'],
    },
  },
  {
    name: 'get_weather_forecast',
    description: '한국 여행지의 7일 날씨 예보를 반환합니다. 계절·월에 따른 현실적인 예보를 제공합니다.',
    inputSchema: {
      type: 'object',
      properties: {
        destination: { type: 'string', description: '날씨를 확인할 목적지' },
        startDate: { type: 'string', description: '시작일 (YYYY-MM-DD, 기본 오늘)' },
        days: { type: 'number', description: '예보 일수 (기본 7, 최대 7)' },
      },
      required: ['destination'],
    },
  },
  {
    name: 'estimate_budget',
    description: '여행 예산을 카테고리별로 계산합니다.',
    inputSchema: {
      type: 'object',
      properties: {
        destination: { type: 'string', description: '목적지' },
        days: { type: 'number', description: '여행 일수 (체류 일수)' },
        travelers: { type: 'number', description: '여행자 수' },
        style: {
          type: 'string',
          enum: ['budget', 'mid', 'luxury'],
          description: '여행 스타일 (budget=저예산, mid=중간, luxury=고급)',
        },
      },
      required: ['destination', 'days', 'travelers', 'style'],
    },
  },
  {
    name: 'get_transport_options',
    description: '출발지에서 목적지까지의 교통 수단 옵션(항공, 버스, 기차 등)을 반환합니다.',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: '출발지 도시 (예: 서울, 부산)' },
        to: { type: 'string', description: '목적지 (예: 제주도, 경주)' },
      },
      required: ['from', 'to'],
    },
  },
  {
    name: 'check_accommodations',
    description: '목적지의 숙소 옵션을 검색합니다.',
    inputSchema: {
      type: 'object',
      properties: {
        destination: { type: 'string', description: '목적지' },
        checkIn: { type: 'string', description: '체크인 날짜 (YYYY-MM-DD)' },
        checkOut: { type: 'string', description: '체크아웃 날짜 (YYYY-MM-DD)' },
        guests: { type: 'number', description: '숙박 인원 수' },
        style: {
          type: 'string',
          enum: ['hostel', 'hotel', 'pension', 'resort'],
          description: '숙소 유형',
        },
      },
      required: ['destination', 'checkIn', 'checkOut', 'guests'],
    },
  },
]

// ---------------------------------------------------------------------------
// Curated mock data
// ---------------------------------------------------------------------------

const RESTAURANT_DATA = {
  제주: [
    { name: '고집돼지국밥', cuisine: '한식', priceRange: '₩', address: '제주시 구좌읍 종달로 65', coordinates: { lat: 33.5241, lng: 126.8762 }, recommendation: '현지인이 줄 서는 제주 돼지국밥 원조', rating: 4.7 },
    { name: '돈사돈 본점', cuisine: '흑돼지', priceRange: '₩₩', address: '서귀포시 색달중앙로 106', coordinates: { lat: 33.2543, lng: 126.4108 }, recommendation: '제주 흑돼지 전문, 겹살·목살 강추', rating: 4.8 },
    { name: '섭지코지 해녀의 집', cuisine: '해산물', priceRange: '₩₩', address: '서귀포시 성산읍 섭지코지로 107', coordinates: { lat: 33.4302, lng: 126.9280 }, recommendation: '해녀 직접 운영, 전복죽·성게국', rating: 4.6 },
    { name: '애월 해녀촌', cuisine: '해산물', priceRange: '₩₩₩', address: '제주시 애월읍 애월해안로 204', coordinates: { lat: 33.4637, lng: 126.3116 }, recommendation: '오션뷰, 성게미역국·전복구이 명물', rating: 4.5 },
    { name: '서귀포 올레시장 먹자골목', cuisine: '분식/길거리', priceRange: '₩', address: '서귀포시 매일올레시장로 22', coordinates: { lat: 33.2496, lng: 126.5601 }, recommendation: '고기국수, 빙떡, 오메기떡 집합소', rating: 4.4 },
    { name: '제주 흑돼지 거리 (연동)', cuisine: '흑돼지', priceRange: '₩₩', address: '제주시 연동 무근성7길', coordinates: { lat: 33.4996, lng: 126.5312 }, recommendation: '흑돼지 골목 원조 거리, 반드시 방문', rating: 4.7 },
    { name: '우도 땅콩해물라면 가게', cuisine: '라면/분식', priceRange: '₩', address: '제주시 우도면 우도해안길', coordinates: { lat: 33.5039, lng: 126.9517 }, recommendation: '우도 특산 땅콩 넣은 해물라면, 기념품 땅콩아이스크림 필수', rating: 4.3 },
  ],
  서울: [
    { name: '광장시장 육회비빔밥', cuisine: '한식', priceRange: '₩', address: '종로구 창경궁로 88 광장시장', coordinates: { lat: 37.5700, lng: 126.9997 }, recommendation: '광장시장 상징 메뉴, 줄 서도 먹을 가치', rating: 4.8 },
    { name: '명동교자 본점', cuisine: '한식 (칼국수)', priceRange: '₩', address: '중구 명동10길 29', coordinates: { lat: 37.5634, lng: 126.9849 }, recommendation: '70년 전통 칼국수 명가, 만두도 일품', rating: 4.7 },
    { name: '을지로 노가리 골목', cuisine: '포장마차', priceRange: '₩', address: '중구 을지로 105 일대', coordinates: { lat: 37.5663, lng: 126.9914 }, recommendation: '노가리·골뱅이 무침에 생맥주, 서울 야경 즐기며 한 잔', rating: 4.5 },
    { name: '진진 (중국 요리)', cuisine: '중식', priceRange: '₩₩₩', address: '마포구 월드컵북로1길 46', coordinates: { lat: 37.5629, lng: 126.9121 }, recommendation: '미쉐린 빕구르망, 가정식 중국 요리', rating: 4.6 },
    { name: '우래옥 (평양냉면)', cuisine: '한식', priceRange: '₩₩', address: '중구 창경궁로 62-29', coordinates: { lat: 37.5698, lng: 127.0054 }, recommendation: '1946년 개업 평양냉면의 성지, 오픈런 필수', rating: 4.8 },
  ],
  부산: [
    { name: '부산 자갈치시장 회센터', cuisine: '해산물', priceRange: '₩₩', address: '중구 자갈치해안로 52 자갈치시장', coordinates: { lat: 35.0968, lng: 129.0302 }, recommendation: '싱싱한 활어회 직접 골라 먹기, 1층 구입 2층 취식', rating: 4.6 },
    { name: '밀면 원조 내호냉면', cuisine: '한식 (밀면)', priceRange: '₩', address: '부산진구 가야대로 756', coordinates: { lat: 35.1570, lng: 128.9913 }, recommendation: '부산 밀면 원조, 70년 전통', rating: 4.7 },
    { name: '해운대 돼지국밥 거리', cuisine: '한식', priceRange: '₩', address: '해운대구 중2동 해운대로 일대', coordinates: { lat: 35.1605, lng: 129.1605 }, recommendation: '부산 돼지국밥 성지, 진한 국물 맛', rating: 4.5 },
    { name: '초량 이바구길 비빔당면', cuisine: '분식', priceRange: '₩', address: '동구 초량상로 일대', coordinates: { lat: 35.1112, lng: 129.0373 }, recommendation: '168계단 골목 옛 감성 + 비빔당면 명물', rating: 4.3 },
    { name: '구포 국수 거리', cuisine: '한식 (국수)', priceRange: '₩', address: '북구 구포1동 금곡대로 일대', coordinates: { lat: 35.2055, lng: 128.9990 }, recommendation: '구포 건강수산 등 국수 골목, 멸치 국물 진짜 맛', rating: 4.4 },
  ],
  경주: [
    { name: '황남빵 본점', cuisine: '제과', priceRange: '₩', address: '경주시 태종로 783 황남동', coordinates: { lat: 35.8347, lng: 129.2134 }, recommendation: '경주 대표 기념품 & 간식, 팥 앙금 진한 맛', rating: 4.7 },
    { name: '경주 쌈밥 정식집', cuisine: '한식', priceRange: '₩₩', address: '경주시 포석로 일대', coordinates: { lat: 35.8396, lng: 129.2204 }, recommendation: '경주식 갱시기(쌀죽) 포함 쌈밥 정식', rating: 4.4 },
    { name: '교동 갈비 골목', cuisine: '한식 (갈비)', priceRange: '₩₩₩', address: '경주시 교동 일대', coordinates: { lat: 35.8416, lng: 129.2096 }, recommendation: '30년 이상 전통 갈비집 집합, 경주 맛집 1순위', rating: 4.8 },
  ],
}

const ACCOMMODATION_DATA = {
  제주: {
    hostel: [
      { name: '제주 게스트하우스 우도', type: 'hostel', pricePerNight: 35000, address: '제주시 이도2동 일대', coordinates: { lat: 33.4985, lng: 126.5319 }, amenities: ['도미토리', '공용주방', '자전거 대여'], rating: 4.3 },
    ],
    hotel: [
      { name: '제주 그랜드 호텔', type: 'hotel', pricePerNight: 120000, address: '제주시 노연로 22', coordinates: { lat: 33.5054, lng: 126.5229 }, amenities: ['조식 포함', '수영장', '주차', '피트니스'], rating: 4.5 },
      { name: '베스트웨스턴 제주', type: 'hotel', pricePerNight: 95000, address: '제주시 연동 무근성7길 27', coordinates: { lat: 33.4927, lng: 126.5202 }, amenities: ['조식 옵션', '주차', '공항 셔틀'], rating: 4.2 },
    ],
    pension: [
      { name: '성산 씨사이드 펜션', type: 'pension', pricePerNight: 120000, address: '서귀포시 성산읍 해맞이해안로 2150', coordinates: { lat: 33.4601, lng: 126.9148 }, amenities: ['전용 바베큐', '오션뷰', '조식 포함', '주차'], rating: 4.7 },
      { name: '협재 해변 펜션', type: 'pension', pricePerNight: 100000, address: '제주시 한림읍 협재리 일대', coordinates: { lat: 33.3942, lng: 126.2394 }, amenities: ['해변 도보 2분', '개인 바베큐', '주차'], rating: 4.5 },
    ],
    resort: [
      { name: '롯데호텔 제주', type: 'resort', pricePerNight: 280000, address: '서귀포시 중문관광로72번길 35', coordinates: { lat: 33.2528, lng: 126.4104 }, amenities: ['수영장', '스파', '레스토랑 5곳', '골프장', '피트니스'], rating: 4.8 },
      { name: '신라호텔 제주', type: 'resort', pricePerNight: 320000, address: '서귀포시 색달중앙로 113', coordinates: { lat: 33.2491, lng: 126.4122 }, amenities: ['5성급', '인피니티풀', '스파', '다이닝'], rating: 4.9 },
    ],
  },
  서울: {
    hostel: [
      { name: '홍대 게스트하우스 코리아나', type: 'hostel', pricePerNight: 28000, address: '마포구 와우산로 일대', coordinates: { lat: 37.5515, lng: 126.9240 }, amenities: ['도미토리', '공용주방', '홍대 도보 5분'], rating: 4.2 },
    ],
    hotel: [
      { name: '명동 관광호텔', type: 'hotel', pricePerNight: 110000, address: '중구 명동길 80', coordinates: { lat: 37.5631, lng: 126.9848 }, amenities: ['조식 포함', '명동 중심', '지하철 도보 3분'], rating: 4.4 },
      { name: 'L7 홍대 바이 롯데', type: 'hotel', pricePerNight: 145000, address: '마포구 양화로 141', coordinates: { lat: 37.5546, lng: 126.9185 }, amenities: ['루프탑바', '조식 옵션', '피트니스', '홍대 도보 5분'], rating: 4.6 },
    ],
    pension: [],
    resort: [
      { name: '파크하얏트 서울', type: 'resort', pricePerNight: 480000, address: '강남구 테헤란로 606', coordinates: { lat: 37.5113, lng: 127.0602 }, amenities: ['미쉐린 레스토랑', '인피니티 풀', '스파', '야경 전망'], rating: 4.9 },
    ],
  },
  부산: {
    hostel: [
      { name: '해운대 비치 호스텔', type: 'hostel', pricePerNight: 30000, address: '해운대구 해운대해변로 일대', coordinates: { lat: 35.1587, lng: 129.1601 }, amenities: ['해변 도보 5분', '도미토리', '공용라운지'], rating: 4.1 },
    ],
    hotel: [
      { name: '해운대 그랜드 호텔', type: 'hotel', pricePerNight: 130000, address: '해운대구 해운대해변로 217', coordinates: { lat: 35.1594, lng: 129.1605 }, amenities: ['해운대 전망', '조식 포함', '주차', '수영장'], rating: 4.5 },
    ],
    pension: [
      { name: '기장 감성 펜션', type: 'pension', pricePerNight: 90000, address: '기장군 기장읍 일대', coordinates: { lat: 35.2448, lng: 129.2128 }, amenities: ['바다 전망', '개인 바베큐', '주차', '2인실'], rating: 4.4 },
    ],
    resort: [
      { name: '파라다이스호텔 부산', type: 'resort', pricePerNight: 260000, address: '해운대구 해운대해변로 296', coordinates: { lat: 35.1595, lng: 129.1644 }, amenities: ['카지노', '수영장', '스파', '오션뷰'], rating: 4.7 },
    ],
  },
}

const TRANSPORT_DATA = {
  '서울→제주': [
    { method: '항공', operator: '제주항공', duration: '1시간 5분', price: 65000, note: '김포-제주 편도 기준, 성수기 2배 이상', bookingUrl: 'https://www.jejuair.net' },
    { method: '항공', operator: '대한항공', duration: '1시간 5분', price: 95000, note: '김포-제주, 마일리지 사용 가능', bookingUrl: 'https://www.koreanair.com' },
    { method: '항공', operator: '아시아나항공', duration: '1시간 5분', price: 85000, note: '김포-제주 또는 인천-제주', bookingUrl: 'https://www.flyasiana.com' },
  ],
  '부산→제주': [
    { method: '항공', operator: '제주항공', duration: '55분', price: 55000, note: '김해-제주 편도, 서울보다 저렴', bookingUrl: 'https://www.jejuair.net' },
    { method: '여객선', operator: '씨스타크루즈', duration: '11시간', price: 38000, note: '부산-제주 야간 페리, 차량 동반 가능', bookingUrl: 'https://www.seastarcruise.co.kr' },
  ],
  '서울→부산': [
    { method: 'KTX', operator: '한국철도공사', duration: '2시간 30분', price: 59800, note: '서울역-부산역, 1일 수십 회 운행', bookingUrl: 'https://www.letskorail.com' },
    { method: '고속버스', operator: '동양고속', duration: '4시간 30분', price: 23900, note: '서울강남-부산 우등 기준', bookingUrl: 'https://www.kobus.co.kr' },
    { method: '항공', operator: '대한항공', duration: '1시간', price: 70000, note: '김포-김해, 이동 시간 포함 KTX와 비슷', bookingUrl: 'https://www.koreanair.com' },
  ],
  '서울→경주': [
    { method: 'KTX', operator: '한국철도공사', duration: '2시간 10분', price: 49400, note: '서울-신경주 KTX, 경주 시내 버스 환승', bookingUrl: 'https://www.letskorail.com' },
    { method: '고속버스', operator: '금호고속', duration: '4시간', price: 21700, note: '서울강남-경주 우등', bookingUrl: 'https://www.kobus.co.kr' },
  ],
  '서울→강릉': [
    { method: 'KTX', operator: '한국철도공사', duration: '1시간 50분', price: 27600, note: '청량리-강릉 KTX, 1일 다수 운행', bookingUrl: 'https://www.letskorail.com' },
    { method: '고속버스', operator: '동부고속', duration: '2시간 30분', price: 14800, note: '서울강남 출발 우등', bookingUrl: 'https://www.kobus.co.kr' },
  ],
}

// ---------------------------------------------------------------------------
// Weather generation helpers
// ---------------------------------------------------------------------------

function getSeasonalWeather(month, destination) {
  // 제주 날씨는 본토보다 따뜻
  const isJeju = destination.includes('제주')
  const tempOffset = isJeju ? 3 : 0

  const monthlyBase = {
    1:  { high: 5,  low: -2,  conditions: ['맑음', '구름 많음', '눈/비'], humidity: 55 },
    2:  { high: 7,  low: -1,  conditions: ['맑음', '구름 많음', '눈/비'], humidity: 55 },
    3:  { high: 13, low: 4,   conditions: ['맑음', '구름 많음', '봄비'], humidity: 58 },
    4:  { high: 19, low: 9,   conditions: ['맑음', '맑음', '구름 많음', '봄비'], humidity: 62 },
    5:  { high: 24, low: 14,  conditions: ['맑음', '맑음', '구름 많음'], humidity: 63 },
    6:  { high: 27, low: 19,  conditions: ['흐림', '비', '흐림', '맑음'], humidity: 76 },
    7:  { high: 30, low: 23,  conditions: ['소나기', '흐림', '비', '맑음'], humidity: 83 },
    8:  { high: 31, low: 24,  conditions: ['맑음', '소나기', '흐림', '맑음'], humidity: 79 },
    9:  { high: 27, low: 18,  conditions: ['맑음', '맑음', '구름 많음'], humidity: 68 },
    10: { high: 21, low: 11,  conditions: ['맑음', '맑음', '맑음', '구름 많음'], humidity: 60 },
    11: { high: 13, low: 4,   conditions: ['맑음', '구름 많음', '흐림'], humidity: 60 },
    12: { high: 7,  low: -1,  conditions: ['맑음', '구름 많음', '눈/비'], humidity: 58 },
  }

  return {
    ...monthlyBase[month] || monthlyBase[9],
    high: (monthlyBase[month]?.high ?? 20) + tempOffset,
    low: (monthlyBase[month]?.low ?? 10) + tempOffset,
  }
}

function generateWeatherTip(condition, highTemp) {
  if (condition.includes('비') || condition.includes('소나기')) return '우산 필수! 야외 일정은 오전에 집중하세요.'
  if (condition.includes('눈')) return '방한용품과 미끄럼 주의. 눈 쌓인 풍경은 덤!'
  if (highTemp >= 30) return '자외선 차단제 필수. 물 자주 마시고 낮 12-2시 야외 활동 주의.'
  if (highTemp >= 25) return '여름 옷차림, 선크림 챙기세요. 저녁은 살짝 쌀쌀할 수 있어요.'
  if (highTemp >= 15) return '겉옷 하나 챙기면 완벽. 야외 활동하기 최적의 날씨!'
  if (highTemp >= 5) return '따뜻하게 입고 핫초코 한 잔의 여유를. 방풍 재킷 추천.'
  return '두꺼운 패딩과 장갑 필수. 실내 관광지 중심으로 일정을 짜세요.'
}

// ---------------------------------------------------------------------------
// Tool implementations
// ---------------------------------------------------------------------------

async function executePlanTrip(args) {
  const { query } = args
  if (!query?.trim()) throw new Error('query는 필수입니다.')

  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    // Mock fallback - Jeju 3-day trip
    return {
      summary: { destination: '제주도', days: 3, travelers: '여행자', theme: '힐링·자연' },
      isMock: true,
      note: 'OpenAI API 키가 없어 제주도 3박 4일 샘플 일정을 반환합니다.',
    }
  }

  const { OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey })

  const systemPrompt = `당신은 한국 여행 전문 플래너입니다. 사용자의 여행 요청을 분석해 JSON 일정을 생성하세요.
반드시 JSON만 반환하고, 구조: { summary, budget, days, restaurants, tips }`

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 4096,
  })

  const raw = response.choices?.[0]?.message?.content
  if (!raw) throw new Error('OpenAI 응답이 비어 있습니다.')
  return JSON.parse(raw)
}

async function executeFindRestaurants(args) {
  const { destination, cuisine, priceRange, count = 5 } = args
  const limit = Math.min(Math.max(Number(count) || 5, 1), 10)

  // Normalize destination key
  const destKey = Object.keys(RESTAURANT_DATA).find((k) => destination.includes(k)) || null

  if (!destKey) {
    // Try TourAPI if key available
    const apiKey = process.env.TOUR_API_KEY
    if (apiKey) {
      try {
        const areaCodeMap = { 서울: '1', 부산: '6', 대구: '4', 인천: '2', 광주: '5', 대전: '3', 울산: '7', 제주: '39', 경주: '35' }
        const areaCode = Object.entries(areaCodeMap).find(([city]) => destination.includes(city))?.[1] || ''
        const params = new URLSearchParams({
          serviceKey: apiKey, numOfRows: String(limit), pageNo: '1',
          MobileOS: 'ETC', MobileApp: 'TripPlanner', _type: 'json',
          contentTypeId: '39', ...(areaCode && { areaCode }),
        })
        const resp = await fetch(`https://apis.data.go.kr/B551011/KorService1/areaBasedList1?${params}`)
        const data = await resp.json()
        const raw = data?.response?.body?.items?.item ?? []
        const list = Array.isArray(raw) ? raw : raw ? [raw] : []
        if (list.length) return list.slice(0, limit).map((item) => ({
          name: item.title,
          cuisine: '한식',
          priceRange: '₩₩',
          address: `${item.addr1 || ''}`.trim(),
          coordinates: { lat: parseFloat(item.mapy) || 0, lng: parseFloat(item.mapx) || 0 },
          recommendation: '한국관광공사 등록 음식점',
        }))
      } catch { /* fall through to mock */ }
    }
    return [{ note: `${destination} 음식점 데이터가 없습니다. 제주·서울·부산·경주 지원.` }]
  }

  let results = [...RESTAURANT_DATA[destKey]]
  if (cuisine) results = results.filter((r) => r.cuisine.includes(cuisine) || cuisine.includes(r.cuisine))
  if (priceRange) results = results.filter((r) => r.priceRange === priceRange)
  return results.slice(0, limit)
}

function executeGetWeatherForecast(args) {
  const { destination, startDate, days = 7 } = args
  const numDays = Math.min(Math.max(Number(days) || 7, 1), 7)
  const start = startDate ? new Date(startDate) : new Date()
  if (isNaN(start.getTime())) throw new Error(`유효하지 않은 날짜: ${startDate}`)

  const forecasts = []
  for (let i = 0; i < numDays; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    const month = date.getMonth() + 1
    const base = getSeasonalWeather(month, destination)
    const conditionIdx = Math.floor(Math.random() * base.conditions.length)
    const condition = base.conditions[conditionIdx]
    const variance = Math.floor(Math.random() * 5) - 2 // ±2도 변동
    const high = base.high + variance
    const low = base.low + Math.floor(variance / 2)

    forecasts.push({
      date: date.toISOString().split('T')[0],
      condition,
      highTemp: high,
      lowTemp: low,
      humidity: base.humidity + Math.floor(Math.random() * 10) - 5,
      tip: generateWeatherTip(condition, high),
    })
  }

  return { destination, forecasts }
}

function executeEstimateBudget(args) {
  const { destination, days, travelers, style } = args
  const numDays = Number(days)
  const numTravelers = Number(travelers)

  if (!numDays || numDays < 1) throw new Error('days는 1 이상의 숫자여야 합니다.')
  if (!numTravelers || numTravelers < 1) throw new Error('travelers는 1 이상의 숫자여야 합니다.')

  // 기준 1인 1일 비용 (원)
  const styleMultiplier = { budget: 1, mid: 2.2, luxury: 5 }[style] || 2.2

  const isJeju = destination.includes('제주')
  const isSeoul = destination.includes('서울')
  const baseAccom = isJeju ? 40000 : isSeoul ? 50000 : 35000
  const baseFood = isJeju ? 30000 : isSeoul ? 35000 : 28000
  const baseTransport = isJeju ? 20000 : isSeoul ? 12000 : 18000
  const baseEntry = 8000
  const baseShopping = 15000

  const perPersonPerDay = {
    숙박: Math.round(baseAccom * styleMultiplier),
    식비: Math.round(baseFood * styleMultiplier),
    교통: Math.round(baseTransport * (style === 'budget' ? 1 : style === 'luxury' ? 1.5 : 1.2)),
    입장료: Math.round(baseEntry * (style === 'luxury' ? 1.5 : 1)),
    '쇼핑/기타': Math.round(baseShopping * styleMultiplier),
  }

  const totalPerPersonPerDay = Object.values(perPersonPerDay).reduce((a, b) => a + b, 0)
  const totalPerPerson = totalPerPersonPerDay * numDays
  const total = totalPerPerson * numTravelers

  // 항공/교통비 (목적지 도착 비용) 별도 추가
  let transportToDestination = 0
  if (isJeju) transportToDestination = style === 'budget' ? 55000 : style === 'luxury' ? 150000 : 80000
  else if (destination.includes('부산') || destination.includes('경주')) transportToDestination = style === 'budget' ? 23000 : style === 'luxury' ? 70000 : 45000

  return {
    destination,
    days: numDays,
    travelers: numTravelers,
    style,
    perPersonPerDay,
    perPersonTotal: totalPerPerson + transportToDestination,
    grandTotal: (totalPerPerson + transportToDestination) * numTravelers,
    transportToDestination: transportToDestination * numTravelers,
    breakdown: {
      숙박: perPersonPerDay['숙박'] * numDays * numTravelers,
      식비: perPersonPerDay['식비'] * numDays * numTravelers,
      현지교통: perPersonPerDay['교통'] * numDays * numTravelers,
      입장료: perPersonPerDay['입장료'] * numDays * numTravelers,
      '쇼핑/기타': perPersonPerDay['쇼핑/기타'] * numDays * numTravelers,
      '왕복 교통비': transportToDestination * numTravelers,
    },
    note: `${style === 'budget' ? '저예산' : style === 'luxury' ? '고급' : '중간'} 스타일 기준 추정치입니다. 성수기에는 숙박비가 1.5~2배 높아질 수 있습니다.`,
  }
}

function executeGetTransportOptions(args) {
  const { from, to } = args

  // Normalize key: try both directions
  const key1 = `${from}→${to}`
  const key2 = `${to}→${from}`
  const destNorm = (s) => {
    if (!s) return ''
    if (s.includes('제주')) return '제주'
    if (s.includes('부산')) return '부산'
    if (s.includes('서울') || s.includes('Seoul')) return '서울'
    if (s.includes('경주')) return '경주'
    if (s.includes('강릉')) return '강릉'
    if (s.includes('대구')) return '대구'
    return s
  }
  const normKey = `${destNorm(from)}→${destNorm(to)}`
  const normKeyRev = `${destNorm(to)}→${destNorm(from)}`

  const found = TRANSPORT_DATA[key1] || TRANSPORT_DATA[key2] || TRANSPORT_DATA[normKey] || TRANSPORT_DATA[normKeyRev]

  if (found) return { from, to, options: found }

  // Generic fallback
  return {
    from,
    to,
    options: [
      { method: '항공', operator: '국내 항공사', duration: '1시간 내외', price: 70000, note: '각 항공사 홈페이지에서 검색하세요.' },
      { method: 'KTX', operator: '한국철도공사', duration: '2-4시간', price: 35000, note: 'letskorail.com에서 예매하세요.' },
      { method: '고속버스', operator: '고속버스 통합예매', duration: '3-5시간', price: 18000, note: 'kobus.co.kr에서 예매하세요.' },
    ],
    note: '해당 노선 상세 데이터가 없습니다. 실제 가격 및 시간은 예매 사이트에서 확인하세요.',
  }
}

function executeCheckAccommodations(args) {
  const { destination, checkIn, checkOut, guests, style } = args

  const ci = new Date(checkIn)
  const co = new Date(checkOut)
  if (isNaN(ci.getTime()) || isNaN(co.getTime())) throw new Error('날짜 형식이 올바르지 않습니다 (YYYY-MM-DD).')
  const nights = Math.max(1, Math.round((co - ci) / (1000 * 60 * 60 * 24)))

  const destKey = Object.keys(ACCOMMODATION_DATA).find((k) => destination.includes(k)) || null
  if (!destKey) {
    return {
      destination,
      checkIn,
      checkOut,
      nights,
      guests,
      accommodations: [],
      note: `${destination} 숙소 데이터가 없습니다. 제주·서울·부산 지원.`,
    }
  }

  const allByDest = ACCOMMODATION_DATA[destKey]
  let pool = []
  if (style) {
    pool = allByDest[style] || []
  } else {
    pool = Object.values(allByDest).flat()
  }

  // 인원 필터 (간단히: hostel은 1-4인, pension은 2-6인, etc.)
  const numGuests = Number(guests) || 2

  const result = pool.map((acc) => ({
    ...acc,
    checkIn,
    checkOut,
    nights,
    guests: numGuests,
    totalPrice: acc.pricePerNight * nights,
    available: true,
  }))

  return {
    destination,
    checkIn,
    checkOut,
    nights,
    guests: numGuests,
    accommodations: result,
  }
}

// ---------------------------------------------------------------------------
// Router handlers
// ---------------------------------------------------------------------------

/** GET /api/mcp/tools */
router.get('/tools', (req, res) => {
  res.json({ tools: TOOL_DEFINITIONS })
})

/** POST /api/mcp/execute */
router.post('/execute', async (req, res) => {
  const { tool, args = {} } = req.body

  if (!tool) {
    return res.status(400).json({ success: false, error: 'tool 이름이 필요합니다.' })
  }

  const validTools = TOOL_DEFINITIONS.map((t) => t.name)
  if (!validTools.includes(tool)) {
    return res.status(404).json({
      success: false,
      error: `알 수 없는 tool: "${tool}". 사용 가능한 tool: ${validTools.join(', ')}`,
    })
  }

  try {
    let result
    switch (tool) {
      case 'plan_trip':
        result = await executePlanTrip(args)
        break
      case 'find_restaurants':
        result = await executeFindRestaurants(args)
        break
      case 'get_weather_forecast':
        result = executeGetWeatherForecast(args)
        break
      case 'estimate_budget':
        result = executeEstimateBudget(args)
        break
      case 'get_transport_options':
        result = executeGetTransportOptions(args)
        break
      case 'check_accommodations':
        result = executeCheckAccommodations(args)
        break
      default:
        throw new Error(`구현되지 않은 tool: ${tool}`)
    }

    res.json({ result, tool, success: true })
  } catch (err) {
    console.error(`MCP tool "${tool}" 실행 오류:`, err)
    res.status(500).json({
      success: false,
      tool,
      error: err.message || 'Tool 실행 중 오류가 발생했습니다.',
    })
  }
})

export { router as mcpRouter }

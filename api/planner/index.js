import { Router } from 'express'

const router = Router()

const SYSTEM_PROMPT = `당신은 한국 여행 전문 플래너 AI입니다.
사용자의 자연어 여행 요청을 분석하여 상세한 여행 일정을 JSON 형식으로 생성합니다.

## 분석할 내용
- 누가 (여행자/그룹 유형): 부부, 가족, 친구, 혼자 등
- 며칠 (박/일 수)
- 어디 (목적지)
- 테마/취향 (힐링, 액티비티, 음식, 문화 등 - 명시 없으면 종합 추천)

## 생성 규칙
1. 하루를 오전(09:00-12:00) / 오후(13:00-17:00) / 저녁(18:00-21:00) 3개 슬롯으로 구성
2. 각 날 관광지 2-3곳, 음식점 1-2곳, 숙소 1곳을 slots 배열에 포함
3. 각 장소에 실제 좌표(lat/lng)를 포함 (한국 주요 관광지 기반)
4. 예산은 1인 기준과 전체 기준으로 산출, 카테고리별 세분화
5. 교통 팁, 여행 팁을 현실적으로 제공
6. 응답은 반드시 아래 JSON 구조만 반환 (마크다운, 설명 텍스트 없이)

## 응답 JSON 구조
{
  "summary": {
    "destination": "목적지명",
    "days": 숫자(박수),
    "nights": 숫자(일수 = days+1 아님, 실제 체류일수),
    "travelers": "여행자 설명",
    "theme": "여행 테마"
  },
  "budget": {
    "perPerson": 숫자(원),
    "total": 숫자(원),
    "breakdown": {
      "숙박": 숫자,
      "식비": 숫자,
      "교통": 숫자,
      "입장료": 숫자,
      "쇼핑/기타": 숫자
    }
  },
  "days": [
    {
      "dayNumber": 1,
      "title": "1일차 - 부제목",
      "slots": [
        {
          "time": "09:00",
          "type": "attraction|restaurant|accommodation|transport",
          "name": "장소명",
          "address": "주소",
          "coordinates": { "lat": 숫자, "lng": 숫자 },
          "duration": "소요시간",
          "tip": "방문 팁",
          "cost": 숫자(원, 0이면 무료)
        }
      ]
    }
  ],
  "restaurants": [
    {
      "name": "식당명",
      "cuisine": "음식 종류",
      "priceRange": "₩|₩₩|₩₩₩",
      "address": "주소",
      "coordinates": { "lat": 숫자, "lng": 숫자 },
      "recommendation": "추천 이유"
    }
  ],
  "tips": ["팁1", "팁2", "..."]
}`

/** Mock 제주도 3박 4일 여행 일정 */
function getMockJejuItinerary(travelers = '부부 2명', days = 3) {
  const totalBudgetPerPerson = 420000
  const numPeople = travelers.includes('혼자') ? 1 : travelers.match(/\d+/) ? parseInt(travelers.match(/\d+/)[0]) : 2

  return {
    summary: {
      destination: '제주도',
      days,
      nights: days + 1,
      travelers,
      theme: '힐링·자연·미식',
    },
    budget: {
      perPerson: totalBudgetPerPerson,
      total: totalBudgetPerPerson * numPeople,
      breakdown: {
        숙박: 180000,
        식비: 120000,
        교통: 70000,
        입장료: 30000,
        '쇼핑/기타': 20000,
      },
    },
    days: [
      {
        dayNumber: 1,
        title: '1일차 - 동부 탐방 & 성산',
        slots: [
          {
            time: '09:00',
            type: 'attraction',
            name: '성산일출봉',
            address: '제주특별자치도 서귀포시 성산읍 일출로 284-12',
            coordinates: { lat: 33.4588, lng: 126.9425 },
            duration: '2시간',
            tip: '오전 일찍 방문해야 인파를 피할 수 있어요. 정상까지 20분 등반.',
            cost: 5000,
          },
          {
            time: '11:30',
            type: 'restaurant',
            name: '섭지코지 해녀의 집',
            address: '제주특별자치도 서귀포시 성산읍 섭지코지로 107',
            coordinates: { lat: 33.4302, lng: 126.9280 },
            duration: '1시간',
            tip: '해녀가 직접 잡은 해산물 뷔페. 전복죽·성게국 꼭 드세요.',
            cost: 25000,
          },
          {
            time: '13:30',
            type: 'attraction',
            name: '섭지코지',
            address: '제주특별자치도 서귀포시 성산읍 섭지코지로 137',
            coordinates: { lat: 33.4248, lng: 126.9319 },
            duration: '1시간 30분',
            tip: '드라마 "올인" 촬영지. 에메랄드빛 바다와 등대가 압권.',
            cost: 0,
          },
          {
            time: '15:30',
            type: 'attraction',
            name: '우도',
            address: '제주특별자치도 제주시 우도면',
            coordinates: { lat: 33.5039, lng: 126.9517 },
            duration: '3시간',
            tip: '성산항에서 배편 15분. 우도 땅콩아이스크림 필수.',
            cost: 9900,
          },
          {
            time: '19:00',
            type: 'restaurant',
            name: '고집돼지국밥',
            address: '제주특별자치도 제주시 구좌읍 종달로 65',
            coordinates: { lat: 33.5241, lng: 126.8762 },
            duration: '1시간',
            tip: '제주 돼지국밥의 진수. 현지인 맛집.',
            cost: 10000,
          },
          {
            time: '21:00',
            type: 'accommodation',
            name: '성산 씨사이드 펜션',
            address: '제주특별자치도 서귀포시 성산읍 해맞이해안로 2150',
            coordinates: { lat: 33.4601, lng: 126.9148 },
            duration: '숙박',
            tip: '성산일출봉 전망. 조식 포함. 주차 무료.',
            cost: 120000,
          },
        ],
      },
      {
        dayNumber: 2,
        title: '2일차 - 한라산 & 중문',
        slots: [
          {
            time: '07:00',
            type: 'attraction',
            name: '한라산국립공원 (영실코스)',
            address: '제주특별자치도 서귀포시 색달동',
            coordinates: { lat: 33.3617, lng: 126.5292 },
            duration: '4시간',
            tip: '영실코스 편도 3.7km, 왕복 3-4시간. 등산화 필수. 오전 7시 전 입산 권장.',
            cost: 0,
          },
          {
            time: '12:00',
            type: 'restaurant',
            name: '돈사돈 본점',
            address: '제주특별자치도 서귀포시 색달중앙로 106',
            coordinates: { lat: 33.2543, lng: 126.4108 },
            duration: '1시간 30분',
            tip: '제주 흑돼지 전문점. 겹살·목살 추천. 예약 필수.',
            cost: 20000,
          },
          {
            time: '14:00',
            type: 'attraction',
            name: '중문관광단지 (천제연폭포)',
            address: '제주특별자치도 서귀포시 천제연로 132',
            coordinates: { lat: 33.2491, lng: 126.4122 },
            duration: '1시간 30분',
            tip: '3단 폭포 중 1단이 가장 장관. 다리 위 야경도 유명.',
            cost: 2500,
          },
          {
            time: '16:00',
            type: 'attraction',
            name: '주상절리대',
            address: '제주특별자치도 서귀포시 이어도로 36-24',
            coordinates: { lat: 33.2416, lng: 126.4228 },
            duration: '1시간',
            tip: '용암이 굳어 만든 기둥 절경. 일몰 시간대 방문 추천.',
            cost: 2000,
          },
          {
            time: '18:30',
            type: 'restaurant',
            name: '서귀포 올레시장 먹자골목',
            address: '제주특별자치도 서귀포시 매일올레시장로 22',
            coordinates: { lat: 33.2496, lng: 126.5601 },
            duration: '1시간 30분',
            tip: '고기국수, 빙떡, 오메기떡 등 제주 길거리 음식 총집합.',
            cost: 15000,
          },
          {
            time: '21:00',
            type: 'accommodation',
            name: '롯데호텔 제주',
            address: '제주특별자치도 서귀포시 중문관광로72번길 35',
            coordinates: { lat: 33.2528, lng: 126.4104 },
            duration: '숙박',
            tip: '중문단지 내 최고급 리조트. 수영장·스파 포함.',
            cost: 250000,
          },
        ],
      },
      {
        dayNumber: 3,
        title: '3일차 - 서부 & 애월',
        slots: [
          {
            time: '09:00',
            type: 'attraction',
            name: '협재해수욕장',
            address: '제주특별자치도 제주시 한림읍 협재리',
            coordinates: { lat: 33.3942, lng: 126.2394 },
            duration: '1시간 30분',
            tip: '제주 서쪽 최고 해변. 에메랄드 빛 바다와 흰 모래사장.',
            cost: 0,
          },
          {
            time: '11:00',
            type: 'attraction',
            name: '한림공원 (협재동굴)',
            address: '제주특별자치도 제주시 한림읍 한림로 300',
            coordinates: { lat: 33.3995, lng: 126.2456 },
            duration: '1시간 30분',
            tip: '쌍용동굴·협재동굴 동시 관람. 열대식물원도 볼거리.',
            cost: 14000,
          },
          {
            time: '13:00',
            type: 'restaurant',
            name: '애월 해녀촌',
            address: '제주특별자치도 제주시 애월읍 애월해안로 204',
            coordinates: { lat: 33.4637, lng: 126.3116 },
            duration: '1시간',
            tip: '애월 바다 앞 해산물 전문. 성게미역국·전복구이 추천.',
            cost: 30000,
          },
          {
            time: '14:30',
            type: 'attraction',
            name: '애월해안도로 카페거리',
            address: '제주특별자치도 제주시 애월읍 애월리',
            coordinates: { lat: 33.4681, lng: 126.3078 },
            duration: '2시간',
            tip: '오션뷰 카페 밀집지역. 인스타 핫플. 하귀-애월 해안도로 드라이브.',
            cost: 8000,
          },
          {
            time: '17:00',
            type: 'attraction',
            name: '이호테우해변 (목마 등대)',
            address: '제주특별자치도 제주시 이호일동 1691',
            coordinates: { lat: 33.4968, lng: 126.4436 },
            duration: '1시간',
            tip: '빨강·하양 목마 등대로 유명한 일몰 명소. 공항 근처라 마지막 코스로 적합.',
            cost: 0,
          },
          {
            time: '19:00',
            type: 'restaurant',
            name: '제주 흑돼지 거리 (연동)',
            address: '제주특별자치도 제주시 연동 무근성7길',
            coordinates: { lat: 33.4996, lng: 126.5312 },
            duration: '1시간 30분',
            tip: '제주 흑돼지 골목의 원조. 마지막 날 저녁 특식으로 제격.',
            cost: 20000,
          },
        ],
      },
    ],
    restaurants: [
      {
        name: '고집돼지국밥',
        cuisine: '한식 (돼지국밥)',
        priceRange: '₩',
        address: '제주특별자치도 제주시 구좌읍 종달로 65',
        coordinates: { lat: 33.5241, lng: 126.8762 },
        recommendation: '현지인이 줄 서는 제주 돼지국밥 1순위',
      },
      {
        name: '돈사돈 본점',
        cuisine: '한식 (흑돼지)',
        priceRange: '₩₩',
        address: '제주특별자치도 서귀포시 색달중앙로 106',
        coordinates: { lat: 33.2543, lng: 126.4108 },
        recommendation: '제주 흑돼지 전문점, 마블링 좋은 겹살 추천',
      },
      {
        name: '섭지코지 해녀의 집',
        cuisine: '해산물',
        priceRange: '₩₩',
        address: '제주특별자치도 서귀포시 성산읍 섭지코지로 107',
        coordinates: { lat: 33.4302, lng: 126.9280 },
        recommendation: '현직 해녀가 운영, 전복죽·성게국 최고',
      },
      {
        name: '애월 해녀촌',
        cuisine: '해산물',
        priceRange: '₩₩₩',
        address: '제주특별자치도 제주시 애월읍 애월해안로 204',
        coordinates: { lat: 33.4637, lng: 126.3116 },
        recommendation: '오션뷰에서 즐기는 성게미역국과 전복구이',
      },
    ],
    tips: [
      '렌터카 필수 — 대중교통은 불편합니다. 공항 인근 렌터카 센터 이용.',
      '성수기(7-8월, 추석·설 연휴) 숙소는 2-3달 전 예약 필수.',
      '한라산 영실·어리목코스는 기상에 따라 탐방 제한이 있으니 전날 확인하세요.',
      '제주 올레길 스탬프 투어도 병행하면 더 풍성한 여행이 됩니다.',
      '동문시장·서귀포올레시장에서 오메기떡, 빙떡 꼭 드세요.',
      '전기차 렌터카 이용 시 제주 전역 충전소가 잘 갖춰져 있어요.',
    ],
  }
}

/**
 * POST /api/planner
 * body: { query, travelers?, days?, destination? }
 */
router.post('/', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  const model = process.env.OPENAI_MODEL || 'gpt-4o'
  const { query, travelers, days, destination } = req.body

  if (!query?.trim() && !destination) {
    return res.status(400).json({ error: '여행 계획 요청(query)이 필요합니다.' })
  }

  // API 키 없으면 mock 반환
  if (!apiKey) {
    const mockTravelers = travelers || '부부 2명'
    const mockDays = days || 3
    const mockDest = destination || '제주도'

    const isMockJeju = mockDest.includes('제주')
    const mockData = isMockJeju
      ? getMockJejuItinerary(mockTravelers, mockDays)
      : getMockJejuItinerary(mockTravelers, mockDays)

    return res.json({ itinerary: mockData, isMock: true })
  }

  try {
    // Build user message combining query with optional overrides
    let userMessage = query?.trim() || ''
    if (travelers || days || destination) {
      const overrides = []
      if (travelers) overrides.push(`여행자: ${travelers}`)
      if (days) overrides.push(`여행 기간: ${days}박`)
      if (destination) overrides.push(`목적지: ${destination}`)
      if (overrides.length) {
        userMessage += `\n\n[추가 조건: ${overrides.join(', ')}]`
      }
    }

    const { OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey })

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4096,
    })

    const raw = response.choices?.[0]?.message?.content
    if (!raw) throw new Error('OpenAI 응답이 비어 있습니다.')

    let itinerary
    try {
      itinerary = JSON.parse(raw)
    } catch {
      throw new Error('OpenAI 응답을 JSON으로 파싱할 수 없습니다.')
    }

    res.json({ itinerary, isMock: false })
  } catch (err) {
    console.error('Planner API 오류:', err)
    // 오류 시 mock fallback
    const fallback = getMockJejuItinerary(travelers || '여행자', days || 3)
    res.json({ itinerary: fallback, isMock: true, error: err.message })
  }
})

export { router as plannerRouter }

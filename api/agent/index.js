import { Router } from 'express'
import OpenAI from 'openai'

const router = Router()
const MAX_HISTORY_MESSAGES = 20
const KNOWN_MAP_LOCATIONS = [
  { aliases: ['성산일출봉', '성산'], title: '성산일출봉', lat: 33.4588, lng: 126.9425, zoom: 13 },
  { aliases: ['중문관광단지', '중문'], title: '중문관광단지', lat: 33.2491, lng: 126.4122, zoom: 13 },
  { aliases: ['함덕해수욕장', '함덕'], title: '함덕해수욕장', lat: 33.5432, lng: 126.6698, zoom: 13 },
  { aliases: ['동문시장', '동문'], title: '동문시장', lat: 33.5135, lng: 126.5248, zoom: 14 },
  { aliases: ['한라산국립공원', '한라산'], title: '한라산국립공원', lat: 33.3617, lng: 126.5292, zoom: 12 },
]

/** GPT가 호출할 수 있는 Google 지도 조작 도구 함수 정의 */
const MAP_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'searchAndMarkLocations',
      description: '키워드로 여행지를 검색하고 Google 지도에 추천 마커를 표시합니다.',
      parameters: {
        type: 'object',
        properties: {
          keyword: { type: 'string', description: '검색할 키워드 (예: 카페, 해수욕장)' },
          areaCode: { type: 'string', description: 'TourAPI 지역 코드 (제주=39, 서울=1, 부산=6)' },
          contentTypeId: { type: 'string', description: '콘텐츠 유형 (12=관광지, 39=음식점, 32=숙박)' },
          maxCount: { type: 'number', description: '최대 결과 수 (기본 5)' },
        },
        required: ['keyword'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'setMapCenter',
      description: 'Google 지도 중심을 특정 좌표로 이동합니다.',
      parameters: {
        type: 'object',
        properties: {
          lat: { type: 'number', description: '위도' },
          lng: { type: 'number', description: '경도' },
          level: { type: 'number', description: '줌 레벨 (1=최대확대, 14=최소확대, 기본 8)' },
        },
        required: ['lat', 'lng'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'showCongestionHeatmap',
      description: 'Google 지도 교통 레이어를 표시해 혼잡도를 확인합니다.',
      parameters: {
        type: 'object',
        properties: {
          hour: { type: 'number', description: '시간 (0-23)' },
          visible: { type: 'boolean', description: '히트맵 표시 여부' },
        },
        required: ['hour'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'buildOptimalRoute',
      description: '출발지에서 선호도 기반 최적 여행 동선을 추천합니다.',
      parameters: {
        type: 'object',
        properties: {
          startLat: { type: 'number', description: '출발 위도' },
          startLng: { type: 'number', description: '출발 경도' },
          preferences: {
            type: 'array',
            items: { type: 'string' },
            description: '선호 카테고리 목록 (예: ["자연", "음식", "문화"])',
          },
          availableHours: { type: 'number', description: '가용 시간 (시간 단위)' },
          avoidCongestion: { type: 'boolean', description: '혼잡 회피 여부' },
        },
        required: ['startLat', 'startLng'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'filterByCategory',
      description: '지도에 표시된 마커를 카테고리로 필터링합니다.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['all', 'activity', 'meal', 'stay', 'logistics'],
            description: '필터할 카테고리',
          },
        },
        required: ['category'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'clearMarkers',
      description: '지도에서 모든 검색 마커를 지웁니다.',
      parameters: { type: 'object', properties: {} },
    },
  },
]

const SYSTEM_PROMPT = `당신은 한국 가족여행 지휘센터의 AI 에이전트입니다.
사용자의 자연어 명령을 분석하고 Google 지도를 원격 조정하는 함수를 호출하세요.

현재 여행 정보:
- 여행지: 제주도
- 베이스캠프: 제주시 연동 (위도 33.4996, 경도 126.5312)
- 주요 장소: 성산일출봉, 중문관광단지, 함덕해수욕장, 동문시장

주요 좌표:
- 성산일출봉: 위도 33.4588, 경도 126.9425
- 중문관광단지: 위도 33.2491, 경도 126.4122
- 함덕해수욕장: 위도 33.5432, 경도 126.6698
- 동문시장: 위도 33.5135, 경도 126.5248
- 한라산국립공원: 위도 33.3617, 경도 126.5292

TourAPI 지역 코드:
- 제주: 39, 서울: 1, 부산: 6, 대구: 4

여행지 추천, 음식점 추천, 숙소 추천, 지도 이동, 교통 확인 요청에는 가능한 한 tool_calls를 사용하세요.
검색형 추천은 searchAndMarkLocations를 우선 사용하고, 제주 요청에는 areaCode "39"를 넣으세요.
특정 장소로 "이동", "보여줘", "확대", "센터" 요청을 받으면 검색 대신 setMapCenter를 우선 사용하세요.
응답은 한국어로 하세요.
친근하고 전문적인 여행 가이드 어조로 답하세요.`

/**
 * POST /api/agent
 * body: { message: string, history?: array }
 */
router.post('/', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  const model = process.env.OPENAI_MODEL || 'gpt-4o'
  const { message, history = [] } = req.body

  if (!message?.trim()) {
    return res.status(400).json({ error: '메시지가 필요합니다.' })
  }

  if (!apiKey) {
    return res.json({
      reply: '🔑 OpenAI API 키가 설정되지 않았습니다. .env 파일에 OPENAI_API_KEY를 추가해주세요.',
      toolCalls: [],
      isMock: true,
    })
  }

  try {
    const directMapCommand = getDirectMapCommand(message)
    if (directMapCommand) {
      return res.json({
        reply: `${directMapCommand.title} 위치로 Google 지도를 이동합니다.`,
        toolCalls: [
          {
            id: `direct-${Date.now()}`,
            name: 'setMapCenter',
            args: {
              lat: directMapCommand.lat,
              lng: directMapCommand.lng,
              zoom: directMapCommand.zoom,
            },
          },
        ],
        isMock: false,
      })
    }

    const client = new OpenAI({ apiKey })
    const safeHistory = Array.isArray(history)
      ? history
        .filter((item) => ['user', 'assistant'].includes(item?.role) && typeof item?.content === 'string')
        .slice(-MAX_HISTORY_MESSAGES)
        .map((item) => ({ role: item.role, content: item.content }))
      : []

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...safeHistory,
      { role: 'user', content: message.trim() },
    ]

    const response = await client.chat.completions.create({
      model,
      messages,
      tools: MAP_TOOLS,
      tool_choice: 'auto',
      max_tokens: 1024,
    })

    const choice = response.choices?.[0]
    if (!choice?.message) {
      throw new Error('OpenAI response did not include a message.')
    }

    const toolCalls = choice.message.tool_calls || []
    const reply = choice.message.content || ''

    // tool_calls를 클라이언트가 이해할 수 있는 형태로 변환
    const parsedToolCalls = toolCalls.map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      args: safeParseToolArguments(tc.function.arguments),
    }))

    res.json({
      reply,
      toolCalls: parsedToolCalls,
      isMock: false,
    })
  } catch (err) {
    console.error('OpenAI API 오류:', err)
    res.status(500).json({
      error: 'AI 에이전트 오류가 발생했습니다.',
      details: err.message,
    })
  }
})

function getDirectMapCommand(message) {
  const normalized = String(message || '').replace(/\s/g, '').toLowerCase()
  const asksForMapMove = ['이동', '보여', '확대', '센터', '중심', '지도'].some((keyword) => normalized.includes(keyword))
  if (!asksForMapMove) return null

  return KNOWN_MAP_LOCATIONS.find((location) =>
    location.aliases.some((alias) => normalized.includes(alias.replace(/\s/g, '').toLowerCase())),
  ) || null
}

function safeParseToolArguments(value) {
  try {
    return JSON.parse(value || '{}')
  } catch {
    return {}
  }
}

export { router as agentRouter }

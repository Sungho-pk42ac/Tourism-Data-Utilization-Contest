import { Router } from 'express'
import OpenAI from 'openai'

const router = Router()

/** GPT가 호출할 수 있는 지도 조작 도구 함수 정의 */
const MAP_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'searchAndMarkLocations',
      description: '키워드로 관광지를 검색하고 지도에 마커를 표시합니다.',
      parameters: {
        type: 'object',
        properties: {
          keyword: { type: 'string', description: '검색할 키워드 (예: 카페, 해수욕장)' },
          areaCode: { type: 'string', description: '지역 코드 (제주=39, 서울=1, 부산=6)' },
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
      description: '지도 중심을 특정 좌표로 이동합니다.',
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
      description: '특정 시간대의 혼잡도 히트맵을 지도에 표시합니다.',
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
사용자의 자연어 명령을 분석하고 적절한 지도 조작 함수를 호출하세요.

현재 여행 정보:
- 여행지: 제주도
- 베이스캠프: 제주시 연동 (위도 33.4996, 경도 126.5312)
- 주요 장소: 성산일출봉, 중문관광단지, 함덕해수욕장, 동문시장

카카오지도 지역 코드:
- 제주: 39, 서울: 1, 부산: 6, 대구: 4

응답은 한국어로 하되, 함수 호출이 필요하면 반드시 tool_calls를 사용하세요.
친근하고 전문적인 여행 가이드 어조로 답하세요.`

/**
 * POST /api/agent
 * body: { message: string, history?: array }
 */
router.post('/', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || 'gpt-4o'
  const { message, history = [] } = req.body

  if (!message) {
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
    const client = new OpenAI({ apiKey })

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10),
      { role: 'user', content: message },
    ]

    const response = await client.chat.completions.create({
      model,
      messages,
      tools: MAP_TOOLS,
      tool_choice: 'auto',
      max_tokens: 1024,
    })

    const choice = response.choices[0]
    const toolCalls = choice.message.tool_calls || []
    const reply = choice.message.content || ''

    // tool_calls를 클라이언트가 이해할 수 있는 형태로 변환
    const parsedToolCalls = toolCalls.map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      args: JSON.parse(tc.function.arguments || '{}'),
    }))

    res.json({
      reply,
      toolCalls: parsedToolCalls,
      isMock: false,
    })
  } catch (err) {
    console.error('OpenAI API 오류:', err.message)
    res.status(500).json({
      error: 'AI 에이전트 오류가 발생했습니다.',
      details: err.message,
    })
  }
})

export { router as agentRouter }

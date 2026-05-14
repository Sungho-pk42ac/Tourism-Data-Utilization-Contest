import { Router } from 'express'

const router = Router()
const KAKAO_DIRECTIONS_BASE = 'https://apis-navi.kakaomobility.com/v1'

/**
 * POST /api/directions
 * body: { origin: {x, y}, destination: {x, y}, waypoints?: [{x, y}] }
 * 카카오 Directions API를 서버사이드에서 호출 (CORS 우회)
 */
router.post('/', async (req, res) => {
  const apiKey = process.env.KAKAO_REST_API_KEY
  const { origin, destination, waypoints = [], priority = 'RECOMMEND' } = req.body

  if (!origin || !destination) {
    return res.status(400).json({ error: 'origin과 destination이 필요합니다.' })
  }

  if (!apiKey) {
    // API 키 없을 때 직선 경로 mock 반환
    const mockPath = [
      { lat: origin.y, lng: origin.x },
      ...waypoints.map((w) => ({ lat: w.y, lng: w.x })),
      { lat: destination.y, lng: destination.x },
    ]
    return res.json({
      path: mockPath,
      duration: 3600,
      distance: 50000,
      isMock: true,
    })
  }

  try {
    const waypointsStr = waypoints
      .map((w) => `${w.x},${w.y}`)
      .join('|')

    const params = new URLSearchParams({
      origin: `${origin.x},${origin.y}`,
      destination: `${destination.x},${destination.y}`,
      priority,
      car_fuel: 'GASOLINE',
      car_hipass: 'false',
      alternatives: 'false',
      road_details: 'false',
      ...(waypointsStr && { waypoints: waypointsStr }),
    })

    const response = await fetch(`${KAKAO_DIRECTIONS_BASE}/directions?${params}`, {
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    if (!response.ok) {
      return res.status(response.status).json({ error: data.msg || '카카오 Directions API 오류' })
    }

    const route = data.routes?.[0]
    if (!route) {
      return res.status(404).json({ error: '경로를 찾을 수 없습니다.' })
    }

    // 경로 좌표 배열 추출 (모든 구간 합침)
    const path = []
    for (const section of route.sections || []) {
      for (const road of section.roads || []) {
        const coords = road.vertexes || []
        for (let i = 0; i < coords.length - 1; i += 2) {
          path.push({ lat: coords[i + 1], lng: coords[i] })
        }
      }
    }

    res.json({
      path,
      duration: route.summary?.duration ?? 0,
      distance: route.summary?.distance ?? 0,
      isMock: false,
    })
  } catch (err) {
    console.error('카카오 Directions 오류:', err.message)
    const mockPath = [
      { lat: origin.y, lng: origin.x },
      { lat: destination.y, lng: destination.x },
    ]
    res.json({ path: mockPath, duration: 3600, distance: 50000, isMock: true, error: err.message })
  }
})

export { router as directionsRouter }

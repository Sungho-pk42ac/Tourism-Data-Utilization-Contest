import { DAYS, TIME_SLOTS, TRIP_META } from './tripData'

export const COLLECTION_BY_TYPE = {
  family: 'families',
  location: 'locations',
  route: 'routes',
  itineraryItem: 'itineraryItems',
  meal: 'meals',
  activity: 'activities',
  stayItem: 'stayItems',
  expense: 'expenses',
  task: 'tasks',
}

export const ENTITY_PAGE = {
  family: 'families',
  location: 'stay',
  route: 'itinerary',
  itineraryItem: 'itinerary',
  meal: 'meals',
  activity: 'activities',
  stayItem: 'stay',
  expense: 'expenses',
  task: 'itinerary',
}

const DEFAULT_SELECTION = { type: 'activity', id: 'fri-arrival' }
export const TRIP_DOCUMENT_STORAGE_KEY = 'trip-command-center/v5-korea'
export const VIEWER_PROFILE_STORAGE_KEY = 'trip-command-center/viewer/v5-korea'
const LEGACY_TRIP_DOCUMENT_STORAGE_KEYS = ['trip-command-center/v4-public', 'trip-command-center/v3-public', 'trip-command-center/v2', 'trip-command-center/v1']
const LEGACY_VIEWER_PROFILE_STORAGE_KEYS = ['trip-command-center/viewer/v4-public', 'trip-command-center/viewer/v3-public', 'trip-command-center/viewer']
const TIMELINE_HOURS_PER_SLOT = 24 / Math.max(TIME_SLOTS.length || 1, 1)
const PUBLIC_BASECAMP_ADDRESS = '제주특별자치도 제주시 연동'
const PUBLIC_BASECAMP_COORDINATES = { lat: 33.4996, lng: 126.5312 }

const MAPS_LINKS = {
  airbnb: TRIP_META.airbnb.url,
  seongsanIlchulbong: 'https://map.kakao.com/?q=성산일출봉',
  dongmunMarket: 'https://map.kakao.com/?q=제주+동문시장',
  blackPork: 'https://map.kakao.com/?q=제주+흑돼지+맛집',
  haenyeoVillage: 'https://map.kakao.com/?q=성산+해녀촌',
  jungmunResort: 'https://map.kakao.com/?q=중문관광단지',
  hamdeokBeach: 'https://map.kakao.com/?q=함덕해수욕장',
}

const SHARED_CONVOY_WINDOWS = {
  friDinner: { startSlot: 2.94, endSlot: 3 },
  friDinnerReturn: { startSlot: 3.17, endSlot: 3.23 },
  satLunch: { startSlot: 6.1, endSlot: 6.22 },
  satLunchReturn: { startSlot: 6.44, endSlot: 6.56 },
  satSeongsan: { startSlot: 4.5, endSlot: 4.75 },
  satBbq: { startSlot: 10.78, endSlot: 10.96 },
  satBbqReturn: { startSlot: 11.2, endSlot: 11.3 },
}

function getConvoyWindowSpan(window) {
  return Number((window.endSlot - window.startSlot).toFixed(2))
}

const PUBLIC_FAMILY_PROFILES = {
  'family-a': {
    title: '김씨 가족',
    name: '김씨 가족',
    shortOrigin: 'SEL',
    origin: '서울 강남',
    originAddress: '서울특별시 강남구 강남대로',
    originCoordinates: { lat: 37.4979, lng: 127.0276 },
    responsibility: '간식 및 음료 담당',
    routeSummary: '김포공항 출발, 제주공항 도착 후 렌터카 수령 및 베이스캠프 이동.',
    note: '첫 번째 도착 가족. 숙소 체크인 선도 담당.',
  },
  'family-b': {
    title: '이씨 가족',
    name: '이씨 가족',
    shortOrigin: 'PUS',
    origin: '부산',
    originAddress: '부산광역시 해운대구',
    originCoordinates: { lat: 35.1631, lng: 129.1635 },
    responsibility: '그릴 용품 및 식재료 담당',
    routeSummary: '김해공항 출발, 제주공항 도착. 바비큐 장비 운반.',
    note: '두 번째 도착 가족. 토요일 바비큐 세팅 담당.',
  },
  'family-c': {
    title: '박씨 가족',
    name: '박씨 가족',
    shortOrigin: 'TAE',
    origin: '대구',
    originAddress: '대구광역시 중구',
    originCoordinates: { lat: 35.8714, lng: 128.6014 },
    responsibility: '카메라 및 기록 담당',
    routeSummary: '대구국제공항 출발, 제주공항 도착. 여행 기록 담당.',
    note: '세 번째 도착 가족. 드론 및 카메라 운영.',
  },
}

const PUBLIC_BASECAMP = {
  name: '제주 베이스캠프 숙소',
  address: PUBLIC_BASECAMP_ADDRESS,
  coordinates: PUBLIC_BASECAMP_COORDINATES,
  summary: '3가족 합숙 베이스캠프. 제주 연동 기반으로 공항 30분 거리.',
  accessNote: '숙소 비밀번호는 체크인 당일 별도 안내.',
  directionsNote: '제주국제공항에서 렌터카로 30분 이내.',
  parkingNote: '주차 1대 기본 제공, 추가 차량은 인근 공영주차장.',
  lockNote: null,
  checkIn: '오후 3시 이후 체크인',
  checkOut: '오전 11시 이전 체크아웃',
  wifiNetwork: null,
  wifiPassword: null,
  hostName: null,
  coHostName: null,
  guestSummary: null,
  confirmationCode: null,
  vehicleFee: '렌터카 별도 예약 필요',
  externalUrl: null,
  manualUrl: null,
  photos: [
    {
      id: 'jeju-basecamp-exterior',
      label: '제주 숙소 외관',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=900&q=80',
      sourceUrl: null,
    },
    {
      id: 'jeju-basecamp-interior',
      label: '제주 숙소 내부',
      imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80',
      sourceUrl: null,
    },
  ],
}

const PUBLIC_STAY_SUMMARIES = {
  'stay-basecamp': '제주 연동 베이스캠프. 3가족 합숙 운영.',
  'stay-gate-access': '체크인 당일 숙소 비밀번호 및 주차 정보 공유 예정.',
  'stay-room-assignments': '각 가족 침실 배정은 도착 순서에 따라 현장 확인.',
  'stay-beach-parking': '렌터카 3대 주차 공간 사전 확인 필요.',
}

const PUBLIC_STAY_NOTES = {
  'stay-basecamp': '첫 번째 도착 가족이 체크인 리드.',
  'stay-gate-access': '숙소 상세 정보는 별도 안내 예정.',
  'stay-room-assignments': '아이 있는 가족 우선 배정.',
  'stay-beach-parking': '추가 주차는 인근 공영주차장 이용.',
}

const PUBLIC_EXPENSE_PAYER = '공동'

const LOCATION_MEDIA = {
  'pine-airbnb': PUBLIC_BASECAMP.photos,
  'grill-pml': [
    {
      id: 'grill-dining',
      label: 'Dinner reference',
      imageUrl:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
      sourceUrl: MAPS_LINKS.grill,
    },
  ],
  'two-guys-pizza': [
    {
      id: 'two-guys-pizza-dining',
      label: 'Pizza dinner reference',
      imageUrl:
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
      sourceUrl: MAPS_LINKS.twoGuys,
    },
  ],
  'mountain-room': [
    {
      id: 'mountain-room-dining',
      label: 'Mountain Room reference',
      imageUrl:
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80',
      sourceUrl: MAPS_LINKS.mountainRoom,
    },
  ],
  'priest-station': [
    {
      id: 'priest-station-stop',
      label: 'Roadside lunch reference',
      imageUrl:
        'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?auto=format&fit=crop&w=900&q=80',
      sourceUrl: MAPS_LINKS.priestStation,
    },
  ],
  'around-horn': [
    {
      id: 'around-horn-dining',
      label: 'Return dinner reference',
      imageUrl:
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
      sourceUrl: MAPS_LINKS.aroundHorn,
    },
  ],
  yosemite: [
    {
      id: 'yosemite-view',
      label: 'West entrance reference',
      imageUrl:
        'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=900&q=80',
      sourceUrl: MAPS_LINKS.yosemite,
    },
  ],
}

const DAY_NAME_TO_ID = {
  금요일: 'fri',
  토요일: 'sat',
  일요일: 'sun',
  Friday: 'fri',
  Saturday: 'sat',
  Sunday: 'sun',
}

const LEGACY_FAMILY_TASKS = {
  'family-a': {
    'flight-check': 'task-flight-check-a',
    snacks: 'task-snacks-a',
    'kids-bag': 'task-kids-bag-a',
    'rental-car': 'task-rental-car-a',
  },
  'family-b': {
    'grill-kit': 'task-grill-kit-b',
    groceries: 'task-groceries-b',
    'kids-gear': 'task-kids-gear-b',
    sunscreen: 'task-sunscreen-b',
  },
  'family-c': {
    camera: 'task-camera-c',
    'portable-charger': 'task-charger-c',
    'first-aid': 'task-first-aid-c',
    'map-download': 'task-map-c',
  },
}

export function makeEntityKey(type, id) {
  return `${type}:${id}`
}

export function parseEntityKey(key) {
  const [type, ...rest] = key.split(':')
  return { type, id: rest.join(':') }
}

export function getCollection(doc, type) {
  const collectionName = COLLECTION_BY_TYPE[type]
  return collectionName ? doc[collectionName] || [] : []
}

export function getEntityById(doc, type, id) {
  return getCollection(doc, type).find((item) => item.id === id) || null
}

export function getEntityBySelection(doc, selection) {
  if (!selection?.type || !selection?.id) return null
  return getEntityById(doc, selection.type, selection.id)
}

export function getEntityTitle(entity) {
  if (!entity) return 'No selection'
  return entity.title || entity.name || entity.label || entity.meal || entity.id
}

export function getDayMeta(dayId) {
  return DAYS.find((day) => day.id === dayId) || null
}

export function getSlotLabel(slotIndex) {
  const safeSlotIndex = Number.isFinite(slotIndex) ? Math.max(slotIndex, 0) : 0
  const dayIndex = Math.floor(safeSlotIndex / TIME_SLOTS.length)
  const slotIndexWithinDay = Math.floor(safeSlotIndex % TIME_SLOTS.length)
  const slot = TIME_SLOTS[slotIndexWithinDay]
  const day = DAYS[dayIndex]
  if (!day) return `${slot}:00`

  const fractionalSlot = safeSlotIndex - Math.floor(safeSlotIndex)
  const baseHour = Number(slot) || 0
  const totalMinutes = Math.round((baseHour + fractionalSlot * 6) * 60)
  const hour24 = Math.floor(totalMinutes / 60) % 24
  const minute = totalMinutes % 60
  const meridiem = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 || 12

  return `${day.shortLabel} ${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${meridiem}`
}

export function getRouteSimulationWindow(doc, route) {
  if (!route) {
    return { start: 0, end: 1 }
  }

  if (route.linkedEntityKey) {
    const linked = parseEntityKey(route.linkedEntityKey)
    if (linked.type === 'itineraryItem') {
      const linkedItem = doc?.itineraryItems?.find((item) => item.id === linked.id)
      if (linkedItem && Number.isFinite(linkedItem.startSlot)) {
        const fallbackSpan = Number.isFinite(linkedItem.span) && linkedItem.span > 0 ? linkedItem.span : 1
        const span = getRouteDurationSlotSpan(route, fallbackSpan)
        return {
          start: linkedItem.startSlot,
          end: linkedItem.startSlot + span,
        }
      }
    }
  }

  const start = Number.isFinite(route.simulationStartSlot) ? route.simulationStartSlot : 0
  const fallbackSpan =
    Number.isFinite(route.simulationEndSlot) && route.simulationEndSlot > start
      ? route.simulationEndSlot - start
      : 1
  const end = start + getRouteDurationSlotSpan(route, fallbackSpan)
  return { start, end }
}

export function getRouteDurationSlotSpan(route, fallbackSpan = 1) {
  const simulationStartSlot = Number(route?.simulationStartSlot)
  const simulationEndSlot = Number(route?.simulationEndSlot)
  if (
    Number.isFinite(simulationStartSlot) &&
    Number.isFinite(simulationEndSlot) &&
    simulationEndSlot > simulationStartSlot
  ) {
    return simulationEndSlot - simulationStartSlot
  }

  const durationSeconds = Number(route?.durationSeconds)
  if (Number.isFinite(durationSeconds) && durationSeconds > 0) {
    return durationSeconds / 3600 / TIMELINE_HOURS_PER_SLOT
  }
  return fallbackSpan
}

export function getItineraryItemEffectiveSpan(doc, item) {
  if (!item) return 1

  const fallbackSpan = Number.isFinite(item.span) && item.span > 0 ? item.span : 1
  if (!item.routeId) return fallbackSpan

  const route = doc?.routes?.find((candidate) => candidate.id === item.routeId)
  return getRouteDurationSlotSpan(route, fallbackSpan)
}

export function isEntityOnPage(entity, pageId) {
  if (!entity) return false
  if (entity.type === 'location') {
    return ['stay', 'meals', 'activities', 'itinerary'].includes(pageId)
  }
  return ENTITY_PAGE[entity.type] === pageId
}


function buildLocations() {
  return [
    {
      id: 'jeju-basecamp',
      type: 'location',
      title: TRIP_META.airbnb.name,
      category: 'stay',
      dayId: 'all',
      address: TRIP_META.airbnb.location,
      coordinates: PUBLIC_BASECAMP.coordinates,
      externalUrl: MAPS_LINKS.airbnb,
      summary: '3가족 합숙 베이스캠프. 제주 연동 기반으로 공항 30분 거리.',
      parkingNote: TRIP_META.airbnb.parkingNote,
      accessNote: TRIP_META.airbnb.gateNote,
      directionsNote: TRIP_META.airbnb.directionsNote,
      lockNote: TRIP_META.airbnb.lockNote,
      checkIn: TRIP_META.airbnb.checkIn,
      checkOut: TRIP_META.airbnb.checkOut,
      wifiNetwork: TRIP_META.airbnb.wifiNetwork,
      wifiPassword: TRIP_META.airbnb.wifiPassword,
      hostName: TRIP_META.airbnb.hostName,
      coHostName: TRIP_META.airbnb.coHostName,
      guestSummary: TRIP_META.airbnb.guestSummary,
      confirmationCode: TRIP_META.airbnb.confirmationCode,
      vehicleFee: TRIP_META.airbnb.vehicleFee,
      manualUrl: TRIP_META.airbnb.manualUrl,
      photos: PUBLIC_BASECAMP.photos,
      linkedEntityKeys: [
        makeEntityKey('stayItem', 'stay-basecamp'),
        makeEntityKey('stayItem', 'stay-gate-access'),
        makeEntityKey('stayItem', 'stay-room-assignments'),
        makeEntityKey('stayItem', 'stay-checkout-reset'),
      ],
    },
    {
      id: 'jeju-airport',
      type: 'location',
      title: '제주국제공항',
      category: 'logistics',
      dayId: 'fri',
      stopType: '집결지',
      address: '제주특별자치도 제주시 공항로 2',
      coordinates: { lat: 33.5113, lng: 126.4928 },
      externalUrl: null,
      summary: '3가족 집결지. 렌터카 수령 후 베이스캠프로 이동.',
      linkedEntityKeys: [
        makeEntityKey('family', 'family-a'),
        makeEntityKey('family', 'family-b'),
        makeEntityKey('family', 'family-c'),
      ],
      photos: [],
    },
    {
      id: 'seongsan-ilchulbong',
      type: 'location',
      title: '성산일출봉',
      category: 'activity',
      dayId: 'sat',
      address: '제주특별자치도 서귀포시 성산읍 일출로 284-12',
      coordinates: { lat: 33.4588, lng: 126.9425 },
      externalUrl: MAPS_LINKS.seongsanIlchulbong,
      summary: '유네스코 세계자연유산. 화산 분화구로 유명한 제주 동부 핵심 명소.',
      photos: [
        {
          id: 'seongsan-view',
          label: '성산일출봉 전경',
          imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=900&q=80',
          sourceUrl: null,
        },
      ],
      linkedEntityKeys: [
        makeEntityKey('activity', 'sat-east'),
        makeEntityKey('itineraryItem', 'sat-seongsan'),
      ],
    },
    {
      id: 'dongmun-market',
      type: 'location',
      title: '동문시장',
      category: 'meal',
      dayId: 'fri',
      address: '제주특별자치도 제주시 관덕로 14길 20',
      coordinates: { lat: 33.5135, lng: 126.5248 },
      externalUrl: MAPS_LINKS.dongmunMarket,
      summary: '제주 대표 재래시장. 야시장 및 로컬 먹거리 체험.',
      reservationNote: '야시장은 오후 7시~자정 운영.',
      photos: [
        {
          id: 'dongmun-market-view',
          label: '동문시장 야시장',
          imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
          sourceUrl: null,
        },
      ],
      linkedEntityKeys: [makeEntityKey('meal', 'fri-market')],
    },
    {
      id: 'jeju-black-pork',
      type: 'location',
      title: '제주 흑돼지 맛집',
      category: 'meal',
      dayId: 'fri',
      address: '제주특별자치도 제주시 연동',
      coordinates: { lat: 33.4890, lng: 126.4983 },
      externalUrl: MAPS_LINKS.blackPork,
      summary: '제주 명물 흑돼지 구이. 도착 첫날 저녁 식사.',
      reservationNote: '오후 7시 예약 필수.',
      photos: [
        {
          id: 'black-pork-view',
          label: '제주 흑돼지',
          imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
          sourceUrl: null,
        },
      ],
      linkedEntityKeys: [makeEntityKey('meal', 'fri-dinner')],
    },
    {
      id: 'haenyeo-village',
      type: 'location',
      title: '성산 해녀촌',
      category: 'meal',
      dayId: 'sat',
      address: '제주특별자치도 서귀포시 성산읍',
      coordinates: { lat: 33.4621, lng: 126.9274 },
      externalUrl: MAPS_LINKS.haenyeoVillage,
      summary: '성산 현지 해녀촌. 성게미역국, 해산물 체험 가능.',
      reservationNote: '현장 즉석 식사.',
      photos: [
        {
          id: 'haenyeo-view',
          label: '해녀촌 해산물',
          imageUrl: 'https://images.unsplash.com/photo-1611171711791-b34e63e1f0c0?auto=format&fit=crop&w=900&q=80',
          sourceUrl: null,
        },
      ],
      linkedEntityKeys: [makeEntityKey('meal', 'sat-lunch')],
    },
    {
      id: 'jungmun-resort',
      type: 'location',
      title: '중문관광단지',
      category: 'activity',
      dayId: 'sun',
      address: '제주특별자치도 서귀포시 중문관광로',
      coordinates: { lat: 33.2491, lng: 126.4122 },
      externalUrl: MAPS_LINKS.jungmunResort,
      summary: '제주 남부 대표 리조트 단지. 중문해수욕장, 천지연폭포 인근.',
      photos: [
        {
          id: 'jungmun-view',
          label: '중문관광단지',
          imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80',
          sourceUrl: null,
        },
      ],
      linkedEntityKeys: [
        makeEntityKey('activity', 'sun-south'),
        makeEntityKey('itineraryItem', 'sun-jungmun'),
      ],
    },
    {
      id: 'hamdeok-beach',
      type: 'location',
      title: '함덕해수욕장',
      category: 'activity',
      dayId: 'sat',
      address: '제주특별자치도 제주시 조천읍 함덕리',
      coordinates: { lat: 33.5432, lng: 126.6698 },
      externalUrl: MAPS_LINKS.hamdeokBeach,
      summary: '에메랄드빛 바다로 유명한 제주 북동부 해수욕장.',
      photos: [
        {
          id: 'hamdeok-view',
          label: '함덕해수욕장',
          imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
          sourceUrl: null,
        },
      ],
      linkedEntityKeys: [makeEntityKey('activity', 'sat-east')],
    },
    {
      id: 'jeju-grocery',
      type: 'location',
      title: '제주 마트 (이마트/롯데마트)',
      category: 'logistics',
      dayId: 'fri',
      address: '제주특별자치도 제주시 연동',
      coordinates: { lat: 33.4961, lng: 126.5283 },
      externalUrl: null,
      summary: '도착 첫날 식재료 및 생필품 구매.',
      linkedEntityKeys: [
        makeEntityKey('itineraryItem', 'groceries'),
        makeEntityKey('task', 'task-grocery-run'),
      ],
      photos: [],
    },
  ]
}

function buildFamilies() {
  return [
    {
      id: 'family-a',
      type: 'family',
      title: '김씨 가족',
      name: '김씨 가족',
      shortOrigin: 'SEL',
      origin: '서울 강남',
      originAddress: '서울특별시 강남구 강남대로',
      originCoordinates: { lat: 37.4979, lng: 127.0276 },
      arrivalDayId: 'fri',
      eta: '금요일 오후 2시',
      driveTime: '비행 1시간',
      headcount: '어른 2명, 아이 1명',
      vehicle: '렌터카 SUV',
      vehicleLabel: '차량 1',
      responsibility: '간식 및 음료 담당',
      readiness: 85,
      status: '이동 중',
      routeSummary: '김포공항 출발, 제주공항 도착 후 렌터카 수령 및 베이스캠프 이동.',
      plannedStopIds: ['jeju-airport'],
      taskIds: ['task-flight-check-a', 'task-snacks-a', 'task-kids-bag-a', 'task-rental-car-a'],
      linkedEntityKeys: [
        makeEntityKey('itineraryItem', 'family-a-flight'),
        makeEntityKey('meal', 'fri-dinner'),
      ],
      note: '첫 번째 도착 가족. 숙소 체크인 선도 담당.',
    },
    {
      id: 'family-b',
      type: 'family',
      title: '이씨 가족',
      name: '이씨 가족',
      shortOrigin: 'PUS',
      origin: '부산',
      originAddress: '부산광역시 해운대구',
      originCoordinates: { lat: 35.1631, lng: 129.1635 },
      arrivalDayId: 'fri',
      eta: '금요일 오후 3시',
      driveTime: '비행 50분',
      headcount: '어른 2명, 아이 2명',
      vehicle: '렌터카 미니밴',
      vehicleLabel: '차량 2',
      responsibility: '그릴 용품 및 식재료 담당',
      readiness: 78,
      status: '이동 중',
      routeSummary: '김해공항 출발, 제주공항 도착. 바비큐 장비 운반.',
      plannedStopIds: ['jeju-airport'],
      taskIds: ['task-grill-kit-b', 'task-groceries-b', 'task-kids-gear-b', 'task-sunscreen-b'],
      linkedEntityKeys: [
        makeEntityKey('itineraryItem', 'family-b-flight'),
        makeEntityKey('meal', 'sat-bbq'),
      ],
      note: '두 번째 도착 가족. 토요일 바비큐 세팅 담당.',
    },
    {
      id: 'family-c',
      type: 'family',
      title: '박씨 가족',
      name: '박씨 가족',
      shortOrigin: 'TAE',
      origin: '대구',
      originAddress: '대구광역시 중구',
      originCoordinates: { lat: 35.8714, lng: 128.6014 },
      arrivalDayId: 'fri',
      eta: '금요일 오후 4시',
      driveTime: '비행 1시간',
      headcount: '어른 2명',
      vehicle: '렌터카 세단',
      vehicleLabel: '차량 3',
      responsibility: '카메라 및 기록 담당',
      readiness: 92,
      status: '이동 중',
      routeSummary: '대구국제공항 출발, 제주공항 도착. 여행 기록 담당.',
      plannedStopIds: ['jeju-airport'],
      taskIds: ['task-camera-c', 'task-charger-c', 'task-first-aid-c', 'task-map-c'],
      linkedEntityKeys: [
        makeEntityKey('itineraryItem', 'family-c-flight'),
      ],
      note: '세 번째 도착 가족. 드론 및 카메라 운영.',
    },
  ]
}

function buildItineraryItems() {
  return [
    {
      id: 'family-a-flight',
      type: 'itineraryItem',
      title: '김씨 가족 비행',
      rowId: 'travel',
      dayId: 'fri',
      startSlot: 1.0,
      span: 0.5,
      color: 'info',
      familyIds: ['family-a'],
      status: '이동 중',
      riskLevel: 'Low',
      taskIds: ['task-flight-check-a'],
      linkedEntityKeys: [makeEntityKey('family', 'family-a')],
    },
    {
      id: 'family-b-flight',
      type: 'itineraryItem',
      title: '이씨 가족 비행',
      rowId: 'travel',
      dayId: 'fri',
      startSlot: 1.5,
      span: 0.5,
      color: 'warning',
      familyIds: ['family-b'],
      status: '이동 중',
      riskLevel: 'Low',
      taskIds: [],
      linkedEntityKeys: [makeEntityKey('family', 'family-b')],
    },
    {
      id: 'family-c-flight',
      type: 'itineraryItem',
      title: '박씨 가족 비행',
      rowId: 'travel',
      dayId: 'fri',
      startSlot: 2.0,
      span: 0.5,
      color: 'critical',
      familyIds: ['family-c'],
      status: '이동 중',
      riskLevel: 'Low',
      taskIds: [],
      linkedEntityKeys: [makeEntityKey('family', 'family-c')],
    },
    {
      id: 'all-airport-basecamp',
      type: 'itineraryItem',
      title: '공항 → 베이스캠프',
      rowId: 'travel',
      dayId: 'fri',
      startSlot: 2.5,
      span: 0.5,
      color: 'success',
      familyIds: ['family-a', 'family-b', 'family-c'],
      routeId: 'route-airport-basecamp',
      status: '이동 중',
      riskLevel: 'Low',
      taskIds: ['task-rental-car-a'],
      linkedEntityKeys: [
        makeEntityKey('location', 'jeju-airport'),
        makeEntityKey('location', 'jeju-basecamp'),
      ],
    },
    {
      id: 'sat-seongsan',
      type: 'itineraryItem',
      title: '성산일출봉 이동',
      rowId: 'travel',
      dayId: 'sat',
      startSlot: SHARED_CONVOY_WINDOWS.satSeongsan.startSlot,
      span: getConvoyWindowSpan(SHARED_CONVOY_WINDOWS.satSeongsan),
      color: 'critical',
      familyIds: ['family-a', 'family-b', 'family-c'],
      routeId: 'route-jeju-east',
      status: '출발',
      riskLevel: 'Low',
      taskIds: [],
      linkedEntityKeys: [
        makeEntityKey('activity', 'sat-east'),
        makeEntityKey('location', 'seongsan-ilchulbong'),
      ],
    },
    {
      id: 'fri-arrival-ops',
      type: 'itineraryItem',
      title: '도착 및 정착',
      rowId: 'activities',
      dayId: 'fri',
      startSlot: 1.5,
      span: 2.5,
      color: 'info',
      locationId: 'jeju-basecamp',
      status: '도착일',
      riskLevel: 'Medium',
      linkedEntityKeys: [makeEntityKey('meal', 'fri-dinner'), makeEntityKey('activity', 'fri-arrival')],
      taskIds: ['task-gate-access', 'task-room-assignments'],
    },
    {
      id: 'sat-east-ops',
      type: 'itineraryItem',
      title: '제주 동부 투어',
      rowId: 'activities',
      dayId: 'sat',
      startSlot: 4.0,
      span: 4.0,
      color: 'warning',
      locationId: 'seongsan-ilchulbong',
      status: 'Go',
      riskLevel: 'Medium',
      linkedEntityKeys: [makeEntityKey('activity', 'sat-east')],
      taskIds: [],
    },
    {
      id: 'sun-south-ops',
      type: 'itineraryItem',
      title: '제주 남부 투어',
      rowId: 'activities',
      dayId: 'sun',
      startSlot: 8.0,
      span: 3.0,
      color: 'success',
      locationId: 'jungmun-resort',
      status: 'Go',
      riskLevel: 'Low',
      linkedEntityKeys: [makeEntityKey('activity', 'sun-south')],
      taskIds: [],
    },
    {
      id: 'sun-jungmun',
      type: 'itineraryItem',
      title: '귀가 이동',
      rowId: 'activities',
      dayId: 'sun',
      startSlot: 11.0,
      span: 1.0,
      color: 'muted',
      locationId: 'jeju-basecamp',
      status: 'Go',
      riskLevel: 'Low',
      linkedEntityKeys: [makeEntityKey('activity', 'sun-south')],
      taskIds: ['task-cabin-reset'],
    },
    {
      id: 'checkin',
      type: 'itineraryItem',
      title: '숙소 체크인',
      rowId: 'support',
      dayId: 'fri',
      startSlot: 2.5,
      span: 1.0,
      color: 'muted',
      locationId: 'jeju-basecamp',
      status: '확정',
      riskLevel: 'Low',
      linkedEntityKeys: [makeEntityKey('stayItem', 'stay-basecamp')],
      taskIds: ['task-gate-access', 'task-room-assignments'],
    },
    {
      id: 'groceries',
      type: 'itineraryItem',
      title: '동문시장 / 마트 장보기',
      rowId: 'support',
      dayId: 'fri',
      startSlot: 3.5,
      span: 0.5,
      color: 'muted',
      locationId: 'jeju-grocery',
      status: '대기',
      riskLevel: 'Low',
      linkedEntityKeys: [makeEntityKey('meal', 'sat-bbq'), makeEntityKey('meal', 'sun-breakfast')],
      taskIds: ['task-grocery-run'],
    },
    {
      id: 'sat-bbq-prep',
      type: 'itineraryItem',
      title: '일요일 일정 준비',
      rowId: 'support',
      dayId: 'sat',
      startSlot: 7.0,
      span: 1.0,
      color: 'muted',
      locationId: 'jeju-basecamp',
      status: '대기',
      riskLevel: 'Low',
      linkedEntityKeys: [makeEntityKey('activity', 'sun-south')],
      taskIds: ['task-cabin-reset'],
    },
  ]
}

function buildMeals() {
  return [
    {
      id: 'fri-dinner',
      type: 'meal',
      title: '제주 흑돼지 구이',
      dayId: 'fri',
      startSlot: 3.0,
      status: '확정',
      owner: '예약',
      reservationType: '첫날 저녁',
      timeLabel: '오후 7시',
      locationId: 'jeju-black-pork',
      linkedEntityKeys: [makeEntityKey('itineraryItem', 'fri-arrival-ops')],
      taskIds: ['task-gate-access'],
      note: '도착 첫날 저녁은 제주 대표 음식인 흑돼지로 시작. 오후 7시 예약.',
    },
    {
      id: 'fri-market',
      type: 'meal',
      title: '동문시장 야시장',
      dayId: 'fri',
      startSlot: 3.5,
      status: '확정',
      owner: '공동',
      reservationType: '자유 식사',
      timeLabel: '오후 7~9시',
      locationId: 'dongmun-market',
      linkedEntityKeys: [makeEntityKey('activity', 'fri-arrival')],
      taskIds: [],
      note: '첫날 동문시장 야시장 탐방. 각자 로컬 음식 체험.',
    },
    {
      id: 'sat-breakfast',
      type: 'meal',
      title: '베이스캠프 조식',
      dayId: 'sat',
      startSlot: 4.0,
      status: '확정',
      owner: '공동',
      reservationType: '자체 취사',
      timeLabel: '오전 7시',
      locationId: 'jeju-basecamp',
      linkedEntityKeys: [makeEntityKey('activity', 'sat-east')],
      taskIds: [],
      note: '성산일출봉 이른 출발을 위해 간단히 베이스캠프에서 해결.',
    },
    {
      id: 'sat-lunch',
      type: 'meal',
      title: '성산 해녀촌',
      dayId: 'sat',
      startSlot: 6.22,
      status: '확정',
      owner: '즉석',
      reservationType: '현지 식사',
      timeLabel: '오후 12시',
      locationId: 'haenyeo-village',
      linkedEntityKeys: [makeEntityKey('activity', 'sat-east')],
      taskIds: [],
      note: '성산 현지에서 해녀 음식 체험 (성게미역국, 해산물).',
    },
    {
      id: 'sat-bbq',
      type: 'meal',
      title: '베이스캠프 바비큐',
      dayId: 'sat',
      startSlot: 7.04,
      status: '확정',
      owner: '이씨 가족',
      reservationType: '바비큐',
      timeLabel: '오후 6시',
      locationId: 'jeju-basecamp',
      linkedEntityKeys: [makeEntityKey('activity', 'sat-east')],
      taskIds: ['task-grill-kit-b'],
      note: '이씨 가족 담당 그릴 세팅. 제주산 고기와 야채 준비.',
    },
    {
      id: 'sun-breakfast',
      type: 'meal',
      title: '베이스캠프 브런치',
      dayId: 'sun',
      startSlot: 8.0,
      status: '확정',
      owner: '공동',
      reservationType: '자체 취사',
      timeLabel: '오전 9시',
      locationId: 'jeju-basecamp',
      linkedEntityKeys: [makeEntityKey('activity', 'sun-south')],
      taskIds: ['task-cabin-reset'],
      note: '체크아웃 전 간단히 베이스캠프에서 브런치.',
    },
    {
      id: 'sun-lunch',
      type: 'meal',
      title: '중문 해산물 레스토랑',
      dayId: 'sun',
      startSlot: 9.0,
      status: '확정',
      owner: '예약',
      reservationType: '마지막 식사',
      timeLabel: '오후 12시',
      locationId: 'jungmun-resort',
      linkedEntityKeys: [makeEntityKey('activity', 'sun-south')],
      taskIds: [],
      note: '마지막 식사는 중문관광단지 인근 해산물 레스토랑.',
    },
  ]
}

function buildActivities() {
  return [
    {
      id: 'fri-arrival',
      type: 'activity',
      title: '도착 및 정착',
      dayId: 'fri',
      window: '금요일 / 오후',
      status: 'Go',
      riskLevel: 'Medium',
      weatherSensitivity: 'Low',
      locationId: 'jeju-basecamp',
      linkedEntityKeys: [
        makeEntityKey('itineraryItem', 'family-a-flight'),
        makeEntityKey('itineraryItem', 'family-b-flight'),
        makeEntityKey('itineraryItem', 'family-c-flight'),
        makeEntityKey('meal', 'fri-dinner'),
      ],
      taskIds: ['task-gate-access', 'task-room-assignments'],
      description: '세 가족 모두 제주국제공항 도착 후 렌터카 수령, 숙소 체크인, 동문시장 장보기.',
      backup: '늦은 도착 시 동문시장 대신 편의점 활용.',
      note: '첫 번째 도착 가족이 체크인 리드.',
    },
    {
      id: 'sat-east',
      type: 'activity',
      title: '제주 동부 투어',
      dayId: 'sat',
      window: '토요일 / 오전 일찍',
      status: 'Go',
      riskLevel: 'Medium',
      weatherSensitivity: 'Medium',
      locationId: 'seongsan-ilchulbong',
      linkedEntityKeys: [
        makeEntityKey('meal', 'sat-breakfast'),
        makeEntityKey('meal', 'sat-lunch'),
        makeEntityKey('meal', 'sat-bbq'),
        makeEntityKey('itineraryItem', 'sat-east-ops'),
        makeEntityKey('location', 'hamdeok-beach'),
      ],
      taskIds: ['task-grill-kit-b'],
      description: '성산일출봉(유네스코 세계유산) 탐방, 섭지코지, 해녀촌 점심. 저녁은 베이스캠프 바비큐.',
      backup: '날씨 악화 시 아쿠아플라넷 제주 실내 대안.',
      note: '성산일출봉 혼잡도 주말 매우 높음 — 오전 8시 이전 도착 권장.',
    },
    {
      id: 'sun-south',
      type: 'activity',
      title: '제주 남부 투어',
      dayId: 'sun',
      window: '일요일 / 오전',
      status: 'Watch',
      riskLevel: 'Low',
      weatherSensitivity: 'Low',
      locationId: 'jungmun-resort',
      linkedEntityKeys: [
        makeEntityKey('meal', 'sun-breakfast'),
        makeEntityKey('meal', 'sun-lunch'),
        makeEntityKey('itineraryItem', 'sun-south-ops'),
      ],
      taskIds: ['task-cabin-reset'],
      description: '중문관광단지, 천지연폭포. 오후 귀가 비행 전 마지막 일정.',
      backup: '비행 시간에 따라 일정 압축 가능.',
      note: '체크아웃 전날 밤 짐 미리 정리 권장.',
    },
  ]
}

function buildStayItems() {
  return [
    {
      id: 'stay-basecamp',
      type: 'stayItem',
      title: '베이스캠프 개요',
      dayId: 'fri',
      locationId: 'jeju-basecamp',
      category: 'overview',
      summary: '제주 연동 베이스캠프. 3가족 합숙 운영.',
      linkedEntityKeys: [makeEntityKey('location', 'jeju-basecamp')],
      taskIds: ['task-gate-access', 'task-room-assignments'],
      note: '첫 번째 도착 가족이 체크인 리드.',
    },
    {
      id: 'stay-gate-access',
      type: 'stayItem',
      title: '체크인 및 접근 안내',
      dayId: 'fri',
      locationId: 'jeju-basecamp',
      category: 'access',
      summary: TRIP_META.airbnb.gateNote,
      linkedEntityKeys: [makeEntityKey('location', 'jeju-basecamp')],
      taskIds: ['task-gate-access'],
      note: '숙소 비밀번호 체크인 당일 별도 안내.',
    },
    {
      id: 'stay-room-assignments',
      type: 'stayItem',
      title: '침실 배정',
      dayId: 'fri',
      locationId: 'jeju-basecamp',
      category: 'sleep',
      summary: '방1 김씨 가족, 방2 이씨 가족, 방3 박씨 가족.',
      linkedEntityKeys: [
        makeEntityKey('family', 'family-a'),
        makeEntityKey('family', 'family-b'),
        makeEntityKey('family', 'family-c'),
      ],
      taskIds: ['task-room-assignments'],
      note: '아이 있는 가족 우선 배정.',
    },
    {
      id: 'stay-parking',
      type: 'stayItem',
      title: '주차 및 렌터카',
      dayId: 'fri',
      locationId: 'jeju-basecamp',
      category: 'parking',
      summary: TRIP_META.airbnb.parkingNote,
      linkedEntityKeys: [makeEntityKey('activity', 'fri-arrival')],
      taskIds: [],
      note: '렌터카 3대 주차 공간 사전 확인 필요.',
    },
    {
      id: 'stay-checkout-reset',
      type: 'stayItem',
      title: '체크아웃 정리',
      dayId: 'sun',
      locationId: 'jeju-basecamp',
      category: 'checkout',
      summary: '일요일 출발은 토요일 밤 미리 준비.',
      linkedEntityKeys: [makeEntityKey('activity', 'sun-south')],
      taskIds: ['task-cabin-reset'],
      note: '토요일 밤 짐 미리 정리.',
    },
  ]
}

function buildExpenses() {
  return [
    {
      id: 'accommodation',
      type: 'expense',
      title: '숙소 예약',
      payer: '김씨 가족',
      amount: 480000,
      split: '균등 분담',
      allocationMode: 'equal',
      allocations: {},
      settled: false,
      linkedEntityKeys: [makeEntityKey('stayItem', 'stay-basecamp')],
      note: '가장 큰 공동 비용. 김씨 가족 선결제 후 현장 정산.',
    },
    {
      id: 'groceries',
      type: 'expense',
      title: '식재료 및 장보기',
      payer: '이씨 가족',
      amount: 150000,
      split: '균등 분담',
      allocationMode: 'equal',
      allocations: {},
      settled: false,
      linkedEntityKeys: [
        makeEntityKey('meal', 'sat-bbq'),
        makeEntityKey('meal', 'sun-breakfast'),
      ],
      note: '바비큐 식재료 및 공동 취사 재료.',
    },
    {
      id: 'rental-car',
      type: 'expense',
      title: '렌터카',
      payer: '각 가족',
      amount: 0,
      split: '개별 부담',
      allocationMode: 'individual',
      allocations: {},
      settled: true,
      linkedEntityKeys: [
        makeEntityKey('family', 'family-a'),
        makeEntityKey('family', 'family-b'),
        makeEntityKey('family', 'family-c'),
      ],
      note: '각 가족 개별 예약 및 부담.',
    },
    {
      id: 'activities',
      type: 'expense',
      title: '입장료 및 활동비',
      payer: '미정',
      amount: 90000,
      split: '수동 배분',
      allocationMode: 'manual',
      allocations: {
        'family-a': 30000,
        'family-b': 30000,
        'family-c': 30000,
      },
      settled: false,
      linkedEntityKeys: [
        makeEntityKey('activity', 'sat-east'),
        makeEntityKey('activity', 'sun-south'),
      ],
      note: '성산일출봉, 중문 입장료 등.',
    },
  ]
}

function buildTasks() {
  return [
    {
      id: 'task-flight-check-a',
      type: 'task',
      title: '항공권 체크인 완료',
      dayId: 'fri',
      status: 'done',
      ownerFamilyId: 'family-a',
      linkedEntityKeys: [
        makeEntityKey('family', 'family-a'),
        makeEntityKey('itineraryItem', 'family-a-flight'),
      ],
      note: '',
    },
    {
      id: 'task-snacks-a',
      type: 'task',
      title: '간식 및 음료 준비',
      dayId: 'fri',
      status: 'done',
      ownerFamilyId: 'family-a',
      linkedEntityKeys: [makeEntityKey('family', 'family-a')],
      note: '',
    },
    {
      id: 'task-kids-bag-a',
      type: 'task',
      title: '아이 짐 가방 준비',
      dayId: 'fri',
      status: 'open',
      ownerFamilyId: 'family-a',
      linkedEntityKeys: [makeEntityKey('family', 'family-a')],
      note: '',
    },
    {
      id: 'task-rental-car-a',
      type: 'task',
      title: '렌터카 예약 확인',
      dayId: 'fri',
      status: 'done',
      ownerFamilyId: 'family-a',
      linkedEntityKeys: [
        makeEntityKey('family', 'family-a'),
        makeEntityKey('itineraryItem', 'all-airport-basecamp'),
      ],
      note: '',
    },
    {
      id: 'task-grill-kit-b',
      type: 'task',
      title: '그릴 용품 패킹',
      dayId: 'fri',
      status: 'done',
      ownerFamilyId: 'family-b',
      linkedEntityKeys: [
        makeEntityKey('family', 'family-b'),
        makeEntityKey('meal', 'sat-bbq'),
      ],
      note: '',
    },
    {
      id: 'task-groceries-b',
      type: 'task',
      title: '식재료 구매',
      dayId: 'fri',
      status: 'open',
      ownerFamilyId: 'family-b',
      linkedEntityKeys: [
        makeEntityKey('family', 'family-b'),
        makeEntityKey('meal', 'sat-bbq'),
      ],
      note: '',
    },
    {
      id: 'task-kids-gear-b',
      type: 'task',
      title: '아이들 수영 장비 준비',
      dayId: 'fri',
      status: 'open',
      ownerFamilyId: 'family-b',
      linkedEntityKeys: [makeEntityKey('family', 'family-b')],
      note: '',
    },
    {
      id: 'task-sunscreen-b',
      type: 'task',
      title: '선크림 및 모자 준비',
      dayId: 'fri',
      status: 'done',
      ownerFamilyId: 'family-b',
      linkedEntityKeys: [makeEntityKey('family', 'family-b')],
      note: '',
    },
    {
      id: 'task-camera-c',
      type: 'task',
      title: '카메라 및 드론 준비',
      dayId: 'fri',
      status: 'done',
      ownerFamilyId: 'family-c',
      linkedEntityKeys: [makeEntityKey('family', 'family-c')],
      note: '',
    },
    {
      id: 'task-charger-c',
      type: 'task',
      title: '보조배터리 충전',
      dayId: 'fri',
      status: 'done',
      ownerFamilyId: 'family-c',
      linkedEntityKeys: [makeEntityKey('family', 'family-c')],
      note: '',
    },
    {
      id: 'task-first-aid-c',
      type: 'task',
      title: '응급 키트 준비',
      dayId: 'fri',
      status: 'done',
      ownerFamilyId: 'family-c',
      linkedEntityKeys: [makeEntityKey('family', 'family-c')],
      note: '',
    },
    {
      id: 'task-map-c',
      type: 'task',
      title: '오프라인 지도 다운로드',
      dayId: 'fri',
      status: 'done',
      ownerFamilyId: 'family-c',
      linkedEntityKeys: [makeEntityKey('family', 'family-c')],
      note: '',
    },
    {
      id: 'task-gate-access',
      type: 'task',
      title: '숙소 체크인 절차 확인',
      dayId: 'fri',
      status: 'open',
      ownerFamilyId: null,
      linkedEntityKeys: [
        makeEntityKey('stayItem', 'stay-gate-access'),
        makeEntityKey('activity', 'fri-arrival'),
      ],
      note: '',
    },
    {
      id: 'task-room-assignments',
      type: 'task',
      title: '침실 배정 사전 확정',
      dayId: 'fri',
      status: 'open',
      ownerFamilyId: null,
      linkedEntityKeys: [
        makeEntityKey('stayItem', 'stay-room-assignments'),
        makeEntityKey('activity', 'fri-arrival'),
      ],
      note: '',
    },
    {
      id: 'task-grocery-run',
      type: 'task',
      title: '동문시장 / 마트 장보기',
      dayId: 'fri',
      status: 'open',
      ownerFamilyId: null,
      linkedEntityKeys: [
        makeEntityKey('itineraryItem', 'groceries'),
        makeEntityKey('meal', 'sat-bbq'),
      ],
      note: '',
    },
    {
      id: 'task-cabin-reset',
      type: 'task',
      title: '토요일 밤 짐 미리 정리',
      dayId: 'sat',
      status: 'open',
      ownerFamilyId: null,
      linkedEntityKeys: [
        makeEntityKey('stayItem', 'stay-checkout-reset'),
        makeEntityKey('activity', 'sun-south'),
      ],
      note: '',
    },
  ]
}

function buildRoutes() {
  return [
    {
      id: 'route-airport-basecamp',
      type: 'route',
      title: '공항 → 베이스캠프',
      dayId: 'fri',
      familyId: 'all',
      tone: 'info',
      originCoordinates: { lat: 33.5113, lng: 126.4928 },
      destinationLocationId: 'jeju-basecamp',
      simulationStartSlot: 2.5,
      simulationEndSlot: 3.0,
      durationSeconds: 1800,
      path: [
        { lat: 33.5113, lng: 126.4928 },
        { lat: 33.5070, lng: 126.5100 },
        PUBLIC_BASECAMP_COORDINATES,
      ],
      linkedEntityKey: makeEntityKey('itineraryItem', 'all-airport-basecamp'),
    },
    {
      id: 'route-jeju-east',
      type: 'route',
      title: '베이스캠프 → 성산일출봉',
      dayId: 'sat',
      familyId: 'all',
      tone: 'critical',
      originCoordinates: PUBLIC_BASECAMP_COORDINATES,
      destinationLocationId: 'seongsan-ilchulbong',
      simulationStartSlot: SHARED_CONVOY_WINDOWS.satSeongsan.startSlot,
      simulationEndSlot: SHARED_CONVOY_WINDOWS.satSeongsan.endSlot,
      durationSeconds: 3600,
      path: [
        PUBLIC_BASECAMP_COORDINATES,
        { lat: 33.4700, lng: 126.7200 },
        { lat: 33.4588, lng: 126.9425 },
      ],
      linkedEntityKey: makeEntityKey('itineraryItem', 'sat-seongsan'),
    },
    {
      id: 'route-jeju-south',
      type: 'route',
      title: '베이스캠프 → 중문관광단지',
      dayId: 'sun',
      familyId: 'all',
      tone: 'success',
      originCoordinates: PUBLIC_BASECAMP_COORDINATES,
      destinationLocationId: 'jungmun-resort',
      simulationStartSlot: 8.0,
      simulationEndSlot: 8.5,
      durationSeconds: 2700,
      path: [
        PUBLIC_BASECAMP_COORDINATES,
        { lat: 33.3200, lng: 126.4800 },
        { lat: 33.2491, lng: 126.4122 },
      ],
      linkedEntityKey: makeEntityKey('itineraryItem', 'sun-jungmun'),
    },
  ]
}


export function createInitialTripDocument() {
  return {
    selectedPage: 'itinerary',
    selection: DEFAULT_SELECTION,
    pageNotes: {
      itinerary: '핵심 과제: 금요일 도착 혼잡 최소화, 토요일 성산일출봉 조기 출발 준비.',
      stay: '첫 번째 도착 가족이 체크인을 리드할 수 있도록 사전 프로토콜 공유 필요.',
      meals: '금요일 흑돼지 예약 완료, 토요일 바비큐는 이씨 가족 담당, 일요일 중문 해산물은 예약 필요.',
      activities: '성산일출봉이 핵심 일정. 혼잡도 높으므로 오전 8시 이전 도착 목표.',
      expenses: '숙소비 선결제 후 현장 정산. 공동 비용 투명하게 관리.',
      families: '각 가족의 담당 역할(간식/그릴/카메라)을 출발 전날 재확인.',
    },
    pageNoteMeta: {},
    ui: {
      searchQuery: '',
      timeline: {
        mode: 'scenario',
        cursorSlot: 3,
      },
      map: {
        showRoutes: true,
        showFacilities: true,
        showTraffic: false,
        focusFamilyId: 'all',
        focusDayId: 'all',
      },
    },
    families: buildFamilies(),
    locations: buildLocations(),
    routes: synchronizeRoutePaths(buildRoutes(), buildLocations()),
    itineraryItems: buildItineraryItems(),
    meals: buildMeals(),
    activities: buildActivities(),
    stayItems: buildStayItems(),
    expenses: buildExpenses(),
    tasks: buildTasks(),
  }
}

export function synchronizeRoutePaths(routes = [], locations = []) {
  const locationById = new Map(locations.map((location) => [location.id, location]))

  return routes.map((route) => {
    if (!route.originCoordinates || !route.destinationLocationId) return route

    const destination = locationById.get(route.destinationLocationId)?.coordinates
    const stopPoints = (route.stopLocationIds || [])
      .map((locationId) => locationById.get(locationId)?.coordinates)
      .filter(Boolean)

    if (!destination) return route

    return {
      ...route,
      path: [route.originCoordinates, ...stopPoints, destination],
    }
  })
}

export function migrateLegacyState(raw) {
  const doc = createInitialTripDocument()
  if (!raw || typeof raw !== 'object') return doc

  if (typeof raw.selectedPage === 'string') {
    doc.selectedPage = raw.selectedPage
  }

  if (raw.notes && typeof raw.notes === 'object') {
    doc.pageNotes = { ...doc.pageNotes, ...raw.notes }
  }

  if (Array.isArray(raw.meals)) {
    doc.meals = doc.meals.map((meal) => {
      const existing = raw.meals.find((item) => item.id === meal.id)
      return existing ? { ...meal, status: existing.status || meal.status, note: existing.note || meal.note } : meal
    })
  }

  if (Array.isArray(raw.expenses)) {
    doc.expenses = doc.expenses.map((expense) => {
      const existing = raw.expenses.find((item) => item.id === expense.id)
      return existing
        ? {
            ...expense,
            settled: typeof existing.settled === 'boolean' ? existing.settled : expense.settled,
            title: existing.title || expense.title,
            payer: existing.payer || expense.payer,
            amount: typeof existing.amount === 'number' ? existing.amount : expense.amount,
            split: existing.split || expense.split,
            allocationMode: existing.allocationMode || expense.allocationMode,
            allocations: existing.allocations && typeof existing.allocations === 'object'
              ? existing.allocations
              : expense.allocations,
            note: existing.note || expense.note,
          }
        : expense
    })
  }

  if (Array.isArray(raw.families)) {
    doc.families = doc.families.map((family) => {
      const existing = raw.families.find((item) => item.id === family.id)
      return existing
        ? {
            ...family,
            readiness: typeof existing.readiness === 'number' ? existing.readiness : family.readiness,
            status: existing.status || family.status,
            responsibility: existing.responsibility || family.responsibility,
            routeSummary: existing.routeSummary || family.routeSummary,
          }
        : family
    })

    const taskStatusById = {}
    raw.families.forEach((family) => {
      const mapping = LEGACY_FAMILY_TASKS[family.id] || {}
      ;(family.checklist || []).forEach((item) => {
        const taskId = mapping[item.id]
        if (taskId) {
          taskStatusById[taskId] = item.done ? 'done' : 'open'
        }
      })
    })

    doc.tasks = doc.tasks.map((task) =>
      taskStatusById[task.id] ? { ...task, status: taskStatusById[task.id] } : task,
    )

    if (typeof raw.selectedFamilyId === 'string') {
      doc.selection = { type: 'family', id: raw.selectedFamilyId }
    }
  }

  return doc
}

function refreshSeededCollection(existing = [], seeded = [], preserveFields = []) {
  const existingById = new Map(existing.map((item) => [item.id, item]))

  return seeded.map((item) => {
    const current = existingById.get(item.id)
    if (!current) return item

    const preserved = preserveFields.reduce((acc, field) => {
      if (current[field] !== undefined) acc[field] = current[field]
      return acc
    }, {})

    return {
      ...item,
      ...preserved,
    }
  })
}

function routeStructureMatches(currentRoute, seededRoute) {
  if (!currentRoute || !seededRoute) return false

  const currentOrigin = currentRoute.originCoordinates || null
  const seededOrigin = seededRoute.originCoordinates || null
  const sameOrigin =
    currentOrigin?.lat === seededOrigin?.lat
    && currentOrigin?.lng === seededOrigin?.lng

  const currentStops = currentRoute.stopLocationIds || []
  const seededStops = seededRoute.stopLocationIds || []
  const sameStops =
    currentStops.length === seededStops.length
    && currentStops.every((stopId, index) => stopId === seededStops[index])

  return sameOrigin && sameStops && currentRoute.destinationLocationId === seededRoute.destinationLocationId
}

function refreshSeededDoc(doc) {
  const seeded = createInitialTripDocument()
  const locations = refreshSeededCollection(doc.locations, seeded.locations, [
    'note',
    'lastEditedByFamilyId',
    'lastEditedAt',
    'title',
    'placesQuery',
    'placeId',
    'address',
    'coordinates',
    'externalUrl',
    'phoneNumber',
    'websiteUrl',
    'rating',
    'userRatingsTotal',
    'openingHours',
    'livePhotos',
    'basecampDrive',
  ])

  const currentRoutesById = new Map(doc.routes.map((route) => [route.id, route]))
  const routes = seeded.routes.map((route) => {
    const current = currentRoutesById.get(route.id)
    if (!current) return route

    const preserveLiveRouting = routeStructureMatches(current, route)

    return {
      ...route,
      ...(preserveLiveRouting
        ? {
            path: current.path,
            durationSeconds: current.durationSeconds,
            durationText: current.durationText,
            distanceMeters: current.distanceMeters,
            distanceText: current.distanceText,
          }
        : {}),
      note: current.note,
      lastEditedByFamilyId: current.lastEditedByFamilyId,
      lastEditedAt: current.lastEditedAt,
    }
  })

  return {
    ...doc,
    families: refreshSeededCollection(doc.families, seeded.families, [
      'readiness',
      'status',
      'responsibility',
      'note',
      'lastEditedByFamilyId',
      'lastEditedAt',
    ]),
    locations,
    itineraryItems: refreshSeededCollection(doc.itineraryItems, seeded.itineraryItems),
    stayItems: refreshSeededCollection(doc.stayItems, seeded.stayItems, ['note', 'lastEditedByFamilyId', 'lastEditedAt']),
    expenses: refreshSeededCollection(doc.expenses, seeded.expenses, [
      'title',
      'payer',
      'amount',
      'split',
      'settled',
      'allocationMode',
      'allocations',
      'note',
      'createdByFamilyId',
      'createdAt',
      'lastEditedByFamilyId',
      'lastEditedAt',
    ]),
    routes: synchronizeRoutePaths(routes, locations),
  }
}

export function getInitialTripDocument() {
  if (typeof window === 'undefined') return createInitialTripDocument()

  try {
    const rawCurrent = window.localStorage.getItem(TRIP_DOCUMENT_STORAGE_KEY)
    if (rawCurrent) {
      const parsed = JSON.parse(rawCurrent)
      if (parsed?.locations && parsed?.selection) return refreshSeededDoc(parsed)
    }
  } catch {
    return createInitialTripDocument()
  }

  return createInitialTripDocument()
}

export function clearLegacyTripStorage() {
  if (typeof window === 'undefined') return
  LEGACY_TRIP_DOCUMENT_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key))
  LEGACY_VIEWER_PROFILE_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key))
}

export function getLocationForEntity(doc, entity) {
  if (!entity) return null
  if (entity.type === 'location') return entity
  if (!entity.locationId) return null
  return getEntityById(doc, 'location', entity.locationId)
}

export function getTasksForEntity(doc, entity) {
  if (!entity) return []
  const entityKey = makeEntityKey(entity.type, entity.id)
  return doc.tasks.filter((task) => {
    if (entity.taskIds?.includes(task.id)) return true
    return (task.linkedEntityKeys || []).includes(entityKey)
  })
}

export function getLinkedEntities(doc, entity) {
  if (!entity) return []

  const seen = new Set()
  const linked = []

  const pushEntity = (item) => {
    if (!item) return
    const key = makeEntityKey(item.type, item.id)
    if (key === makeEntityKey(entity.type, entity.id) || seen.has(key)) return
    seen.add(key)
    linked.push(item)
  }

  ;(entity.linkedEntityKeys || []).forEach((key) => {
    const ref = parseEntityKey(key)
    pushEntity(getEntityById(doc, ref.type, ref.id))
  })

  if (entity.locationId) {
    pushEntity(getEntityById(doc, 'location', entity.locationId))
  }

  getTasksForEntity(doc, entity).forEach(pushEntity)

  return linked
}

export function getEntitySummary(entity) {
  if (!entity) return ''
  if (entity.type === 'family') return `${entity.origin} inbound, ${entity.headcount}`
  if (entity.type === 'meal') return `${getDayMeta(entity.dayId)?.shortLabel || entity.dayId} at ${entity.timeLabel}`
  if (entity.type === 'activity') return entity.window
  if (entity.type === 'location') return entity.address
  if (entity.type === 'stayItem') return entity.category
  if (entity.type === 'expense') return `${entity.payer} · $${entity.amount}`
  if (entity.type === 'itineraryItem') return getSlotLabel(entity.startSlot)
  if (entity.type === 'task') return entity.status
  return ''
}

export function getSearchResults(doc, query) {
  if (!query?.trim()) return []
  const normalized = query.trim().toLowerCase()
  const types = ['family', 'meal', 'activity', 'location', 'stayItem', 'expense', 'itineraryItem', 'task']
  const items = types.flatMap((type) =>
    getCollection(doc, type).map((item) => ({
      ...item,
      type,
      searchText: [
        item.title,
        item.name,
        item.summary,
        item.note,
        item.address,
        item.description,
        item.backup,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    })),
  )

  return items
    .filter((item) => item.searchText.includes(normalized))
    .slice(0, 8)
}

export function getTimelineContext(doc, overrideCursorSlot = doc.ui.timeline.cursorSlot) {
  const cursorSlot = overrideCursorSlot
  const liveEntities = [...doc.itineraryItems, ...doc.meals].filter((item) => {
    const span = getItineraryItemEffectiveSpan(doc, item)
    return cursorSlot >= item.startSlot && cursorSlot < item.startSlot + span
  })

  const nextEntities = [...doc.itineraryItems, ...doc.meals]
    .filter((item) => item.startSlot > cursorSlot)
    .sort((a, b) => a.startSlot - b.startSlot)
    .slice(0, 4)

  const prepSoon = nextEntities
    .flatMap((item) => getTasksForEntity(doc, item))
    .filter((task) => task.status !== 'done')
    .filter((task, index, array) => array.findIndex((candidate) => candidate.id === task.id) === index)
    .slice(0, 5)

  const riskWatch = [...doc.activities, ...doc.itineraryItems]
    .filter((item) => item.riskLevel === 'High' || item.status === 'Watch')
    .slice(0, 4)

  return {
    cursorSlot,
    cursorLabel: getSlotLabel(cursorSlot),
    liveEntities,
    nextEntities,
    prepSoon,
    riskWatch,
  }
}

export function getDependencyPrompts(doc, entity) {
  const tasks = getTasksForEntity(doc, entity).filter((task) => task.status !== 'done')
  return tasks.slice(0, 3).map((task) => ({
    id: `prompt-${entity.type}-${entity.id}-${task.id}`,
    label: task.title,
    reason: entity.type === 'activity'
      ? `${getEntityTitle(entity)} depends on this before go-time.`
      : 'This is still unresolved and is linked to the selected item.',
  }))
}

export function getRouteForEntity(doc, entity) {
  if (!entity) return null
  if (entity.routeId) return getEntityById(doc, 'route', entity.routeId)
  const entityKey = makeEntityKey(entity.type, entity.id)
  const directRoute = doc.routes.find((route) => route.linkedEntityKey === entityKey)
  if (directRoute) return directRoute

  for (const linkedKey of entity.linkedEntityKeys || []) {
    const linkedRoute = doc.routes.find((route) => route.linkedEntityKey === linkedKey)
    if (linkedRoute) return linkedRoute
  }

  return null
}

export function updateEntityInCollection(collection, id, updater) {
  return collection.map((item) => (item.id === id ? updater(item) : item))
}

function replacePublicStrings(value) {
  if (typeof value !== 'string' || !value) return value
  return value
}

function sanitizePublicText(value, fallback = '') {
  if (typeof value !== 'string') return fallback
  return replacePublicStrings(value)
}

function sanitizeFamilyEntity(family) {
  const profile = PUBLIC_FAMILY_PROFILES[family.id]
  if (!profile) {
    return {
      ...family,
      note: '',
    }
  }

  return {
    ...family,
    title: profile.title,
    name: profile.name,
    shortOrigin: profile.shortOrigin,
    origin: profile.origin,
    originAddress: profile.originAddress,
    originCoordinates: profile.originCoordinates,
    responsibility: profile.responsibility,
    routeSummary: profile.routeSummary,
    note: profile.note,
  }
}

function sanitizeLocationEntity(location) {
  if (location.id === 'pine-airbnb') {
    return {
      ...location,
      title: PUBLIC_BASECAMP.name,
      address: PUBLIC_BASECAMP.address,
      coordinates: PUBLIC_BASECAMP.coordinates,
      summary: PUBLIC_BASECAMP.summary,
      accessNote: PUBLIC_BASECAMP.accessNote,
      directionsNote: PUBLIC_BASECAMP.directionsNote,
      parkingNote: PUBLIC_BASECAMP.parkingNote,
      lockNote: PUBLIC_BASECAMP.lockNote,
      checkIn: PUBLIC_BASECAMP.checkIn,
      checkOut: PUBLIC_BASECAMP.checkOut,
      wifiNetwork: PUBLIC_BASECAMP.wifiNetwork,
      wifiPassword: PUBLIC_BASECAMP.wifiPassword,
      hostName: PUBLIC_BASECAMP.hostName,
      coHostName: PUBLIC_BASECAMP.coHostName,
      guestSummary: PUBLIC_BASECAMP.guestSummary,
      confirmationCode: PUBLIC_BASECAMP.confirmationCode,
      vehicleFee: PUBLIC_BASECAMP.vehicleFee,
      externalUrl: PUBLIC_BASECAMP.externalUrl,
      manualUrl: PUBLIC_BASECAMP.manualUrl,
      photos: PUBLIC_BASECAMP.photos,
      livePhotos: [],
      websiteUrl: null,
      phoneNumber: null,
      reservationNote: null,
      note: '',
    }
  }

  return {
    ...location,
    title: sanitizePublicText(location.title),
    summary: sanitizePublicText(location.summary),
    note: '',
    reservationNote: sanitizePublicText(location.reservationNote || ''),
    address: sanitizePublicText(location.address),
  }
}

function sanitizeStayItemEntity(item) {
  return {
    ...item,
    title: sanitizePublicText(item.title),
    summary: PUBLIC_STAY_SUMMARIES[item.id] || sanitizePublicText(item.summary),
    note: PUBLIC_STAY_NOTES[item.id] || '',
  }
}

function sanitizeExpenseEntity(expense) {
  return {
    ...expense,
    title: sanitizePublicText(expense.title),
    payer: PUBLIC_EXPENSE_PAYER,
    allocations: {},
    note: '',
  }
}

function sanitizeGenericEntity(entity) {
  return {
    ...entity,
    title: sanitizePublicText(entity.title),
    name: sanitizePublicText(entity.name),
    summary: sanitizePublicText(entity.summary),
    note: '',
    description: sanitizePublicText(entity.description),
    backup: sanitizePublicText(entity.backup),
    routeSummary: sanitizePublicText(entity.routeSummary),
    owner: sanitizePublicText(entity.owner),
    payer: sanitizePublicText(entity.payer),
  }
}

export function projectTripDocument(doc, visibilityMode = 'public') {
  if (visibilityMode !== 'public') return doc

  const sanitizedFamilies = doc.families.map(sanitizeFamilyEntity)

  const projected = {
    ...doc,
    pageNotes: Object.fromEntries(Object.keys(doc.pageNotes || {}).map((key) => [key, ''])),
    pageNoteMeta: {},
    families: sanitizedFamilies,
    locations: doc.locations.map(sanitizeLocationEntity),
    stayItems: doc.stayItems.map(sanitizeStayItemEntity),
    expenses: doc.expenses.map(sanitizeExpenseEntity),
    meals: doc.meals.map(sanitizeGenericEntity),
    activities: doc.activities.map(sanitizeGenericEntity),
    itineraryItems: doc.itineraryItems.map(sanitizeGenericEntity),
    tasks: doc.tasks.map(sanitizeGenericEntity),
  }

  projected.routes = synchronizeRoutePaths(
    doc.routes.map((route) => {
      const nextRoute = {
        ...route,
        title: sanitizePublicText(route.title),
        note: '',
      }

      if (route.id === 'route-sf-desert-bloom') {
        nextRoute.originCoordinates = PUBLIC_FAMILY_PROFILES['desert-bloom'].originCoordinates
        if (route.path?.length) {
          nextRoute.path = [PUBLIC_FAMILY_PROFILES['desert-bloom'].originCoordinates, ...route.path.slice(1)]
        }
      }

      if (route.id === 'route-sun-home-desert-bloom' && route.path?.length) {
        nextRoute.path = [
          ...route.path.slice(0, -1),
          PUBLIC_FAMILY_PROFILES['desert-bloom'].originCoordinates,
        ]
      }

      return nextRoute
    }),
    projected.locations,
  )

  return projected
}

export function getSelectablePageEntities(doc, pageId) {
  switch (pageId) {
    case 'itinerary':
      return [...doc.activities, ...doc.itineraryItems]
    case 'stay':
      return [...doc.stayItems, ...doc.locations.filter((location) => location.category === 'stay')]
    case 'meals':
      return doc.meals
    case 'activities':
      return doc.activities
    case 'expenses':
      return doc.expenses
    case 'families':
      return doc.families
    default:
      return []
  }
}

export function ensureSelectionForPage(doc, pageId) {
  const selected = getEntityBySelection(doc, doc.selection)
  if (selected && isEntityOnPage(selected, pageId)) return doc.selection
  const fallback = getSelectablePageEntities(doc, pageId)[0]
  return fallback ? { type: fallback.type, id: fallback.id } : DEFAULT_SELECTION
}

export function getTasksByFamily(doc, familyId) {
  return doc.tasks.filter((task) => task.ownerFamilyId === familyId)
}

export function getFamilyReadiness(doc, familyId) {
  const tasks = getTasksByFamily(doc, familyId)
  if (!tasks.length) return 100
  const doneCount = tasks.filter((task) => task.status === 'done').length
  return Math.round((doneCount / tasks.length) * 100)
}

export function getTasksForDay(doc, dayId) {
  return doc.tasks.filter((task) => task.dayId === dayId)
}

export function getPageNote(doc, pageId) {
  return doc.pageNotes[pageId] || ''
}

export function getFamilyFilterOptions(doc) {
  return [
    { id: 'all', label: 'All Families' },
    ...doc.families.map((family) => ({ id: family.id, label: family.title })),
  ]
}

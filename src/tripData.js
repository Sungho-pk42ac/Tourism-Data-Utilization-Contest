// 기본 베이스캠프: 제주도 (사용자가 지역 선택 UI로 변경 가능)
const PUBLIC_BASECAMP_LOCATION = '제주특별자치도 제주시 연동'
const PUBLIC_BASECAMP_COORDINATES = { lat: 33.4996, lng: 126.5312 }

export const TRIP_META = {
  title: '제주도 가족여행',
  subtitle: '금 6/13 ~ 일 6/15',
  commandName: '가족여행 지휘센터',
  airbnb: {
    name: '제주 베이스캠프 숙소',
    url: null,
    manualUrl: null,
    location: PUBLIC_BASECAMP_LOCATION,
    checkIn: '오후 3시 이후 체크인',
    checkOut: '오전 11시 이전 체크아웃',
    gateNote: '숙소 비밀번호는 별도 안내 예정',
    parkingNote: '주차 1대 가능, 추가 주차 시 근처 공영주차장 이용',
    directionsNote: '제주국제공항에서 차량 30분 이내',
    lockNote: null,
    wifiNetwork: null,
    wifiPassword: null,
    hostName: null,
    coHostName: null,
    guestSummary: null,
    confirmationCode: null,
    vehicleFee: '렌터카 별도 예약 필요',
  },
}

export const MAP_POINTS = [
  {
    id: 'jeju-airport',
    label: '제주공항',
    caption: '집결지',
    familyId: 'all',
    focusDay: 'friday',
    tone: 'info',
    position: { lat: 33.5113, lng: 126.4928 },
  },
  {
    id: 'basecamp',
    label: '베이스캠프',
    caption: '제주 연동 숙소',
    familyId: 'all',
    focusDay: 'all',
    tone: 'success',
    position: PUBLIC_BASECAMP_COORDINATES,
  },
  {
    id: 'hallasan',
    label: '한라산',
    caption: '주요 탐방지',
    familyId: 'all',
    focusDay: 'saturday',
    tone: 'warning',
    position: { lat: 33.3617, lng: 126.5292 },
  },
  {
    id: 'seongsan',
    label: '성산일출봉',
    caption: '유네스코 세계유산',
    familyId: 'all',
    focusDay: 'saturday',
    tone: 'critical',
    position: { lat: 33.4588, lng: 126.9425 },
  },
  {
    id: 'jungmun',
    label: '중문관광단지',
    caption: '리조트 및 해변',
    familyId: 'all',
    focusDay: 'sunday',
    tone: 'muted',
    position: { lat: 33.2491, lng: 126.4122 },
  },
]

export const MAP_ROUTES = [
  {
    id: 'route-airport-basecamp',
    familyId: 'all',
    focusDay: 'friday',
    tone: 'info',
    path: [
      { lat: 33.5113, lng: 126.4928 },
      { lat: 33.5070, lng: 126.5100 },
      PUBLIC_BASECAMP_COORDINATES,
    ],
  },
  {
    id: 'route-jeju-east',
    familyId: 'all',
    focusDay: 'saturday',
    tone: 'critical',
    path: [
      PUBLIC_BASECAMP_COORDINATES,
      { lat: 33.4700, lng: 126.7200 },
      { lat: 33.4588, lng: 126.9425 },
    ],
  },
  {
    id: 'route-jeju-south',
    familyId: 'all',
    focusDay: 'sunday',
    tone: 'warning',
    path: [
      PUBLIC_BASECAMP_COORDINATES,
      { lat: 33.3200, lng: 126.4800 },
      { lat: 33.2491, lng: 126.4122 },
    ],
  },
]

export const MAP_FACILITIES = [
  {
    id: 'dongmun-market',
    label: '동문시장',
    caption: '제주 재래시장',
    category: 'meal',
    position: { lat: 33.5135, lng: 126.5248 },
  },
  {
    id: 'ecoland',
    label: '에코랜드',
    caption: '테마파크',
    category: 'activity',
    position: { lat: 33.4716, lng: 126.6523 },
  },
  {
    id: 'hamdeok-beach',
    label: '함덕해수욕장',
    caption: '에메랄드 해변',
    category: 'activity',
    position: { lat: 33.5432, lng: 126.6698 },
  },
  {
    id: 'jeju-gas',
    label: '제주 주유소',
    caption: '렌터카 연료 보충',
    category: 'logistics',
    position: { lat: 33.5020, lng: 126.5180 },
  },
]

export const NAV_ITEMS = [
  { id: 'itinerary', label: '일정' },
  { id: 'planner', label: '플래너' },
  { id: 'stats', label: '통계' },
  { id: 'stay', label: '숙박' },
  { id: 'meals', label: '식사' },
  { id: 'activities', label: '활동' },
  { id: 'expenses', label: '비용' },
  { id: 'families', label: '가족' },
]

export const DAYS = [
  {
    id: 'fri',
    shortLabel: '금 6/13',
    title: '이동일 / 도착',
    weather: '맑음',
    temperature: '24°C',
    caution: 'Low',
  },
  {
    id: 'sat',
    shortLabel: '토 6/14',
    title: '제주 동부 탐방',
    weather: '구름조금',
    temperature: '26°C',
    caution: 'Medium',
  },
  {
    id: 'sun',
    shortLabel: '일 6/15',
    title: '제주 남부 / 귀가',
    weather: '맑음',
    temperature: '25°C',
    caution: 'Low',
  },
]

export const TIME_SLOTS = ['00', '06', '12', '18']

export const INITIAL_FAMILIES = [
  {
    id: 'family-a',
    name: '김씨 가족',
    origin: '서울 강남',
    shortOrigin: 'SEL',
    status: '이동 중',
    eta: '금요일 오후 2시',
    driveTime: '비행 1시간',
    headcount: '어른 2명, 아이 1명',
    vehicle: '렌터카 SUV',
    responsibility: '간식 및 음료 담당',
    readiness: 85,
    routeSummary: '김포공항 → 제주국제공항 → 베이스캠프',
    checklist: [
      { id: 'flight-check', label: '항공권 체크인 완료', done: true },
      { id: 'snacks', label: '간식 및 음료 준비', done: true },
      { id: 'kids-bag', label: '아이 짐 가방 준비', done: false },
      { id: 'rental-car', label: '렌터카 예약 확인', done: true },
    ],
  },
  {
    id: 'family-b',
    name: '이씨 가족',
    origin: '부산',
    shortOrigin: 'PUS',
    status: '이동 중',
    eta: '금요일 오후 3시',
    driveTime: '비행 50분',
    headcount: '어른 2명, 아이 2명',
    vehicle: '렌터카 미니밴',
    responsibility: '그릴 용품 및 식재료 담당',
    readiness: 78,
    routeSummary: '김해공항 → 제주국제공항 → 베이스캠프',
    checklist: [
      { id: 'grill-kit', label: '그릴 용품 패킹 완료', done: true },
      { id: 'groceries', label: '식재료 구매 완료', done: false },
      { id: 'kids-gear', label: '아이들 수영 장비 준비', done: false },
      { id: 'sunscreen', label: '선크림 및 모자 준비', done: true },
    ],
  },
  {
    id: 'family-c',
    name: '박씨 가족',
    origin: '대구',
    shortOrigin: 'TAE',
    status: '이동 중',
    eta: '금요일 오후 4시',
    driveTime: '비행 1시간',
    headcount: '어른 2명',
    vehicle: '렌터카 세단',
    responsibility: '카메라 및 기록 담당',
    readiness: 92,
    routeSummary: '대구국제공항 → 제주국제공항 → 베이스캠프',
    checklist: [
      { id: 'camera', label: '카메라 및 드론 준비', done: true },
      { id: 'portable-charger', label: '보조배터리 충전', done: true },
      { id: 'first-aid', label: '응급 키트 준비', done: true },
      { id: 'map-download', label: '오프라인 지도 다운로드', done: true },
    ],
  },
]

export const ITINERARY_ROWS = [
  {
    id: 'travel',
    label: '이동',
    segments: [
      { id: 'family-a-flight', familyId: 'family-a', start: 1.0, span: 0.5, color: 'info', label: '김씨 가족 비행' },
      { id: 'family-b-flight', familyId: 'family-b', start: 1.5, span: 0.5, color: 'warning', label: '이씨 가족 비행' },
      { id: 'family-c-flight', familyId: 'family-c', start: 2.0, span: 0.5, color: 'critical', label: '박씨 가족 비행' },
    ],
  },
  {
    id: 'activities',
    label: '주요 일정',
    segments: [
      { id: 'fri-arrival', start: 1.5, span: 2.5, color: 'info', label: '도착 및 베이스캠프 정착' },
      { id: 'sat-east', start: 4.0, span: 4.0, color: 'warning', label: '제주 동부 투어 (성산일출봉)' },
      { id: 'sun-south', start: 8.0, span: 3.0, color: 'success', label: '제주 남부 투어 (중문)' },
      { id: 'sun-return', start: 11.0, span: 1.0, color: 'muted', label: '귀가 이동' },
    ],
  },
  {
    id: 'support',
    label: '지원',
    segments: [
      { id: 'checkin', start: 2.5, span: 1.0, color: 'muted', label: '숙소 체크인' },
      { id: 'market-tour', start: 3.5, span: 0.5, color: 'muted', label: '동문시장 장보기' },
      { id: 'sat-prep', start: 7.0, span: 1.0, color: 'muted', label: '일요일 일정 준비' },
    ],
  },
]

export const INITIAL_MEALS = [
  { id: 'fri-dinner', day: '금요일', meal: '제주 흑돼지 구이', owner: '예약', status: '확정', note: '도착 첫날 저녁은 제주 대표 음식인 흑돼지로 시작. 오후 7시 예약.' },
  { id: 'sat-breakfast', day: '토요일', meal: '베이스캠프 조식', owner: '공동', status: '확정', note: '성산일출봉 이른 출발을 위해 간단히 베이스캠프에서 해결' },
  { id: 'sat-lunch', day: '토요일', meal: '성산 해녀촌', owner: '즉석', status: '확정', note: '성산 현지에서 해녀 음식 체험 (성게미역국, 해산물)' },
  { id: 'sat-dinner', day: '토요일', meal: '베이스캠프 바비큐', owner: '공동', status: '확정', note: '이씨 가족 담당 그릴 세팅. 제주산 고기와 야채 준비.' },
  { id: 'sun-breakfast', day: '일요일', meal: '베이스캠프 브런치', owner: '공동', status: '확정', note: '체크아웃 전 간단히 베이스캠프에서 브런치. 오전 9시.' },
  { id: 'sun-lunch', day: '일요일', meal: '중문 해산물 레스토랑', owner: '예약', status: '확정', note: '마지막 식사는 중문관광단지 인근 해산물 레스토랑. 정오 예약.' },
]

export const INITIAL_EXPENSES = [
  { id: 'accommodation', label: '숙소 예약', payer: '김씨 가족', amount: 480000, split: '3가족 균등', settled: false },
  { id: 'groceries', label: '식재료 및 장보기', payer: '이씨 가족', amount: 150000, split: '공동 분담', settled: false },
  { id: 'rental-car', label: '렌터카', payer: '각 가족', amount: 0, split: '개별 부담', settled: true },
  { id: 'activities', label: '입장료 및 활동비', payer: '미정', amount: 90000, split: '공동 분담', settled: false },
]

export const ACTIVITIES = [
  {
    id: 'fri-arrival',
    title: '도착 및 정착',
    status: 'Go',
    window: '금요일 / 오후',
    description: '세 가족 모두 제주국제공항 도착 후 렌터카 수령, 숙소 체크인, 동문시장 장보기.',
    backup: '늦은 도착 시 동문시장 대신 편의점 활용.',
  },
  {
    id: 'sat-east',
    title: '제주 동부 투어',
    status: 'Go',
    window: '토요일 / 오전 일찍',
    description: '성산일출봉(유네스코 세계유산) 탐방, 섭지코지, 해녀촌 점심. 아이들을 위한 우도 페리 옵션 고려.',
    backup: '날씨 악화 시 아쿠아플라넷 제주 실내 대안.',
  },
  {
    id: 'sun-south',
    title: '제주 남부 투어',
    status: 'Watch',
    window: '일요일 / 오전',
    description: '중문관광단지, 천지연폭포, 헬로키티 아일랜드(아이 동반). 오후 귀가 비행 전 마지막 일정.',
    backup: '비행 시간에 따라 일정 압축 가능.',
  },
]

export const STAY_DETAILS = {
  commandSummary: '제주 연동 기반 베이스캠프에서 3가족 합숙 운영.',
  houseOps: [
    '체크인 전 숙소 비밀번호 및 주차 정보 사전 공유',
    '각 가족 침실 배정 사전 확정',
    '토요일 바비큐를 위한 그릴 세팅 위치 확인',
    '일요일 체크아웃 전날 밤 짐 미리 정리',
  ],
  rooms: [
    { label: '방 1', assignment: '김씨 가족' },
    { label: '방 2', assignment: '이씨 가족' },
    { label: '방 3', assignment: '박씨 가족' },
    { label: '거실/소파', assignment: '아이들 놀이 공간' },
  ],
}

export const INITIAL_NOTES = {
  itinerary: '성산일출봉 혼잡도가 주말에 높으므로 오전 8시 이전 도착 권장.',
  stay: '렌터카 3대 주차 공간 사전 확인 필요.',
  meals: '흑돼지 맛집은 예약 필수. 해녀촌은 현지 즉석.',
  activities: '아이들 체력 고려해 이동 거리 분산. 토요일이 핵심 투어일.',
  expenses: '숙소비는 김씨 가족 선결제 후 현장 정산.',
  families: '각 가족 비행 일정 재확인 후 베이스캠프 도착 순서 공지.',
}

# TripMate AI — Flutter 앱

관광 느낌 물씬 나는 AI 여행 플래너 앱. 자연어로 입력하면 AI가 맞춤 일정을 만들어드립니다.

## 주요 기능

| 기능 | 설명 |
|------|------|
| **AI 여행 플래너** | "가족 4명 제주도 3박 4일" 처럼 자연어로 입력 → 날짜별 일정, 맛집, 숙소, 예산 자동 생성 |
| **맛집 추천** | 여행지별 로컬 맛집 큐레이션 + 음식 종류별 필터 |
| **날씨 예보** | 7일 날씨 + 여행 조건 팁 |
| **예산 계산기** | 절약/일반/럭셔리 스타일별 상세 예산 분석 |

## 백엔드 API 연동

앱은 `http://localhost:3001`의 Express 서버와 통신합니다.

```
POST /api/planner           — AI 여행 일정 생성
GET  /api/mcp/tools         — MCP 도구 목록
POST /api/mcp/execute       — MCP 도구 실행
  ↳ find_restaurants        — 맛집 검색
  ↳ get_weather_forecast    — 날씨 예보
  ↳ estimate_budget         — 예산 계산
  ↳ get_transport_options   — 교통 옵션
  ↳ check_accommodations    — 숙소 옵션
  ↳ plan_trip               — 여행 계획 (플래너와 동일)
```

**서버 실행:**
```bash
# 프로젝트 루트에서
npm run dev:all
```

## 앱 실행

```bash
cd flutter_app
flutter pub get
flutter run
```

iOS 시뮬레이터, Android 에뮬레이터, 실기기 모두 지원합니다.

## 화면 구성

```
SplashScreen (3초 애니메이션)
    └─ HomeScreen (인기 여행지 그리드 + 빠른 메뉴)
           ├─ PlannerScreen (자연어 입력)
           │       └─ ItineraryScreen (날짜별 탭 + 예산 상세)
           │               └─ RestaurantScreen
           ├─ RestaurantScreen (맛집 검색 + 필터)
           ├─ WeatherScreen (7일 예보)
           └─ BudgetScreen (예산 계산기)
```

## 디자인 시스템

- **Primary**: 선셋 오렌지 `#FF6B35`
- **Secondary**: 오션 블루 `#00B4D8`
- **Accent**: 트로피컬 그린 `#06D6A0`
- **Background**: 따뜻한 크림 `#FFF8F0`
- 폰트: Noto Sans KR (구글 폰트)
- 애니메이션: flutter_animate 라이브러리

## 네트워크 없을 때

모든 API는 오프라인 Mock 데이터로 자동 폴백합니다.
실제 좌표, 실제 식당명, 현실적인 가격 정보를 담고 있어 데모 시에도 완성도 있게 동작합니다.

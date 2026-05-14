import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/trip_plan.dart';

class ApiService {
  // Override with your server URL in production
  static const String _baseUrl = 'http://localhost:3001';

  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  final _client = http.Client();

  Future<TripPlan> planTrip(String query) async {
    try {
      final res = await _client.post(
        Uri.parse('$_baseUrl/api/planner'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'query': query}),
      ).timeout(const Duration(seconds: 30));

      if (res.statusCode != 200) throw Exception('서버 오류: ${res.statusCode}');
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      return TripPlan.fromJson(data);
    } catch (e) {
      // Return mock plan on network error so UI always works
      return _mockTripPlan(query);
    }
  }

  Future<List<RestaurantItem>> findRestaurants({
    required String destination,
    String? cuisine,
    int count = 10,
  }) async {
    try {
      final res = await _client.post(
        Uri.parse('$_baseUrl/api/mcp/execute'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'tool': 'find_restaurants',
          'args': {'destination': destination, if (cuisine != null) 'cuisine': cuisine, 'count': count},
        }),
      ).timeout(const Duration(seconds: 15));

      if (res.statusCode != 200) throw Exception('API 오류');
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      final result = data['result'] as List<dynamic>? ?? [];
      return result.map((r) => RestaurantItem.fromJson(r as Map<String, dynamic>)).toList();
    } catch (_) {
      return _mockRestaurants(destination);
    }
  }

  Future<List<WeatherDay>> getWeather({
    required String destination,
    int days = 7,
  }) async {
    try {
      final res = await _client.post(
        Uri.parse('$_baseUrl/api/mcp/execute'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'tool': 'get_weather_forecast',
          'args': {'destination': destination, 'days': days},
        }),
      ).timeout(const Duration(seconds: 10));

      if (res.statusCode != 200) throw Exception('API 오류');
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      final result = data['result'] as List<dynamic>? ?? [];
      return result.map((w) => WeatherDay.fromJson(w as Map<String, dynamic>)).toList();
    } catch (_) {
      return _mockWeather(days);
    }
  }

  Future<Map<String, dynamic>> estimateBudget({
    required String destination,
    required int days,
    required int travelers,
    String style = 'mid',
  }) async {
    try {
      final res = await _client.post(
        Uri.parse('$_baseUrl/api/mcp/execute'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'tool': 'estimate_budget',
          'args': {'destination': destination, 'days': days, 'travelers': travelers, 'style': style},
        }),
      ).timeout(const Duration(seconds: 10));

      if (res.statusCode != 200) throw Exception('API 오류');
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      return data['result'] as Map<String, dynamic>? ?? {};
    } catch (_) {
      return {
        'total': days * travelers * 100000,
        'perPerson': days * 100000,
        'breakdown': {'숙박': days * 60000, '식비': days * 30000, '교통': 20000, '입장료': days * 10000},
      };
    }
  }

  Future<List<Map<String, dynamic>>> getTransportOptions({
    required String from,
    required String to,
  }) async {
    try {
      final res = await _client.post(
        Uri.parse('$_baseUrl/api/mcp/execute'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'tool': 'get_transport_options',
          'args': {'from': from, 'to': to},
        }),
      ).timeout(const Duration(seconds: 10));

      if (res.statusCode != 200) throw Exception('API 오류');
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      return (data['result'] as List<dynamic>? ?? [])
          .map((t) => t as Map<String, dynamic>)
          .toList();
    } catch (_) {
      return [
        {'type': '비행기', 'duration': '1시간', 'price': 89000, 'tip': '김포↔제주 노선 가장 저렴'},
        {'type': '배', 'duration': '10시간', 'price': 35000, 'tip': '야간 페리 이용 시 숙박비 절약'},
      ];
    }
  }

  // ── Mock data ────────────────────────────────────────────────────────────────

  TripPlan _mockTripPlan(String query) {
    return TripPlan(
      summary: const TripSummary(
        destination: '제주도',
        days: 3,
        travelers: '부부 2명',
        theme: '자연·힐링',
      ),
      budget: BudgetInfo(
        perPerson: 450000,
        total: 900000,
        breakdown: {'숙박': 360000, '식비': 240000, '교통': 180000, '입장료': 60000, '기타': 60000},
      ),
      days: [
        TripDay(
          dayNumber: 1,
          title: '1일차 — 동부 탐방',
          slots: [
            const DaySlot(time: '09:00', type: 'attraction', name: '성산일출봉', address: '서귀포시 성산읍 일출로 284-12', coordinates: GeoCoord(lat: 33.4588, lng: 126.9425), duration: '2시간', tip: '오전 이른 시간 방문 추천, 정상에서 바라보는 경치 최고', cost: 5000),
            const DaySlot(time: '12:00', type: 'meal', name: '성산 해녀촌', address: '서귀포시 성산읍 성산리', coordinates: GeoCoord(lat: 33.4610, lng: 126.9380), duration: '1시간', tip: '신선한 해산물 정식, 성게국수 추천', cost: 25000),
            const DaySlot(time: '14:00', type: 'attraction', name: '섭지코지', address: '서귀포시 성산읍 섭지코지로', coordinates: GeoCoord(lat: 33.4263, lng: 126.9308), duration: '1.5시간', tip: '드라마 촬영지, 산책로 추천', cost: 0),
            const DaySlot(time: '16:30', type: 'attraction', name: '우도', address: '제주시 우도면', coordinates: GeoCoord(lat: 33.5017, lng: 126.9520), duration: '3시간', tip: '배로 10분, 자전거 투어 추천', cost: 14000),
            const DaySlot(time: '20:00', type: 'stay', name: '성산 펜션 (숙박)', address: '서귀포시 성산읍', coordinates: GeoCoord(lat: 33.4588, lng: 126.9300), duration: '1박', tip: '바다 전망 객실 요청', cost: 120000),
          ],
        ),
        TripDay(
          dayNumber: 2,
          title: '2일차 — 중부 & 한라산',
          slots: [
            const DaySlot(time: '07:00', type: 'attraction', name: '한라산 성판악 탐방로', address: '제주시 조천읍 516로', coordinates: GeoCoord(lat: 33.3617, lng: 126.5292), duration: '5시간', tip: '왕복 9.6km, 등산화 필수, 물 2L 준비', cost: 0),
            const DaySlot(time: '13:30', type: 'meal', name: '제주 흑돼지 맛집 거리', address: '제주시 연동 노형로', coordinates: GeoCoord(lat: 33.4896, lng: 126.4732), duration: '1.5시간', tip: '제주 흑돼지 1인분 15,000원, 오겹살 추천', cost: 30000),
            const DaySlot(time: '16:00', type: 'attraction', name: '사려니숲길', address: '제주시 조천읍 교래리', coordinates: GeoCoord(lat: 33.4003, lng: 126.6508), duration: '2시간', tip: '피톤치드 가득, 조용한 산책 코스', cost: 0),
            const DaySlot(time: '19:00', type: 'meal', name: '동문재래시장', address: '제주시 관덕로 14길 20', coordinates: GeoCoord(lat: 33.5135, lng: 126.5248), duration: '1.5시간', tip: '빙떡, 순대, 고기국수 야식 코스', cost: 15000),
            const DaySlot(time: '21:00', type: 'stay', name: '제주시내 호텔 (숙박)', address: '제주시 연동', coordinates: GeoCoord(lat: 33.4996, lng: 126.5312), duration: '1박', tip: '시내 접근성 최고, 다음날 이동 편리', cost: 100000),
          ],
        ),
        TripDay(
          dayNumber: 3,
          title: '3일차 — 서부 & 귀가',
          slots: [
            const DaySlot(time: '09:00', type: 'attraction', name: '협재해수욕장', address: '제주시 한림읍 협재리', coordinates: GeoCoord(lat: 33.3942, lng: 126.2391), duration: '2시간', tip: '에메랄드빛 바다, 비양도 조망 포인트', cost: 0),
            const DaySlot(time: '11:30', type: 'attraction', name: '한림공원', address: '제주시 한림읍 한림로 300', coordinates: GeoCoord(lat: 33.4056, lng: 126.2517), duration: '1.5시간', tip: '용암동굴 + 열대 식물원 복합공원', cost: 12000),
            const DaySlot(time: '13:30', type: 'meal', name: '오설록 티 뮤지엄 카페', address: '서귀포시 안덕면 신화역사로', coordinates: GeoCoord(lat: 33.3061, lng: 126.2893), duration: '1시간', tip: '녹차 소프트아이스크림 필수, 티 세트 추천', cost: 12000),
            const DaySlot(time: '15:00', type: 'transport', name: '제주국제공항 귀가', address: '제주시 용담2동', coordinates: GeoCoord(lat: 33.5097, lng: 126.4928), duration: '-', tip: '2시간 전 도착 권장, 기념품은 시내 면세점 활용', cost: 0),
          ],
        ),
      ],
      restaurants: [
        const RestaurantItem(name: '우진해장국', cuisine: '한식', priceRange: '₩', address: '제주시 서광로 11길 35', coordinates: GeoCoord(lat: 33.5008, lng: 126.5219), recommendation: '고사리 해장국 60년 전통, 제주 로컬 맛집 1위'),
        const RestaurantItem(name: '돈사돈', cuisine: '흑돼지구이', priceRange: '₩₩', address: '제주시 연동 노형로 87', coordinates: GeoCoord(lat: 33.4891, lng: 126.4731), recommendation: '제주 흑돼지 전문, 직화구이 맛집'),
        const RestaurantItem(name: '명진전복', cuisine: '해산물', priceRange: '₩₩₩', address: '서귀포시 남원읍 태위로 232', coordinates: GeoCoord(lat: 33.2869, lng: 126.7118), recommendation: '전복죽·전복구이 한국 최고 수준'),
        const RestaurantItem(name: '진미 통닭', cuisine: '치킨', priceRange: '₩', address: '제주시 이도1동 삼성로', coordinates: GeoCoord(lat: 33.5045, lng: 126.5269), recommendation: '50년 전통 통닭, 현지인 최애'),
      ],
      tips: [
        '렌터카 없으면 여행이 힘듦 — 사전 예약 필수',
        '성수기(7~8월, 추석) 숙소는 3개월 전 예약',
        '제주 올레길 패스 구매 시 입장료 할인',
        '귤 철(11~2월)에 방문하면 귤 따기 체험 가능',
        '동문시장 야시장은 금·토요일 운영',
      ],
    );
  }

  List<RestaurantItem> _mockRestaurants(String destination) {
    if (destination.contains('제주')) {
      return const [
        RestaurantItem(name: '우진해장국', cuisine: '해장국', priceRange: '₩', address: '제주시 서광로 11길 35', coordinates: GeoCoord(lat: 33.5008, lng: 126.5219), recommendation: '60년 전통 고사리 해장국'),
        RestaurantItem(name: '돈사돈', cuisine: '흑돼지', priceRange: '₩₩', address: '제주시 연동', coordinates: GeoCoord(lat: 33.4891, lng: 126.4731), recommendation: '제주 흑돼지 직화구이'),
        RestaurantItem(name: '올레국수', cuisine: '국수', priceRange: '₩', address: '제주시 노형동', coordinates: GeoCoord(lat: 33.4840, lng: 126.4750), recommendation: '고기국수 제주 3대 맛집'),
        RestaurantItem(name: '명진전복', cuisine: '해산물', priceRange: '₩₩₩', address: '서귀포시 남원읍', coordinates: GeoCoord(lat: 33.2869, lng: 126.7118), recommendation: '전복죽·전복구이 전문'),
        RestaurantItem(name: '자매국수', cuisine: '국수', priceRange: '₩', address: '제주시 삼도2동', coordinates: GeoCoord(lat: 33.5145, lng: 126.5182), recommendation: '제주 고기국수 원조'),
      ];
    }
    if (destination.contains('부산')) {
      return const [
        RestaurantItem(name: '초량밀면', cuisine: '밀면', priceRange: '₩', address: '부산시 동구 초량동', recommendation: '부산 밀면 원조'),
        RestaurantItem(name: '할매 국밥', cuisine: '돼지국밥', priceRange: '₩', address: '부산시 서구 부용동', recommendation: '부산 돼지국밥 맛집'),
      ];
    }
    return const [
      RestaurantItem(name: '로컬 맛집', cuisine: '한식', priceRange: '₩₩', address: destination, recommendation: '현지 추천 맛집'),
    ];
  }

  List<WeatherDay> _mockWeather(int days) {
    final now = DateTime.now();
    return List.generate(days, (i) {
      final date = now.add(Duration(days: i));
      final month = date.month;
      int high, low, humidity;
      String condition;
      if (month >= 6 && month <= 8) {
        high = 28 + (i % 3); low = 22; humidity = 75; condition = i % 4 == 0 ? 'rainy' : 'partly_cloudy';
      } else if (month >= 3 && month <= 5) {
        high = 18 + (i % 4); low = 10; humidity = 55; condition = 'sunny';
      } else if (month >= 9 && month <= 11) {
        high = 20 + (i % 3); low = 12; humidity = 50; condition = 'sunny';
      } else {
        high = 8 + (i % 3); low = 2; humidity = 45; condition = i % 5 == 0 ? 'cloudy' : 'sunny';
      }
      return WeatherDay(
        date: '${date.month}/${date.day}',
        condition: condition,
        highTemp: high,
        lowTemp: low,
        humidity: humidity,
        tip: condition == 'rainy' ? '우산 필수' : '야외 활동 좋은 날씨',
      );
    });
  }
}

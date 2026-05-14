class TripPlan {
  final TripSummary summary;
  final BudgetInfo budget;
  final List<TripDay> days;
  final List<RestaurantItem> restaurants;
  final List<String> tips;

  const TripPlan({
    required this.summary,
    required this.budget,
    required this.days,
    required this.restaurants,
    required this.tips,
  });

  factory TripPlan.fromJson(Map<String, dynamic> json) => TripPlan(
    summary: TripSummary.fromJson(json['summary'] as Map<String, dynamic>? ?? {}),
    budget: BudgetInfo.fromJson(json['budget'] as Map<String, dynamic>? ?? {}),
    days: (json['days'] as List<dynamic>? ?? [])
        .map((d) => TripDay.fromJson(d as Map<String, dynamic>))
        .toList(),
    restaurants: (json['restaurants'] as List<dynamic>? ?? [])
        .map((r) => RestaurantItem.fromJson(r as Map<String, dynamic>))
        .toList(),
    tips: (json['tips'] as List<dynamic>? ?? []).map((t) => t.toString()).toList(),
  );
}

class TripSummary {
  final String destination;
  final int days;
  final String travelers;
  final String theme;

  const TripSummary({
    required this.destination,
    required this.days,
    required this.travelers,
    required this.theme,
  });

  factory TripSummary.fromJson(Map<String, dynamic> json) => TripSummary(
    destination: json['destination']?.toString() ?? '',
    days: (json['days'] as num?)?.toInt() ?? 1,
    travelers: json['travelers']?.toString() ?? '',
    theme: json['theme']?.toString() ?? '',
  );
}

class BudgetInfo {
  final int perPerson;
  final int total;
  final Map<String, int> breakdown;

  const BudgetInfo({
    required this.perPerson,
    required this.total,
    required this.breakdown,
  });

  factory BudgetInfo.fromJson(Map<String, dynamic> json) => BudgetInfo(
    perPerson: (json['perPerson'] as num?)?.toInt() ?? 0,
    total: (json['total'] as num?)?.toInt() ?? 0,
    breakdown: (json['breakdown'] as Map<String, dynamic>? ?? {})
        .map((k, v) => MapEntry(k, (v as num?)?.toInt() ?? 0)),
  );
}

class TripDay {
  final int dayNumber;
  final String title;
  final List<DaySlot> slots;

  const TripDay({
    required this.dayNumber,
    required this.title,
    required this.slots,
  });

  factory TripDay.fromJson(Map<String, dynamic> json) => TripDay(
    dayNumber: (json['dayNumber'] as num?)?.toInt() ?? 1,
    title: json['title']?.toString() ?? '',
    slots: (json['slots'] as List<dynamic>? ?? [])
        .map((s) => DaySlot.fromJson(s as Map<String, dynamic>))
        .toList(),
  );
}

class DaySlot {
  final String time;
  final String type; // 'attraction' | 'meal' | 'stay' | 'transport'
  final String name;
  final String address;
  final GeoCoord? coordinates;
  final String duration;
  final String tip;
  final int cost;

  const DaySlot({
    required this.time,
    required this.type,
    required this.name,
    required this.address,
    this.coordinates,
    required this.duration,
    required this.tip,
    required this.cost,
  });

  factory DaySlot.fromJson(Map<String, dynamic> json) => DaySlot(
    time: json['time']?.toString() ?? '',
    type: json['type']?.toString() ?? 'attraction',
    name: json['name']?.toString() ?? '',
    address: json['address']?.toString() ?? '',
    coordinates: json['coordinates'] != null
        ? GeoCoord.fromJson(json['coordinates'] as Map<String, dynamic>)
        : null,
    duration: json['duration']?.toString() ?? '',
    tip: json['tip']?.toString() ?? '',
    cost: (json['cost'] as num?)?.toInt() ?? 0,
  );
}

class GeoCoord {
  final double lat;
  final double lng;

  const GeoCoord({required this.lat, required this.lng});

  factory GeoCoord.fromJson(Map<String, dynamic> json) => GeoCoord(
    lat: (json['lat'] as num?)?.toDouble() ?? 0,
    lng: (json['lng'] as num?)?.toDouble() ?? 0,
  );
}

class RestaurantItem {
  final String name;
  final String cuisine;
  final String priceRange;
  final String address;
  final GeoCoord? coordinates;
  final String recommendation;

  const RestaurantItem({
    required this.name,
    required this.cuisine,
    required this.priceRange,
    required this.address,
    this.coordinates,
    required this.recommendation,
  });

  factory RestaurantItem.fromJson(Map<String, dynamic> json) => RestaurantItem(
    name: json['name']?.toString() ?? '',
    cuisine: json['cuisine']?.toString() ?? '',
    priceRange: json['priceRange']?.toString() ?? '₩₩',
    address: json['address']?.toString() ?? '',
    coordinates: json['coordinates'] != null
        ? GeoCoord.fromJson(json['coordinates'] as Map<String, dynamic>)
        : null,
    recommendation: json['recommendation']?.toString() ?? '',
  );
}

class WeatherDay {
  final String date;
  final String condition;
  final int highTemp;
  final int lowTemp;
  final int humidity;
  final String tip;

  const WeatherDay({
    required this.date,
    required this.condition,
    required this.highTemp,
    required this.lowTemp,
    required this.humidity,
    required this.tip,
  });

  factory WeatherDay.fromJson(Map<String, dynamic> json) => WeatherDay(
    date: json['date']?.toString() ?? '',
    condition: json['condition']?.toString() ?? 'sunny',
    highTemp: (json['highTemp'] as num?)?.toInt() ?? 25,
    lowTemp: (json['lowTemp'] as num?)?.toInt() ?? 18,
    humidity: (json['humidity'] as num?)?.toInt() ?? 60,
    tip: json['tip']?.toString() ?? '',
  );

  String get weatherEmoji {
    final c = condition.toLowerCase();
    if (c.contains('맑') || c == 'sunny' || c == 'clear') return '☀️';
    if (c.contains('구름 조금') || c == 'partly_cloudy') return '⛅';
    if (c.contains('구름') || c == 'cloudy') return '☁️';
    if (c.contains('비') || c == 'rainy') return '🌧️';
    if (c.contains('폭') || c.contains('천둥') || c == 'stormy') return '⛈️';
    if (c.contains('눈') || c == 'snowy') return '❄️';
    if (c.contains('안개') || c == 'foggy') return '🌫️';
    return '🌤️';
  }
}

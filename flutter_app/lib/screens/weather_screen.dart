import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../models/trip_plan.dart';

class WeatherScreen extends StatefulWidget {
  final String? destination;
  const WeatherScreen({super.key, this.destination});

  @override
  State<WeatherScreen> createState() => _WeatherScreenState();
}

class _WeatherScreenState extends State<WeatherScreen> {
  final _controller = TextEditingController();
  List<WeatherDay> _weather = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _controller.text = widget.destination ?? '제주도';
    _load();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    try {
      final w = await ApiService().getWeather(destination: _controller.text.trim(), days: 7);
      setState(() => _weather = w);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('날씨 & 여행 조건')),
      body: Column(
        children: [
          _SearchRow(controller: _controller, onSearch: _load),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppTheme.secondary))
                : _weather.isEmpty
                    ? const Center(child: Text('날씨 정보를 불러오는 중...'))
                    : _WeatherContent(weather: _weather, destination: _controller.text),
          ),
        ],
      ),
    );
  }
}

class _SearchRow extends StatelessWidget {
  final TextEditingController controller;
  final VoidCallback onSearch;
  const _SearchRow({required this.controller, required this.onSearch});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: controller,
              decoration: const InputDecoration(
                hintText: '여행지 입력',
                prefixIcon: Icon(Icons.location_on_outlined, size: 18, color: AppTheme.textMuted),
                isDense: true,
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              onSubmitted: (_) => onSearch(),
            ),
          ),
          const SizedBox(width: 8),
          ElevatedButton(
            onPressed: onSearch,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.secondary,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('확인', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}

class _WeatherContent extends StatelessWidget {
  final List<WeatherDay> weather;
  final String destination;
  const _WeatherContent({required this.weather, required this.destination});

  @override
  Widget build(BuildContext context) {
    final today = weather.isNotEmpty ? weather.first : null;
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
      children: [
        if (today != null) _TodayCard(day: today, destination: destination),
        const SizedBox(height: 20),
        Text('7일 예보', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 12),
        SizedBox(
          height: 120,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: weather.length,
            separatorBuilder: (_, __) => const SizedBox(width: 10),
            itemBuilder: (_, i) => _DayChip(day: weather[i], isToday: i == 0)
                .animate(delay: Duration(milliseconds: 50 * i)).scale(begin: const Offset(0.85, 0.85), duration: 300.ms, curve: Curves.easeOut).fade(),
          ),
        ),
        const SizedBox(height: 20),
        Text('여행 팁', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 12),
        ...weather.map((w) => _TipCard(day: w))
            .take(4)
            .toList()
            .asMap()
            .entries
            .map((e) => e.value.animate(delay: Duration(milliseconds: 100 * e.key)).slideX(begin: 0.05).fade()),
      ],
    );
  }
}

class _TodayCard extends StatelessWidget {
  final WeatherDay day;
  final String destination;
  const _TodayCard({required this.day, required this.destination});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: _gradientForCondition(day.condition),
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(destination, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              Text('${day.highTemp}°', style: const TextStyle(color: Colors.white, fontSize: 56, fontWeight: FontWeight.w800, height: 1.0)),
              Text('최저 ${day.lowTemp}°  습도 ${day.humidity}%', style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13)),
            ],
          ),
          const Spacer(),
          Column(
            children: [
              Text(day.weatherEmoji, style: const TextStyle(fontSize: 56)),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(12)),
                child: Text(_conditionLabel(day.condition), style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500)),
              ),
            ],
          ),
        ],
      ),
    ).animate().scale(begin: const Offset(0.95, 0.95), duration: 400.ms, curve: Curves.easeOut).fade();
  }

  List<Color> _gradientForCondition(String c) {
    switch (c) {
      case 'sunny': return [const Color(0xFFFF8C00), const Color(0xFFFFB347)];
      case 'partly_cloudy': return [const Color(0xFF4FC3F7), const Color(0xFF0288D1)];
      case 'cloudy': return [const Color(0xFF78909C), const Color(0xFF546E7A)];
      case 'rainy': return [const Color(0xFF1565C0), const Color(0xFF283593)];
      default: return [const Color(0xFF00B4D8), const Color(0xFF023E8A)];
    }
  }

  String _conditionLabel(String c) {
    switch (c) {
      case 'sunny': return '맑음';
      case 'partly_cloudy': return '구름 조금';
      case 'cloudy': return '흐림';
      case 'rainy': return '비';
      case 'stormy': return '폭풍';
      default: return '맑음';
    }
  }
}

class _DayChip extends StatelessWidget {
  final WeatherDay day;
  final bool isToday;
  const _DayChip({required this.day, required this.isToday});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 72,
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: isToday ? AppTheme.primary.withOpacity(0.1) : AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isToday ? AppTheme.primary.withOpacity(0.4) : AppTheme.divider),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(isToday ? '오늘' : day.date, style: TextStyle(fontSize: 11, color: isToday ? AppTheme.primary : AppTheme.textSecondary, fontWeight: FontWeight.w500)),
          const SizedBox(height: 6),
          Text(day.weatherEmoji, style: const TextStyle(fontSize: 22)),
          const SizedBox(height: 6),
          Text('${day.highTemp}°', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
          Text('${day.lowTemp}°', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
        ],
      ),
    );
  }
}

class _TipCard extends StatelessWidget {
  final WeatherDay day;
  const _TipCard({required this.day});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.divider),
      ),
      child: Row(
        children: [
          Text(day.weatherEmoji, style: const TextStyle(fontSize: 20)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${day.date} 여행 조언', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                Text(day.tip, style: const TextStyle(fontSize: 14)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

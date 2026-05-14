import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../models/trip_plan.dart';

class RestaurantScreen extends StatefulWidget {
  final String? destination;
  const RestaurantScreen({super.key, this.destination});

  @override
  State<RestaurantScreen> createState() => _RestaurantScreenState();
}

class _RestaurantScreenState extends State<RestaurantScreen> {
  final _destController = TextEditingController();
  List<RestaurantItem> _restaurants = [];
  bool _isLoading = false;
  String _selectedCuisine = '전체';

  static const _cuisines = ['전체', '한식', '해산물', '흑돼지', '국수', '카페', '치킨', '분식'];

  @override
  void initState() {
    super.initState();
    _destController.text = widget.destination ?? '제주도';
    _load();
  }

  @override
  void dispose() {
    _destController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    try {
      final results = await ApiService().findRestaurants(
        destination: _destController.text.trim(),
        cuisine: _selectedCuisine == '전체' ? null : _selectedCuisine,
      );
      setState(() => _restaurants = results);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<RestaurantItem> get _filtered {
    if (_selectedCuisine == '전체') return _restaurants;
    return _restaurants.where((r) => r.cuisine.contains(_selectedCuisine)).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('맛집 추천'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _load,
          ),
        ],
      ),
      body: Column(
        children: [
          _SearchBar(
            controller: _destController,
            onSearch: _load,
          ),
          _CuisineFilter(
            selected: _selectedCuisine,
            cuisines: _cuisines,
            onSelect: (c) => setState(() => _selectedCuisine = c),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                : _filtered.isEmpty
                    ? const Center(child: Text('검색 결과가 없어요 😕', style: TextStyle(color: AppTheme.textSecondary)))
                    : ListView.builder(
                        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                        itemCount: _filtered.length,
                        itemBuilder: (_, i) => _RestaurantCard(item: _filtered[i], index: i),
                      ),
          ),
        ],
      ),
    );
  }
}

class _SearchBar extends StatelessWidget {
  final TextEditingController controller;
  final VoidCallback onSearch;
  const _SearchBar({required this.controller, required this.onSearch});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 4),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: controller,
              decoration: InputDecoration(
                hintText: '여행지 입력 (예: 제주도, 부산)',
                prefixIcon: const Icon(Icons.search, color: AppTheme.textMuted, size: 20),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                isDense: true,
              ),
              onSubmitted: (_) => onSearch(),
            ),
          ),
          const SizedBox(width: 8),
          ElevatedButton(
            onPressed: onSearch,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('검색', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}

class _CuisineFilter extends StatelessWidget {
  final String selected;
  final List<String> cuisines;
  final ValueChanged<String> onSelect;
  const _CuisineFilter({required this.selected, required this.cuisines, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: cuisines.length,
        itemBuilder: (_, i) {
          final c = cuisines[i];
          final isSelected = c == selected;
          return GestureDetector(
            onTap: () => onSelect(c),
            child: AnimatedContainer(
              duration: 200.ms,
              margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: isSelected ? AppTheme.primary : AppTheme.cardBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: isSelected ? AppTheme.primary : AppTheme.divider),
              ),
              child: Center(
                child: Text(
                  c,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: isSelected ? Colors.white : AppTheme.textSecondary,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _RestaurantCard extends StatelessWidget {
  final RestaurantItem item;
  final int index;
  const _RestaurantCard({required this.item, required this.index});

  static const _priceColors = {
    '₩': Color(0xFF3FB950),
    '₩₩': Color(0xFF0096C7),
    '₩₩₩': Color(0xFFFF6B35),
    '₩₩₩₩': Color(0xFFE8521F),
  };

  @override
  Widget build(BuildContext context) {
    final priceColor = _priceColors[item.priceRange] ?? AppTheme.textSecondary;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.divider),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: AppTheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Center(
              child: Text(
                _getCuisineEmoji(item.cuisine),
                style: const TextStyle(fontSize: 26),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(item.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(color: priceColor.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                      child: Text(item.priceRange, style: TextStyle(color: priceColor, fontSize: 12, fontWeight: FontWeight.w700)),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: AppTheme.cardBg, borderRadius: BorderRadius.circular(6)),
                      child: Text(item.cuisine, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
                    ),
                    const SizedBox(width: 8),
                    Expanded(child: Text(item.address, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary), overflow: TextOverflow.ellipsis)),
                  ],
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                  decoration: BoxDecoration(
                    color: AppTheme.warning.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Text('⭐', style: TextStyle(fontSize: 12)),
                      const SizedBox(width: 6),
                      Expanded(child: Text(item.recommendation, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.3))),
                    ],
                  ),
                ),
                if (item.coordinates != null) ...[
                  const SizedBox(height: 8),
                  GestureDetector(
                    onTap: () => launchUrl(
                      Uri.parse('https://maps.google.com/?q=${item.coordinates!.lat},${item.coordinates!.lng}'),
                      mode: LaunchMode.externalApplication,
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.map_outlined, size: 13, color: AppTheme.secondary),
                        const SizedBox(width: 4),
                        Text('지도에서 보기', style: TextStyle(fontSize: 12, color: AppTheme.secondary, fontWeight: FontWeight.w500)),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    )
        .animate(delay: Duration(milliseconds: 60 * index))
        .slideY(begin: 0.1, duration: 350.ms, curve: Curves.easeOut)
        .fade();
  }

  String _getCuisineEmoji(String cuisine) {
    if (cuisine.contains('해산물') || cuisine.contains('회')) return '🦞';
    if (cuisine.contains('흑돼지') || cuisine.contains('고기')) return '🥩';
    if (cuisine.contains('국수') || cuisine.contains('면')) return '🍜';
    if (cuisine.contains('카페') || cuisine.contains('디저트')) return '☕';
    if (cuisine.contains('치킨')) return '🍗';
    if (cuisine.contains('분식')) return '🥢';
    return '🍽️';
  }
}

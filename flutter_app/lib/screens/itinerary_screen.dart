import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/app_theme.dart';
import '../models/trip_plan.dart';
import 'restaurant_screen.dart';

class ItineraryScreen extends StatefulWidget {
  final TripPlan plan;
  final String query;
  const ItineraryScreen({super.key, required this.plan, required this.query});

  @override
  State<ItineraryScreen> createState() => _ItineraryScreenState();
}

class _ItineraryScreenState extends State<ItineraryScreen> with SingleTickerProviderStateMixin {
  late TabController _tab;
  int _selectedDay = 0;

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: widget.plan.days.length, vsync: this);
    _tab.addListener(() => setState(() => _selectedDay = _tab.index));
  }

  @override
  void dispose() {
    _tab.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final plan = widget.plan;
    return Scaffold(
      body: NestedScrollView(
        headerSliverBuilder: (ctx, _) => [
          SliverAppBar(
            expandedHeight: 220,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: _HeroHeader(plan: plan),
            ),
            bottom: TabBar(
              controller: _tab,
              isScrollable: true,
              tabAlignment: TabAlignment.start,
              indicatorColor: AppTheme.primary,
              indicatorWeight: 3,
              labelColor: AppTheme.primary,
              unselectedLabelColor: AppTheme.textSecondary,
              tabs: plan.days.map((d) => Tab(text: '${d.dayNumber}일차')).toList(),
            ),
          ),
        ],
        body: Column(
          children: [
            Expanded(
              child: TabBarView(
                controller: _tab,
                children: plan.days.map((day) => _DayView(day: day)).toList(),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _BottomBar(plan: plan),
    );
  }
}

class _HeroHeader extends StatelessWidget {
  final TripPlan plan;
  const _HeroHeader({required this.plan});

  @override
  Widget build(BuildContext context) {
    final s = plan.summary;
    return Stack(
      fit: StackFit.expand,
      children: [
        Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF023E8A), Color(0xFF00B4D8), Color(0xFF0077B6)],
            ),
          ),
        ),
        Positioned(right: -30, top: -30, child: Container(width: 160, height: 160, decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withOpacity(0.07)))),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 60, 20, 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(12)),
                      child: Text('${s.days}박 ${s.days + 1}일', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500)),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(12)),
                      child: Text(s.theme, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  '${s.destination} 여행',
                  style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w800, letterSpacing: -0.5),
                ),
                Text(
                  s.travelers,
                  style: TextStyle(color: Colors.white.withOpacity(0.85), fontSize: 14),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _DayView extends StatelessWidget {
  final TripDay day;
  const _DayView({required this.day});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      children: [
        Text(day.title, style: Theme.of(context).textTheme.headlineMedium)
            .animate().fade().slideX(begin: -0.05),
        const SizedBox(height: 16),
        ...day.slots.asMap().entries.map(
          (e) => _SlotCard(slot: e.value, index: e.key)
              .animate(delay: Duration(milliseconds: 50 * e.key))
              .slideY(begin: 0.1, duration: 350.ms, curve: Curves.easeOut)
              .fade(),
        ),
      ],
    );
  }
}

class _SlotCard extends StatelessWidget {
  final DaySlot slot;
  final int index;
  const _SlotCard({required this.slot, required this.index});

  static const _typeConfig = {
    'attraction': (Color(0xFF00B4D8), '🏛️', '관광'),
    'meal': (AppTheme.warning, '🍽️', '식사'),
    'stay': (AppTheme.accent, '🏨', '숙박'),
    'transport': (AppTheme.textMuted, '🚗', '이동'),
  };

  @override
  Widget build(BuildContext context) {
    final config = _typeConfig[slot.type] ?? _typeConfig['attraction']!;
    final (color, emoji, label) = config;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.2)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Time column
          SizedBox(
            width: 52,
            child: Column(
              children: [
                Text(slot.time, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: color)),
                const SizedBox(height: 4),
                Container(width: 2, height: 20, color: color.withOpacity(0.3)),
                Text(emoji, style: const TextStyle(fontSize: 18)),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(slot.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
                      child: Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w500)),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(slot.address, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                if (slot.duration.isNotEmpty && slot.duration != '-') ...[
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.schedule, size: 12, color: AppTheme.textMuted),
                      const SizedBox(width: 4),
                      Text(slot.duration, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                      if (slot.cost > 0) ...[
                        const SizedBox(width: 12),
                        const Icon(Icons.monetization_on_outlined, size: 12, color: AppTheme.textMuted),
                        const SizedBox(width: 4),
                        Text('${_formatCost(slot.cost)}원', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                      ],
                    ],
                  ),
                ],
                if (slot.tip.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                    decoration: BoxDecoration(
                      color: AppTheme.warning.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppTheme.warning.withOpacity(0.2)),
                    ),
                    child: Row(
                      children: [
                        const Text('💡', style: TextStyle(fontSize: 12)),
                        const SizedBox(width: 6),
                        Expanded(child: Text(slot.tip, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.3))),
                      ],
                    ),
                  ),
                ],
                if (slot.coordinates != null) ...[
                  const SizedBox(height: 8),
                  GestureDetector(
                    onTap: () => _openMap(slot),
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
    );
  }

  void _openMap(DaySlot slot) {
    if (slot.coordinates == null) return;
    final url = 'https://maps.google.com/?q=${slot.coordinates!.lat},${slot.coordinates!.lng}';
    launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
  }

  String _formatCost(int cost) {
    if (cost >= 10000) return '${(cost / 10000).toStringAsFixed(cost % 10000 == 0 ? 0 : 1)}만';
    return cost.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]},');
  }
}

class _BottomBar extends StatelessWidget {
  final TripPlan plan;
  const _BottomBar({required this.plan});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(20, 12, 20, MediaQuery.of(context).padding.bottom + 12),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 16, offset: const Offset(0, -4))],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('총 예상 예산', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                Text(
                  '${_formatWon(plan.budget.total)}원',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppTheme.primary),
                ),
                Text('1인 ${_formatWon(plan.budget.perPerson)}원', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
              ],
            ),
          ),
          const SizedBox(width: 12),
          ElevatedButton.icon(
            onPressed: () => _showBudgetBreakdown(context, plan.budget),
            icon: const Icon(Icons.receipt_long_outlined, size: 18, color: Colors.white),
            label: const Text('예산 상세', style: TextStyle(color: Colors.white)),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.secondary, padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14)),
          ),
          const SizedBox(width: 8),
          ElevatedButton.icon(
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => RestaurantScreen(destination: plan.summary.destination))),
            icon: const Text('🍽️', style: TextStyle(fontSize: 16)),
            label: const Text('맛집', style: TextStyle(color: Colors.white)),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14)),
          ),
        ],
      ),
    );
  }

  void _showBudgetBreakdown(BuildContext context, BudgetInfo budget) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => _BudgetSheet(budget: budget),
    );
  }

  String _formatWon(int amount) {
    if (amount >= 10000) {
      final man = amount ~/ 10000;
      final rest = amount % 10000;
      return rest > 0 ? '${man}만 ${rest}' : '${man}만';
    }
    return amount.toString();
  }
}

class _BudgetSheet extends StatelessWidget {
  final BudgetInfo budget;
  const _BudgetSheet({required this.budget});

  static const _categoryEmoji = {
    '숙박': '🏨', '식비': '🍽️', '교통': '🚗', '입장료': '🎫',
    '기타': '💳', '쇼핑': '🛍️', '액티비티': '🏄',
  };

  @override
  Widget build(BuildContext context) {
    final total = budget.total;
    return Padding(
      padding: EdgeInsets.fromLTRB(24, 16, 24, MediaQuery.of(context).padding.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(child: Container(width: 36, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)))),
          const SizedBox(height: 20),
          Text('예산 상세', style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 4),
          Text('총 ${_formatWon(total)}원 · 1인 ${_formatWon(budget.perPerson)}원', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
          const SizedBox(height: 20),
          ...budget.breakdown.entries.map((e) {
            final pct = total > 0 ? e.value / total : 0.0;
            return _BudgetRow(
              emoji: _categoryEmoji[e.key] ?? '💰',
              label: e.key,
              amount: e.value,
              percent: pct,
            );
          }),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.07), borderRadius: BorderRadius.circular(14)),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('합계', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                Text('${_formatWon(total)}원', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: AppTheme.primary)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatWon(int amount) {
    if (amount >= 10000) {
      final man = amount ~/ 10000;
      final rest = amount % 10000;
      return rest > 0 ? '${man}만 ${rest}원' : '${man}만원';
    }
    return '${amount}원';
  }
}

class _BudgetRow extends StatelessWidget {
  final String emoji;
  final String label;
  final int amount;
  final double percent;
  const _BudgetRow({required this.emoji, required this.label, required this.amount, required this.percent});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 20)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(label, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
                    Text(
                      '${(percent * 100).toStringAsFixed(0)}%  ${_formatWon(amount)}원',
                      style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: percent,
                    backgroundColor: Colors.grey[100],
                    color: AppTheme.primary,
                    minHeight: 6,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatWon(int amount) {
    if (amount >= 10000) return '${amount ~/ 10000}만';
    return amount.toString();
  }
}

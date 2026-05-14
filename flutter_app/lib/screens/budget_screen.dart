import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';

class BudgetScreen extends StatefulWidget {
  const BudgetScreen({super.key});

  @override
  State<BudgetScreen> createState() => _BudgetScreenState();
}

class _BudgetScreenState extends State<BudgetScreen> {
  final _destController = TextEditingController(text: '제주도');
  int _days = 3;
  int _travelers = 2;
  String _style = 'mid';
  Map<String, dynamic>? _result;
  bool _isLoading = false;

  static const _styles = [
    ('budget', '절약', '₩', Color(0xFF3FB950)),
    ('mid', '일반', '₩₩', Color(0xFF00B4D8)),
    ('luxury', '럭셔리', '₩₩₩', Color(0xFFFF6B35)),
  ];

  @override
  void dispose() {
    _destController.dispose();
    super.dispose();
  }

  Future<void> _estimate() async {
    setState(() { _isLoading = true; _result = null; });
    try {
      final r = await ApiService().estimateBudget(
        destination: _destController.text.trim(),
        days: _days,
        travelers: _travelers,
        style: _style,
      );
      setState(() => _result = r);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('여행 예산 계산기')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _ConfigCard(
              destController: _destController,
              days: _days,
              travelers: _travelers,
              style: _style,
              styles: _styles,
              onDaysChanged: (v) => setState(() => _days = v),
              onTravelersChanged: (v) => setState(() => _travelers = v),
              onStyleChanged: (v) => setState(() => _style = v),
            ).animate().fade().slideY(begin: 0.05),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _estimate,
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                child: _isLoading
                    ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                    : const Text('예산 계산하기 💰', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 16)),
              ),
            ).animate(delay: 100.ms).fade(),
            if (_result != null) ...[
              const SizedBox(height: 24),
              _ResultCard(result: _result!, days: _days, travelers: _travelers)
                  .animate().scale(begin: const Offset(0.95, 0.95), duration: 400.ms, curve: Curves.easeOut).fade(),
            ],
          ],
        ),
      ),
    );
  }
}

class _ConfigCard extends StatelessWidget {
  final TextEditingController destController;
  final int days, travelers;
  final String style;
  final List<(String, String, String, Color)> styles;
  final ValueChanged<int> onDaysChanged, onTravelersChanged;
  final ValueChanged<String> onStyleChanged;

  const _ConfigCard({
    required this.destController,
    required this.days,
    required this.travelers,
    required this.style,
    required this.styles,
    required this.onDaysChanged,
    required this.onTravelersChanged,
    required this.onStyleChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF0E8DF)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('여행 정보 입력', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 16),
          TextField(
            controller: destController,
            decoration: const InputDecoration(labelText: '여행지', prefixIcon: Icon(Icons.location_on_outlined, size: 18)),
          ),
          const SizedBox(height: 16),
          _CounterRow(label: '여행 기간', unit: '박', value: days, min: 1, max: 14, onChanged: onDaysChanged),
          const SizedBox(height: 12),
          _CounterRow(label: '인원', unit: '명', value: travelers, min: 1, max: 10, onChanged: onTravelersChanged),
          const SizedBox(height: 16),
          Text('여행 스타일', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 10),
          Row(
            children: styles.map((s) {
              final (id, label, price, color) = s;
              final isSelected = id == style;
              return Expanded(
                child: GestureDetector(
                  onTap: () => onStyleChanged(id),
                  child: AnimatedContainer(
                    duration: 200.ms,
                    margin: EdgeInsets.only(right: id != styles.last.$1 ? 8 : 0),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: isSelected ? color.withOpacity(0.12) : AppTheme.cardBg,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: isSelected ? color : AppTheme.divider, width: isSelected ? 2 : 1),
                    ),
                    child: Column(
                      children: [
                        Text(price, style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.w800)),
                        const SizedBox(height: 4),
                        Text(label, style: TextStyle(fontSize: 12, color: isSelected ? color : AppTheme.textSecondary, fontWeight: FontWeight.w500)),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _CounterRow extends StatelessWidget {
  final String label, unit;
  final int value, min, max;
  final ValueChanged<int> onChanged;
  const _CounterRow({required this.label, required this.unit, required this.value, required this.min, required this.max, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
        const Spacer(),
        IconButton(
          onPressed: value > min ? () => onChanged(value - 1) : null,
          icon: const Icon(Icons.remove_circle_outline),
          color: AppTheme.primary,
          iconSize: 28,
        ),
        SizedBox(
          width: 52,
          child: Text('$value$unit', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700), textAlign: TextAlign.center),
        ),
        IconButton(
          onPressed: value < max ? () => onChanged(value + 1) : null,
          icon: const Icon(Icons.add_circle_outline),
          color: AppTheme.primary,
          iconSize: 28,
        ),
      ],
    );
  }
}

class _ResultCard extends StatelessWidget {
  final Map<String, dynamic> result;
  final int days, travelers;
  const _ResultCard({required this.result, required this.days, required this.travelers});

  static const _categoryEmoji = {
    '숙박': '🏨', '식비': '🍽️', '교통': '🚗', '입장료': '🎫',
    '기타': '💳', '액티비티': '🏄', '쇼핑': '🛍️',
    '목적지 교통': '✈️',
  };

  @override
  Widget build(BuildContext context) {
    final total = (result['total'] as num?)?.toInt() ?? 0;
    final perPerson = (result['perPerson'] as num?)?.toInt() ?? 0;
    final breakdown = (result['breakdown'] as Map<String, dynamic>? ?? {})
        .map((k, v) => MapEntry(k, (v as num?)?.toInt() ?? 0));

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF0E8DF)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('예상 총 예산', style: Theme.of(context).textTheme.titleLarge),
              const Spacer(),
              Text(_formatWon(total), style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppTheme.primary)),
            ],
          ),
          Text('$days박${days+1}일 · $travelers명 · 1인당 ${_formatWon(perPerson)}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
          const SizedBox(height: 20),
          ...breakdown.entries.map((e) {
            final pct = total > 0 ? e.value / total : 0.0;
            return _BudgetRow(
              emoji: _categoryEmoji[e.key] ?? '💰',
              label: e.key,
              amount: e.value,
              percent: pct,
            );
          }),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFFFFF3E0), Color(0xFFFFFDE7)]),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppTheme.warning.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                const Text('💡', style: TextStyle(fontSize: 18)),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    '실제 비용은 예약 시기, 시즌, 선택에 따라 ±30% 차이가 날 수 있어요',
                    style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.4),
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
    if (amount >= 10000) {
      final man = amount ~/ 10000;
      final rest = amount % 10000;
      return rest > 0 ? '${man}만 ${_fmt(rest)}원' : '${man}만원';
    }
    return '${_fmt(amount)}원';
  }

  String _fmt(int n) => n.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]},');
}

class _BudgetRow extends StatelessWidget {
  final String emoji, label;
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
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(label, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
                    Text(
                      '${(percent * 100).toStringAsFixed(0)}%',
                      style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(value: percent, backgroundColor: Colors.grey[100], color: AppTheme.primary, minHeight: 5),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Text(
            _fmtWon(amount),
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
          ),
        ],
      ),
    );
  }

  String _fmtWon(int n) {
    if (n >= 10000) return '${n ~/ 10000}만원';
    return '${n}원';
  }
}

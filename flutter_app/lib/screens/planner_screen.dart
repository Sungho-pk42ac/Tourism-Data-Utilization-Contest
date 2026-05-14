import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../models/trip_plan.dart';
import 'itinerary_screen.dart';

class PlannerScreen extends StatefulWidget {
  final String? initialDestination;
  const PlannerScreen({super.key, this.initialDestination});

  @override
  State<PlannerScreen> createState() => _PlannerScreenState();
}

class _PlannerScreenState extends State<PlannerScreen> {
  final _queryController = TextEditingController();
  final _focusNode = FocusNode();
  bool _isLoading = false;
  String? _error;

  static const _exampleQueries = [
    '👫 부부 2명이 제주도 3박 4일 여행 계획 짜줘',
    '👨‍👩‍👧‍👦 가족 4명 부산 2박 3일, 아이들도 좋아할 코스로',
    '🎒 혼자 경주 1박 2일 역사 문화 탐방',
    '👯 친구 3명 강원도 설악산 트레킹 2일',
    '🌸 연인 제주 서부 힐링 여행 2박 3일',
  ];

  static const _quickTags = ['제주도', '부산', '경주', '전주', '강릉', '설악산', '서울', '여수'];

  @override
  void initState() {
    super.initState();
    if (widget.initialDestination != null) {
      _queryController.text = '${widget.initialDestination} 여행 ';
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _focusNode.requestFocus();
        _queryController.selection = TextSelection.fromPosition(
          TextPosition(offset: _queryController.text.length),
        );
      });
    }
  }

  @override
  void dispose() {
    _queryController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  Future<void> _planTrip() async {
    final query = _queryController.text.trim();
    if (query.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('여행 계획을 입력해주세요 😊')),
      );
      return;
    }
    setState(() { _isLoading = true; _error = null; });
    try {
      final plan = await ApiService().planTrip(query);
      if (!mounted) return;
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => ItineraryScreen(plan: plan, query: query)),
      );
    } catch (e) {
      setState(() { _error = e.toString(); });
    } finally {
      if (mounted) setState(() { _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('여행 계획 만들기'),
        leading: const BackButton(),
      ),
      body: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _Header().animate().slideY(begin: -0.1, duration: 400.ms).fade(),
              const SizedBox(height: 24),
              _InputCard(
                controller: _queryController,
                focusNode: _focusNode,
                onSubmit: _planTrip,
                isLoading: _isLoading,
                error: _error,
              ).animate().slideY(begin: 0.1, duration: 400.ms, delay: 100.ms).fade(),
              const SizedBox(height: 20),
              _QuickTagsRow(
                tags: _quickTags,
                onTap: (tag) {
                  _queryController.text = '$tag 여행 ';
                  _queryController.selection = TextSelection.fromPosition(
                    TextPosition(offset: _queryController.text.length),
                  );
                  _focusNode.requestFocus();
                },
              ).animate().fade(delay: 200.ms),
              const SizedBox(height: 28),
              Text('이렇게 입력해보세요', style: Theme.of(context).textTheme.titleMedium)
                  .animate().fade(delay: 300.ms),
              const SizedBox(height: 12),
              ..._exampleQueries.asMap().entries.map(
                (e) => _ExampleQueryCard(
                  query: e.value,
                  onTap: () {
                    _queryController.text = e.value.replaceAll(RegExp(r'^[^\s]+ '), '');
                    _focusNode.requestFocus();
                  },
                ).animate(delay: Duration(milliseconds: 300 + e.key * 60)).slideX(begin: 0.1, duration: 350.ms).fade(),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFF6B35), Color(0xFFFFB347)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('AI 여행 플래너', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800)),
                SizedBox(height: 6),
                Text(
                  '누구와, 며칠, 어디로 가는지\n자연어로 입력하면 완벽한 일정을 만들어드려요',
                  style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(16)),
            child: const Center(child: Text('🤖', style: TextStyle(fontSize: 30))),
          ),
        ],
      ),
    );
  }
}

class _InputCard extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final VoidCallback onSubmit;
  final bool isLoading;
  final String? error;

  const _InputCard({
    required this.controller,
    required this.focusNode,
    required this.onSubmit,
    required this.isLoading,
    this.error,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: error != null ? AppTheme.error : const Color(0xFFF0E8DF)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextField(
            controller: controller,
            focusNode: focusNode,
            maxLines: 4,
            minLines: 3,
            decoration: const InputDecoration(
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
              filled: false,
              hintText: '예) 가족 4명 제주도 3박 4일 바다 위주로 계획 짜줘\n    친구 2명 부산 1박 2일 맛집 투어',
              hintMaxLines: 3,
            ),
            textInputAction: TextInputAction.newline,
            onSubmitted: (_) => onSubmit(),
          ),
          if (error != null) ...[
            const SizedBox(height: 8),
            Text(error!, style: const TextStyle(color: AppTheme.error, fontSize: 12)),
          ],
          const Divider(color: Color(0xFFF0E8DF)),
          const SizedBox(height: 8),
          SizedBox(
            height: 50,
            child: ElevatedButton(
              onPressed: isLoading ? null : onSubmit,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: isLoading
                  ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                  : const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('✈️', style: TextStyle(fontSize: 18)),
                        SizedBox(width: 8),
                        Text('AI 여행 계획 생성', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickTagsRow extends StatelessWidget {
  final List<String> tags;
  final ValueChanged<String> onTap;
  const _QuickTagsRow({required this.tags, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: tags.map((tag) => GestureDetector(
        onTap: () => onTap(tag),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: AppTheme.primary.withOpacity(0.08),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppTheme.primary.withOpacity(0.3)),
          ),
          child: Text(tag, style: const TextStyle(color: AppTheme.primary, fontSize: 13, fontWeight: FontWeight.w500)),
        ),
      )).toList(),
    );
  }
}

class _ExampleQueryCard extends StatelessWidget {
  final String query;
  final VoidCallback onTap;
  const _ExampleQueryCard({required this.query, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFF0E8DF)),
        ),
        child: Row(
          children: [
            Expanded(child: Text(query, style: const TextStyle(fontSize: 14, color: AppTheme.textPrimary))),
            const Icon(Icons.north_west, size: 16, color: AppTheme.textMuted),
          ],
        ),
      ),
    );
  }
}

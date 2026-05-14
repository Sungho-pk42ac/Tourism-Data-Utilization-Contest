import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_theme.dart';
import 'planner_screen.dart';
import 'restaurant_screen.dart';
import 'weather_screen.dart';
import 'budget_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  static const _popularDestinations = [
    _Destination('제주도', '🏝️', '에메랄드빛 바다와 한라산', Color(0xFF00B4D8)),
    _Destination('부산', '🌊', '해운대와 광안대교 야경', Color(0xFF0077B6)),
    _Destination('경주', '🏛️', '천년 역사 신라의 고도', Color(0xFFD4A017)),
    _Destination('전주', '🏯', '한옥마을과 비빔밥 성지', Color(0xFF2D9A4A)),
    _Destination('강릉', '☕', '커피거리와 경포대 해변', Color(0xFF6B4423)),
    _Destination('설악산', '⛰️', '국립공원 단풍과 설경', Color(0xFFE85D04)),
  ];

  static const _quickActions = [
    _QuickAction('🗺️', '여행 계획', '자연어로 입력', Colors.orange),
    _QuickAction('🍽️', '맛집 찾기', '지역별 맛집', Colors.red),
    _QuickAction('🌤️', '날씨 확인', '여행지 날씨', Colors.blue),
    _QuickAction('💰', '예산 계산', '스타일별 예산', Colors.green),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          _HeroSliverAppBar(),
          SliverToBoxAdapter(child: _QuickActionsSection(actions: _quickActions)),
          SliverToBoxAdapter(child: _SectionHeader(title: '인기 여행지', subtitle: '지금 뜨는 국내 여행지')),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverGrid(
              delegate: SliverChildBuilderDelegate(
                (ctx, i) => _DestinationCard(dest: _popularDestinations[i], index: i),
                childCount: _popularDestinations.length,
              ),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.1,
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 32)),
          SliverToBoxAdapter(child: _TipsBanner()),
          const SliverToBoxAdapter(child: SizedBox(height: 80)),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PlannerScreen())),
        backgroundColor: AppTheme.primary,
        icon: const Text('✈️', style: TextStyle(fontSize: 18)),
        label: const Text('여행 계획 시작', style: TextStyle(fontWeight: FontWeight.w600, color: Colors.white)),
      ),
    );
  }
}

class _HeroSliverAppBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SliverAppBar(
      expandedHeight: 280,
      pinned: true,
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            Container(decoration: const BoxDecoration(gradient: AppTheme.heroGradient)),
            Positioned(
              right: -40,
              top: -40,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withOpacity(0.08),
                ),
              ),
            ),
            Positioned(
              left: -20,
              bottom: 20,
              child: Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withOpacity(0.06),
                ),
              ),
            ),
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('TripMate AI', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(20)),
                          child: const Text('AI 여행 도우미', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500)),
                        ),
                      ],
                    ),
                    const Spacer(),
                    const Text(
                      '어디로\n떠나볼까요?',
                      style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w800, height: 1.2, letterSpacing: -0.5),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      '자연어로 말하면 AI가 완벽한 여행 코스를 만들어드려요',
                      style: TextStyle(color: Colors.white70, fontSize: 14),
                    ),
                    const SizedBox(height: 16),
                    GestureDetector(
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const PlannerScreen()),
                      ),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 12, offset: const Offset(0, 4))],
                        ),
                        child: Row(
                          children: [
                            const Text('💬', style: TextStyle(fontSize: 18)),
                            const SizedBox(width: 10),
                            Text(
                              '여행 계획을 입력해보세요...',
                              style: TextStyle(color: Colors.grey[400], fontSize: 14),
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(color: AppTheme.primary, shape: BoxShape.circle),
                              child: const Icon(Icons.arrow_forward_ios, color: Colors.white, size: 12),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickActionsSection extends StatelessWidget {
  final List<_QuickAction> actions;
  const _QuickActionsSection({required this.actions});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 8),
      child: Row(
        children: actions.asMap().entries.map((entry) {
          final i = entry.key;
          final action = entry.value;
          return Expanded(
            child: GestureDetector(
              onTap: () => _onTap(context, i),
              child: Container(
                margin: EdgeInsets.only(right: i < actions.length - 1 ? 8 : 0),
                padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFF0E8DF)),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
                ),
                child: Column(
                  children: [
                    Text(action.emoji, style: const TextStyle(fontSize: 24)),
                    const SizedBox(height: 6),
                    Text(action.title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.textPrimary), textAlign: TextAlign.center),
                    Text(action.subtitle, style: const TextStyle(fontSize: 9, color: AppTheme.textMuted), textAlign: TextAlign.center),
                  ],
                ),
              ),
            ).animate(delay: Duration(milliseconds: 100 * i)).slideY(begin: 0.2, duration: 400.ms, curve: Curves.easeOut).fade(),
          );
        }).toList(),
      ),
    );
  }

  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const PlannerScreen()));
      case 1:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const RestaurantScreen()));
      case 2:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const WeatherScreen()));
      case 3:
        Navigator.push(context, MaterialPageRoute(builder: (_) => const BudgetScreen()));
    }
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final String subtitle;
  const _SectionHeader({required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: Theme.of(context).textTheme.headlineMedium),
              Text(subtitle, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
            ],
          ),
        ],
      ),
    );
  }
}

class _DestinationCard extends StatelessWidget {
  final _Destination dest;
  final int index;
  const _DestinationCard({required this.dest, required this.index});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => PlannerScreen(initialDestination: dest.name)),
      ),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [dest.color.withOpacity(0.15), dest.color.withOpacity(0.05)],
          ),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: dest.color.withOpacity(0.3)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(dest.emoji, style: const TextStyle(fontSize: 32)),
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(color: dest.color.withOpacity(0.15), shape: BoxShape.circle),
                    child: Icon(Icons.arrow_forward, color: dest.color, size: 14),
                  ),
                ],
              ),
              const Spacer(),
              Text(dest.name, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: dest.color)),
              const SizedBox(height: 4),
              Text(dest.subtitle, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary, height: 1.3)),
            ],
          ),
        ),
      ).animate(delay: Duration(milliseconds: 80 * index)).scale(begin: const Offset(0.92, 0.92), duration: 400.ms, curve: Curves.easeOut).fade(),
    );
  }
}

class _TipsBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFF6B35), Color(0xFFFF8C42)],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          const Text('💡', style: TextStyle(fontSize: 32)),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('여행 꿀팁', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 16)),
                const SizedBox(height: 4),
                Text(
                  '"가족 4명 제주도 3박 4일 바다 위주로 짜줘" 처럼 자연스럽게 입력하면 AI가 맞춤 일정을 만들어요!',
                  style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 13, height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Destination {
  final String name;
  final String emoji;
  final String subtitle;
  final Color color;
  const _Destination(this.name, this.emoji, this.subtitle, this.color);
}

class _QuickAction {
  final String emoji;
  final String title;
  final String subtitle;
  final Color color;
  const _QuickAction(this.emoji, this.title, this.subtitle, this.color);
}

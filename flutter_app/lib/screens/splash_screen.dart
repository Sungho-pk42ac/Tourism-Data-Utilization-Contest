import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_theme.dart';
import 'home_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _bgController;

  @override
  void initState() {
    super.initState();
    _bgController = AnimationController(vsync: this, duration: const Duration(seconds: 8))
      ..repeat(reverse: true);
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        Navigator.of(context).pushReplacement(
          PageRouteBuilder(
            pageBuilder: (_, a1, a2) => const HomeScreen(),
            transitionsBuilder: (_, a1, __, child) =>
                FadeTransition(opacity: a1, child: child),
            transitionDuration: const Duration(milliseconds: 600),
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _bgController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Animated gradient background
          AnimatedBuilder(
            animation: _bgController,
            builder: (_, __) {
              final t = _bgController.value;
              return Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment(-1 + t * 0.5, -1),
                    end: Alignment(1 - t * 0.5, 1),
                    colors: const [
                      Color(0xFFFF6B35),
                      Color(0xFFFF8C42),
                      Color(0xFFFFB347),
                      Color(0xFF00B4D8),
                      Color(0xFF023E8A),
                    ],
                    stops: [0, 0.25 + t * 0.1, 0.5, 0.75 - t * 0.1, 1],
                  ),
                ),
              );
            },
          ),

          // Floating circles decoration
          ..._buildFloatingCircles(),

          // Content
          SafeArea(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(flex: 2),

                // Logo area
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.25),
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(color: Colors.white.withOpacity(0.5), width: 2),
                  ),
                  child: const Center(
                    child: Text('✈️', style: TextStyle(fontSize: 48)),
                  ),
                )
                    .animate()
                    .scale(delay: 200.ms, duration: 600.ms, curve: Curves.elasticOut)
                    .fade(duration: 400.ms),

                const SizedBox(height: 28),

                Text(
                  'TripMate AI',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(
                    color: Colors.white,
                    fontSize: 38,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -1,
                  ),
                )
                    .animate()
                    .slideY(begin: 0.3, duration: 600.ms, delay: 400.ms, curve: Curves.easeOut)
                    .fade(delay: 400.ms, duration: 500.ms),

                const SizedBox(height: 12),

                Text(
                  'AI가 만드는 나만의 완벽한 여행',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Colors.white.withOpacity(0.9),
                    fontWeight: FontWeight.w400,
                  ),
                )
                    .animate()
                    .fade(delay: 700.ms, duration: 500.ms),

                const Spacer(flex: 2),

                // Destination chips
                _DestinationChipRow()
                    .animate()
                    .slideY(begin: 0.4, duration: 600.ms, delay: 900.ms, curve: Curves.easeOut)
                    .fade(delay: 900.ms, duration: 500.ms),

                const SizedBox(height: 48),

                // Loading indicator
                SizedBox(
                  width: 40,
                  height: 3,
                  child: LinearProgressIndicator(
                    backgroundColor: Colors.white.withOpacity(0.3),
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(2),
                  ),
                )
                    .animate()
                    .fade(delay: 1200.ms, duration: 400.ms),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildFloatingCircles() {
    final rand = Random(42);
    return List.generate(8, (i) {
      final size = 60.0 + rand.nextDouble() * 100;
      final x = rand.nextDouble();
      final y = rand.nextDouble();
      return Positioned(
        left: x * MediaQuery.sizeOf(context).width,
        top: y * MediaQuery.sizeOf(context).height,
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.white.withOpacity(0.05 + rand.nextDouble() * 0.08),
          ),
        ),
      );
    });
  }
}

class _DestinationChipRow extends StatelessWidget {
  const _DestinationChipRow();

  static const _destinations = ['🏝️ 제주도', '🌸 경주', '🌊 부산', '⛰️ 설악산', '🏙️ 서울', '🌿 전주'];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 40,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 24),
        itemCount: _destinations.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (_, i) => Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.2),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white.withOpacity(0.4)),
          ),
          child: Text(
            _destinations[i],
            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500),
          ),
        ),
      ),
    );
  }
}

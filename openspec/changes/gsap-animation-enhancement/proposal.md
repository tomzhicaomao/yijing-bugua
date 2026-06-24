## Why

The Yijing Bugua app currently relies on CSS transitions and keyframe animations for visual effects. While functional, these lack the precision, control, and performance optimizations needed for a premium divination experience. GSAP (GreenSock Animation Platform) offers superior animation control, physics-based easing, timeline sequencing, and ScrollTrigger for scroll-driven animations. Integrating GSAP will transform the app's visual appeal and performance, especially for the coin toss ritual and hexagram reveal sequences.

## What Changes

- Install GSAP and @gsap/react dependencies
- Replace CSS keyframe coin-toss animation with GSAP timeline for realistic physics-based coin flipping
- Add staggered hexagram line reveal animation using GSAP stagger
- Implement page transition animations between divination steps (question → prediction → method → casting)
- Add ScrollTrigger animations for stats and feedback sections
- Optimize performance with GSAP's transform/opacity focus and will-change hints
- Respect prefers-reduced-motion using gsap.matchMedia()

## Capabilities

### New Capabilities
- `gsap-coin-animation`: Physics-based coin toss animation replacing CSS keyframes
- `gsap-hexagram-reveal`: Staggered yin/yang line reveal animation for hexagram display
- `gsap-page-transitions`: Smooth transitions between divination wizard steps
- `gsap-scroll-animations`: ScrollTrigger-based animations for stats, feedback, and history sections
- `gsap-performance-optimization`: Performance best practices including transform/opacity focus and cleanup

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- Dependencies: Add gsap, @gsap/react to package.json
- Components affected: VirtualCoins.tsx, HexagramBoard.tsx, DivineView.tsx, ResultView.tsx, StatsView.tsx, FeedbackView.tsx
- CSS: Remove coin-toss keyframe animation from index.css
- Performance: Improved animation performance with GSAP's compositor-friendly transforms
- Accessibility: Proper reduced-motion support via gsap.matchMedia()

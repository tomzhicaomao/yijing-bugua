## 1. Setup and Dependencies

- [ ] 1.1 Install GSAP and @gsap/react packages
- [ ] 1.2 Add GSAP types to TypeScript configuration
- [ ] 1.3 Create GSAP utility hooks (useGSAPContext, useScrollTrigger)
- [ ] 1.4 Set up gsap.matchMedia() for reduced motion support

## 2. Coin Animation Implementation

- [ ] 2.1 Remove CSS coin-toss keyframe animation from index.css
- [ ] 2.2 Refactor VirtualCoins.tsx to use GSAP timeline
- [ ] 2.3 Implement physics-based coin flip animation (rotateY, scale)
- [ ] 2.4 Add staggered timing between coins (0.08s delay)
- [ ] 2.5 Add coin landing bounce effect with elastic easing
- [ ] 2.6 Implement reduced motion fallback

## 3. Hexagram Reveal Animation

- [ ] 3.1 Add GSAP animation to HexagramBoard.tsx
- [ ] 3.2 Implement staggered line reveal (0.1s stagger)
- [ ] 3.3 Add yin/yang specific animation effects
- [ ] 3.4 Implement changing line pulse animation
- [ ] 3.5 Add board entrance/exit animations

## 4. Page Transitions

- [ ] 4.1 Create PageTransition wrapper component
- [ ] 4.2 Implement step transition animations in DivineView.tsx
- [ ] 4.3 Add step indicator animation (dot activation)
- [ ] 4.4 Implement content swap animations within steps
- [ ] 4.5 Add loading state animation for AI interpretation

## 5. Scroll Animations

- [ ] 5.1 Add ScrollTrigger to StatsView.tsx for counter animation
- [ ] 5.2 Implement stats cards stagger animation
- [ ] 5.3 Add ScrollTrigger to FeedbackView.tsx
- [ ] 5.4 Implement history list stagger animation
- [ ] 5.5 Add ScrollTrigger cleanup and refresh optimization

## 6. Performance Optimization

- [ ] 6.1 Audit all animations for transform/opacity only
- [ ] 6.2 Add will-change hints to animated elements
- [ ] 6.3 Implement proper cleanup for all GSAP contexts
- [ ] 6.4 Test animation performance on mobile devices
- [ ] 6.5 Verify 60fps performance with Chrome DevTools

## 7. Testing and Polish

- [ ] 7.1 Test reduced motion preferences
- [ ] 7.2 Verify animation cleanup on component unmount
- [ ] 7.3 Test on various screen sizes and devices
- [ ] 7.4 Adjust easing curves to match Nothing Design aesthetic
- [ ] 7.5 Document GSAP usage patterns for team

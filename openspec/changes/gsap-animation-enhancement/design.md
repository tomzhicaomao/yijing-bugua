## Context

The Yijing Bugua app is a React 19 + TypeScript + Vite application with Tailwind CSS v4. It currently uses CSS transitions and keyframe animations for visual effects, including a coin-toss animation. The app follows Nothing Design aesthetic (minimalist, monochrome, monospace fonts). GSAP will be integrated to enhance animation control, performance, and add new animation capabilities.

## Goals / Non-Goals

**Goals:**
- Replace CSS coin-toss animation with GSAP timeline for realistic physics-based motion
- Add staggered hexagram line reveal animation
- Implement smooth page transitions between divination steps
- Add ScrollTrigger animations for stats and feedback sections
- Optimize performance using GSAP's transform/opacity focus
- Respect prefers-reduced-motion using gsap.matchMedia()
- Maintain Nothing Design aesthetic with subtle, elegant animations

**Non-Goals:**
- Replace all CSS transitions (simple hover effects remain CSS)
- Add complex 3D animations that conflict with minimalist design
- Implement page-level route transitions (keep current page-based navigation)
- Add interactive drag/swipe gestures

## Decisions

### 1. GSAP over Framer Motion
**Decision**: Use GSAP instead of Framer Motion (currently in package.json as "motion")
**Rationale**: 
- GSAP provides timeline sequencing for complex multi-step animations
- Built-in ScrollTrigger for scroll-driven animations
- Better performance with compositor-friendly transforms
- Physics-based easing (elastic, bounce) for realistic coin toss
- Framework-agnostic (works with React, Vue, vanilla JS)

**Alternatives considered**:
- Framer Motion: Declarative but limited for complex sequences
- CSS animations: Limited control and no timeline sequencing
- React Spring: Good for physics but lacks ScrollTrigger

### 2. Component-level GSAP Integration
**Decision**: Integrate GSAP at component level using useRef and useEffect
**Rationale**:
- Each component manages its own animations
- Easy cleanup on unmount
- Follows React patterns
- Can use @gsap/react useGSAP hook for simpler cleanup

### 3. Animation Scope
**Decision**: Focus on 5 key animation surfaces
**Rationale**:
- Coin toss ritual (most impactful)
- Hexagram line reveal (visual feedback)
- Page transitions (user flow)
- Stats/feedback scroll animations (engagement)
- Performance optimization (technical debt)

### 4. Accessibility First
**Decision**: Use gsap.matchMedia() for prefers-reduced-motion
**Rationale**:
- Respects user preferences
- Improves accessibility for users with vestibular disorders
- Can disable or reduce animations when preferred

## Risks / Trade-offs

**[Risk]** GSAP bundle size increase (~30KB gzipped)
→ **Mitigation**: Tree-shake unused plugins; GSAP core is ~25KB

**[Risk]** Learning curve for team members unfamiliar with GSAP
→ **Mitigation**: Comprehensive GSAP skills already installed; use well-documented patterns

**[Risk]** Animation performance on low-end devices
→ **Mitigation**: Use will-change hints; avoid animating layout properties; test on mobile

**[Risk]** Breaking existing CSS transitions
→ **Mitigation**: Keep simple hover/focus transitions in CSS; only replace complex animations

**[Risk]** Over-animation conflicting with Nothing Design minimalism
→ **Mitigation**: Use subtle easing (power1.out, power2.out); keep durations short (0.3-0.6s)

## Migration Plan

1. Install GSAP dependencies
2. Create GSAP utility hooks and components
3. Implement coin toss animation (highest impact)
4. Add hexagram reveal animation
5. Implement page transitions
6. Add ScrollTrigger animations
7. Performance audit and optimization
8. Remove unused CSS animations

## Open Questions

- Should we keep framer-motion for simple component animations or fully replace?
- What specific easing curves best match Nothing Design aesthetic?
- Should page transitions be fade, slide, or combination?

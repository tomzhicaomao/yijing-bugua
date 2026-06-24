## ADDED Requirements

### Requirement: Physics-based coin toss animation
The system SHALL replace the CSS keyframe coin-toss animation with a GSAP timeline that provides realistic physics-based coin flipping motion.

#### Scenario: Coin toss with realistic physics
- **WHEN** user clicks the toss button
- **THEN** each coin SHALL animate with physics-based easing (elastic, back, or bounce) and staggered timing (0.08s between coins)

#### Scenario: Coin rotation and scale
- **WHEN** coin toss animation plays
- **THEN** each coin SHALL rotate 360 degrees on Y-axis with perspective transform and scale up/down during flip

#### Scenario: Coin landing animation
- **WHEN** coin toss completes
- **THEN** coins SHALL settle with a subtle bounce effect and display final face (front/back)

### Requirement: Staggered coin timing
The system SHALL stagger the coin toss animation so coins don't flip simultaneously.

#### Scenario: Staggered animation start
- **WHEN** coin toss animation begins
- **THEN** coin 1 starts immediately, coin 2 starts after 0.08s delay, coin 3 starts after 0.16s delay

#### Scenario: Individual coin control
- **WHEN** animation is playing
- **THEN** each coin's animation SHALL be independently controllable (pause, reverse, kill)

### Requirement: Reduced motion support
The system SHALL respect user's prefers-reduced-motion setting.

#### Scenario: Reduced motion preference
- **WHEN** user has prefers-reduced-motion: reduce enabled
- **THEN** coin toss animation SHALL be skipped or reduced to simple opacity transition

### Requirement: Performance optimization
The system SHALL optimize coin animation for 60fps performance.

#### Scenario: Transform-only animation
- **WHEN** coin animation plays
- **THEN** only transform and opacity properties SHALL be animated (no layout properties)

#### Scenario: Cleanup on unmount
- **WHEN** component unmounts
- **THEN** all GSAP animations SHALL be killed to prevent memory leaks

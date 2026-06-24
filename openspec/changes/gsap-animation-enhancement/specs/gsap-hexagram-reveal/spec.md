## ADDED Requirements

### Requirement: Staggered hexagram line reveal
The system SHALL animate hexagram lines appearing one by one with staggered timing.

#### Scenario: Line-by-line reveal
- **WHEN** hexagram is generated
- **THEN** each line SHALL appear with 0.1s stagger, animating from opacity 0 to 1 and sliding into position

#### Scenario: Yin/yang line animation
- **WHEN** yin or yang line appears
- **THEN** line SHALL animate with appropriate visual effect (yin: broken line draws in, yang: solid line draws in)

### Requirement: Changing line highlight
The system SHALL animate changing lines (动爻) with special visual effects.

#### Scenario: Changing line pulse
- **WHEN** line is marked as changing
- **THEN** line SHALL have subtle pulse animation using GSAP repeat/yoyo

#### Scenario: Changing line color transition
- **WHEN** changing line is identified
- **THEN** line background SHALL animate to accent color with smooth transition

### Requirement: Hexagram board entrance animation
The system SHALL animate the entire hexagram board entrance.

#### Scenario: Board entrance
- **WHEN** hexagram board appears
- **THEN** board SHALL fade in and slide up slightly using GSAP from() animation

#### Scenario: Board exit
- **WHEN** hexagram board disappears
- **THEN** board SHALL fade out and slide down using GSAP to() animation

### Requirement: Reduced motion support
The system SHALL respect reduced motion preferences for hexagram animations.

#### Scenario: Reduced motion
- **WHEN** prefers-reduced-motion is enabled
- **THEN** hexagram lines SHALL appear instantly without animation

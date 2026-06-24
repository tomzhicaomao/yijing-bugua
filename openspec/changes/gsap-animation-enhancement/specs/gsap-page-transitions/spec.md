## ADDED Requirements

### Requirement: Step transition animations
The system SHALL animate transitions between divination wizard steps.

#### Question to Before-Divination transition
- **WHEN** user completes question step
- **THEN** question content SHALL fade out and slide left, before-divination content SHALL fade in and slide from right

#### Before-Divination to Method transition
- **WHEN** user completes before-divination step
- **THEN** content SHALL crossfade with subtle vertical movement

#### Method to Casting transition
- **WHEN** user selects casting method
- **THEN** method selection SHALL collapse and casting interface SHALL expand with GSAP timeline

### Requirement: Step indicator animation
The system SHALL animate the step indicator progress.

#### Step dot activation
- **WHEN** step becomes active
- **THEN** step dot SHALL scale up and change color with GSAP animation

#### Step completion animation
- **WHEN** step is completed
- **THEN** step dot SHALL animate to completed state with checkmark or fill effect

### Requirement: Content area transitions
The system SHALL animate content area changes within steps.

#### Content swap animation
- **WHEN** content changes within a step
- **THEN** old content SHALL fade out, new content SHALL fade in with GSAP timeline

#### Loading state animation
- **WHEN** AI interpretation is loading
- **THEN** loading indicator SHALL use GSAP-animated progress or spinner

### Requirement: Reduced motion support
The system SHALL provide instant transitions when reduced motion is preferred.

#### Reduced motion transitions
- **WHEN** prefers-reduced-motion is enabled
- **THEN** all step transitions SHALL be instant (no animation)

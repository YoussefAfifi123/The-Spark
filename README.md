# Spark (سبارك) — Cognitive Reframing, Focus Lab & Learning Platform

> An evidence-based, neurodiversity-informed digital workspace engineered for ADHD learners, academic momentum, deep focus, and emotional regulation.

---

## Executive Overview

**Spark (سبارك)** is a client-authoritative academic productivity and cognitive wellness platform. Developed with an emphasis on executive function scaffolding, it bridges the gap between active study workflows (time-boxing, task decomposition, procedural soundscapes) and real-time emotional regulation (acute panic SOS, cognitive reframing, structured habits, and micro-achievement tracking).

The platform provides a bilingual (Arabic RTL and English LTR) experience featuring interactive STEM laboratories, mathematical typography, tactile floating notes, and gamified progress tracking.

---

## Core Capabilities & System Modules

### 1. Focus Lab & Attention Scaffolding
* **Time-Boxed Focus Engine**: Configurable interval timer supporting custom work intervals, physiological rest periods, and auditory chime cues powered by Tone.js.
* **Procedural Ambient Soundscapes**: Real-time synthesized noise generators including Brown Noise, Rain, Waves, Forest, Cafe, White Noise, and Binaural Beats calibrated for alpha/theta brainwave entrainment.
* **Thought Dump & Mind Unclutter**: Quick-capture stream allowing users to externalize intrusive distractions instantly without breaking focus flow.

### 2. Task Choreography & Timetable Synchronization
* **Micro-Step Task Planner**: Task breakdown system allowing learners to decompose overwhelming assignments into manageable sub-steps with dynamic completion tracking.
* **Smart Academic Timetable**: Weekly class scheduling supporting custom day start parameters, recurring events, and visual color coding.
* **Automatic Task Allocation**: Algorithmic distributor that calculates available study windows and automatically slots unscheduled assignments into open timetable gaps.
* **Daily Routines & Habit Loops**: Morning kickoff, afternoon focus reset, and evening wind-down sequences with habit streak incentives.

### 3. Cognitive Reframing & Psychological Wellness (CBT)
* **Acute Anxiety & Panic SOS Protocol**: Four-step physiological de-escalation workflow grounded in cognitive behavioral therapy:
  1. *Physiological Sigh* (cyclic hyperventilation & double-inhale reset)
  2. *Vagal Nerve Activation* (cold-water splash guide)
  3. *Cognitive Re-anchoring* (safety affirmations)
  4. *5-4-3-2-1 Sensory Grounding* (proprioceptive and tactile awareness)
* **Thought Dissolver**: Visual exposure tool enabling users to type cognitive distortions or catastrophic thoughts and watch them dissolve into particle dust.
* **Progressive Muscle Relaxation (PMR)**: Guided tension-release sequence addressing somatic anxiety across five primary muscle groups.
* **Small Wins & Gratitude Journal**: Neurochemical reward reinforcement logging daily micro-achievements across academic, wellness, and mindset pillars.
* **Emotional State Tracking**: Longitudinal mood logging with trend analysis to correlate emotional patterns with study consistency.

### 4. Interactive STEM & Mathematical Computation
* **PhET Interactive Science Lab**: Curated suite of physics, chemistry, and biology virtual simulations with embedded lab notebooks and inquiry goals.
* **Unified Math Studio (KaTeX)**: Real-time LaTeX rendering engine matching academic typography standards for formulas, fractions, matrices, and scientific notation.
* **3D Geometry & Spatial Visualization**: WebGL-powered 3D spatial models powered by Three.js with full orbit and zoom controls.
* **Scientific Computing Engine**: Dual-deck calculation interface providing scientific trigonometry, logarithms, statistical operations, and arithmetic memory registers.
* **Spaced Repetition Flashcards**: Active-recall deck manager utilizing Leitner-inspired intervals with self-assessment grading.

### 5. Tactile Workspace & Floating Notes
* **Persistent Sticky Notes System**: Floating, draggable canvas layer with persistent multi-tier storage:
  - Custom drag boundaries, stacking order (`z-index`), dimensions, and color themes.
  - Collapsible pill state for low-distraction workflows.
  - Workspace actions including automatic cascade stacking, layout scattering, and bulk visibility toggles.

### 6. Gamification & Intrinsic Motivation
* **Experience (XP) & Level Progression**: Non-punitive reward framework assigning points for active study sessions, completed tasks, and wellness check-ins.
* **Daily Quests & Milestones**: Structured daily missions that incentivize holistic habit formation.
* **Spark Inventory & Avatar Customization**: In-app catalog offering unlockable workspace themes, color palettes, and interface enhancements.

---

## Architectural Highlights & Design Philosophy

* **Bilingual Bidirectionality (RTL & LTR)**: Built from the foundation with complete typographic and spatial mirroring between Arabic (Cairo font pairing) and English (Nunito & Fredoka pairings).
* **Touch-First Mobile Ergonomics**: Fixed bottom navigation bar with safe-area insets, accessible touch targets ($\ge 44\text{px}$), and responsive drawer choreography designed for one-handed mobile operation.
* **Client-Side Authoritative & Private**: All student schedules, journal entries, tasks, and reflections persist locally within the client, ensuring privacy without mandatory remote tracking.
* **Zero-Distraction Visual Discipline**: Dark slate aesthetic (`#0F0F14`) accented by high-contrast electric teal and warm amber highlights, eliminating visual noise and cognitive friction.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **User Interface** | HTML5 Semantic Architecture, Modern CSS3 Variables & Flexbox/Grid, Tailwind CSS |
| **Logic & State** | Vanilla JavaScript (ES2022+), Reactive Store Pattern, LocalStorage Engine |
| **Audio Processing** | Tone.js Framework, Web Audio API procedural synthesis |
| **STEM & Graphics** | Three.js (WebGL), KaTeX Math Engine, PhET Interactive Simulations |
| **Typography & Icons** | Font Awesome 6 Pro, Google Fonts (Cairo, Nunito, Fredoka) |
| **Server & Hosting** | Node.js, Express.js Production Static Server |

---

## Repository Structure

```text
├── public/
│   ├── index.html            # Primary application entry point & semantic structure
│   ├── styles.css            # Complete design system, responsive rules & theme tokens
│   ├── script.js             # Core domain logic, state management, audio & UI renderers
│   ├── i18n.js               # Bidirectional localization dictionaries (Arabic / English)
│   ├── og-image.jpg          # High-resolution OpenGraph social card asset
│   ├── robots.txt            # Search engine crawling directives & sitemap reference
│   └── sitemap.xml           # Structured site index and canonical URLs
├── server.js                 # Production Express server with dynamic host header resolution
├── metadata.json             # Application capabilities and environment metadata
├── package.json              # Project specifications and dependencies
└── README.md                 # Product documentation and architectural specification
```

---

## License

This project is licensed under the [MIT License](LICENSE).

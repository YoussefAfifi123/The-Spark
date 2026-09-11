# ⚡ Spark — Modern Learning & Focus Platform

Spark is an all-in-one, high-performance study dashboard, focus workspace, and student mental health toolkit. Designed to support neurodivergent learners, students, and focused professionals, Spark combines proven study workflows (Pomodoro, task management, ambient soundscapes) with active cognitive wellness tools (Panic SOS, Small Wins Journal, Progressive Muscle Relaxation, and Sticky Notes).

---

## ✨ Key Features

### ⏱️ 1. Focus & Study Workspace
* **Customizable Pomodoro Timer**: Seamlessly switch between Work, Short Break, and Long Break modes with visual ring progress and Tone.js chime notifications.
* **Ambient Soundscape Generator**: Built-in procedural ambient noise generators including **Brown Noise**, **Rain**, **Binaural Beats**, **Waves**, **Forest**, **Cafe**, **White Noise**, and **Lo-Fi** to maintain deep concentration.
* **Sticky Notes System**: Floating, draggable, and resizable sticky note layer.
  * Full `localStorage` persistence across page reloads for note text content, screen coordinates (X/Y), custom dimensions, color, stacking z-index order, and minimized/expanded state.
  * Drag and reposition anywhere on screen with automatic boundary checking.
  * Multiple vibrant color themes (Yellow, Green, Pink, Blue, Purple, Dark).
  * Minimize, resize, stack in cascade, or scatter across your screen with saved layouts.
  * Pin affirmations, study notes, and journal entries directly onto your workspace.
* **Task & Homework Planner**: Categorized task manager with priority tags, estimated completion times, micro-step breakdown, and XP rewards upon completion.
* **Weekly Timetable & Schedule System**: Comprehensive academic timetable and routine manager:
  * **Week-by-Week Navigation**: Browse any week with live "Today" jump markers, quick date selection, and day headers.
  * **Interactive Timetable Grid**: Visual time-block grid (7:00 AM – 9:00 PM) mapping recurring school subjects, lectures, study blocks, and extracurriculars.
  * **Automatic Task Synchronization**: Automatically sync and slot pending study tasks onto your weekly schedule into open study slots with 1 click.
  * **Daily Routines & Habit Tracker**: Morning kickoff, afternoon reset, and evening wind-down routines with recurring day selectors, check-off progress, and XP rewards.
  * **Agenda View & Schedule Presets**: Switch between Timetable Grid and chronological Agenda list, with one-click presets (Standard School Week, Exam Crunch, ADHD Structured).
  * **Printable Timetable**: Ready-to-print clean weekly schedule layout.

---

### 🧠 2. Mental Health & Wellness Toolkit
* **Panic & Acute Anxiety SOS**: Rapid 4-step physiological reset designed for sudden overwhelm:
  1. *Physiological Sigh* (double-inhale reset)
  2. *Cold Temperature Shock* guide
  3. *Safety Anchor Truth* statement
  4. *Body Unplug & Grounding*
* **Small Wins & Gratitude Journal**: Combat study burnout by recording daily micro-achievements across study, health, and mindset categories (+15 XP per log).
* **Progressive Muscle Relaxation (PMR)**: Guided step-by-step physical tension release across 5 key muscle groups with timed intervals and audio feedback.
* **Compassionate Self-Talk Decks**: Tailored affirmation decks for Test Anxiety, Feeling Behind, ADHD Brain Appreciation, and Self-Compassion.
* **5-4-3-2-1 Sensory Grounding**: Interactive exercise engaging all 5 senses to break panic loops.
* **Thought Dissolver**: Visual cognitive exercise that lets you type out intrusive worries and watch them dissolve into particle dust.
* **Mood Check-Ins & Emotional Insights**: Daily emotional state logging with interactive pattern breakdown analytics.

---

### 🎮 3. Gamification & Study Analytics
* **Leveling & XP Engine**: Earn XP for completing focus sessions, completing tasks, logging mood check-ins, and recording gratitude wins.
* **Streak Tracking**: Maintain daily focus streaks and track total study time toward your daily goals.
* **Grade & Schedule Calculator**: Built-in tool to estimate academic GPAs and structure weekly study schedules.

---

## 🛠️ Technology Stack

* **Frontend**: HTML5, CSS3 (Modern CSS Variables, Flexbox, CSS Grid), Vanilla JavaScript (ES2022)
* **Audio Engine**: [Tone.js](https://tonejs.github.io/) & Web Audio API for synthetic soundscapes and interactive sound effects
* **Icons & Fonts**: Font Awesome 6, Nunito & Fredoka Typography
* **Backend Runtime**: Node.js & Express.js
* **Storage**: Client-side persistent local storage engine (`localStorage`)

---

## 🚀 Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)

### Installation & Local Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/spark.git
   cd spark
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Local Server**:
   ```bash
   npm start
   ```

4. **Open in Browser**:
   Navigate to `http://localhost:3000` to launch Spark.

---

## 📁 Project Structure

```text
├── index.html          # Main HTML5 application container & floating layers
├── styles.css          # Design system, CSS themes, responsive layouts & sticky notes CSS
├── script.js           # Core app state, UI renders, soundscape engine, wellness tools
├── server.js           # Node.js / Express static file server
├── package.json        # Project metadata and dependencies
├── metadata.json       # Platform metadata configuration
└── .env.example        # Environment configuration template
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

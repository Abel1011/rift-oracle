# Rift Oracle

> **An AI-Powered Drafting Intelligence System for Professional League of Legends**

**Rift Oracle** is a real-time drafting assistant engineered for elite League of Legends competition. Built for the **Sky's the Limit - Cloud9 x JetBrains Hackathon**, this application transforms raw esports data from the **GRID Data Platform** into strategic intelligence that coaches and players can leverage during the critical pick/ban phase.

In professional League of Legends, the draft determines the trajectory of the entire match. Rift Oracle eliminates guesswork by delivering data-driven recommendations at the speed of competition, enabling teams to execute drafts that are both analytically optimized and tactically adaptive.

---

## Core Architecture

Rift Oracle operates through a **dual-page synchronized system** designed for real coaching scenarios:

| Page | Purpose |
|------|---------|
| **Draft Simulator** (`/draft`) | Interactive pick/ban interface with full 20-turn draft simulation |
| **Analysis Dashboard** (`/analysis`) | Real-time AI recommendations, opponent scouting, and strategic insights |

Both pages stay perfectly synchronized through a custom state management layer, allowing a coach to manage the draft while analysts monitor recommendations on separate screens—mirroring professional team setups.

---

## Feature Breakdown

### 1. Turn-by-Turn Draft Recommendations

As each pick and ban occurs, Rift Oracle's analysis engine evaluates the draft state and generates ranked champion recommendations. The system considers multiple weighted factors:

- **Signature Champions**: Identifies high-proficiency picks from each player's historical champion pool, prioritizing champions where the player demonstrates above-average performance metrics.
- **Counter-Pick Analysis**: Weights champions that historically perform well against the enemy's locked-in picks, based on head-to-head matchup data.
- **Synergy Detection**: Recognizes powerful champion pairings (CC chains, engage/follow-up, frontline/backline balance) and boosts recommendations that complement existing picks.
- **Flex Value**: Prioritizes champions that can be played across multiple roles, maintaining draft ambiguity to limit counter-pick opportunities.
- **Deny Potential**: Flags high-value targets that should be picked to prevent the enemy from securing comfort picks or composition-defining champions.

Each recommendation displays a predicted win rate impact and detailed reasoning explaining why that champion fits the current draft state.

### 2. Dynamic Win Probability Index

A real-time win probability meter updates after every draft action, illustrating how each pick or ban shifts the projected match outcome. The calculation integrates:

- Team historical win rates with specific compositions
- Player performance metrics on selected champions
- Objective control tendencies (First Blood, First Dragon, First Tower rates)
- Game duration preferences (early-game vs. scaling compositions)

This provides immediate visual feedback on whether the draft is trending favorably or requires adjustment.

### 3. Probabilistic Enemy Prediction

Rift Oracle anticipates the opponent's next move before it happens. By analyzing:

- Historical champion pools and pick frequencies
- Role-specific comfort picks per player
- Current composition needs (missing damage type, frontline requirements)
- Team-wide strategic tendencies

The system generates a probability distribution of likely enemy selections, allowing proactive banning and counter-picking rather than reactive responses.

### 4. Comprehensive Team Scouting

Before the draft begins, Rift Oracle compiles detailed intelligence on any opponent:

**Player Profiles**
- Games played, win rate, average KDA
- Gold per minute, damage per minute, vision score
- First blood participation rate
- Top champion pool with individual win rates

**Team Tendencies**
- Most picked and banned champions
- Objective control statistics (Dragons, Barons, Heralds, Towers)
- Side preference performance (Blue vs. Red)
- Average game duration and tempo patterns

**Recent Match History**
- Series results with score breakdowns
- Game-by-game draft analysis (picks, bans, outcomes)
- Performance trends over recent matches

### 5. Head-to-Head Analysis

When preparing for a specific matchup, Rift Oracle retrieves the complete history between two teams:

- Series record and game differential
- Champion picks that have succeeded or failed in past meetings
- Common ban patterns when these teams face each other
- Detailed game logs from previous encounters

This historical context informs draft strategy by highlighting what has worked—and what hasn't—against this particular opponent.

### 6. Composition Analysis Engine

Real-time analysis of both team compositions with automated warnings:

**Damage Profiling**
- Physical vs. Magic vs. Mixed damage ratios
- Alerts when a composition becomes one-dimensional (e.g., "Full AD—vulnerable to armor stacking")

**Structural Analysis**
- Role fulfillment tracking
- Frontline/backline balance assessment
- Engage and disengage capability scoring

**Strategic Warnings**
- Missing role alerts ("No traditional ADC selected")
- Composition vulnerability flags ("Low wave clear—weak to siege")
- Win condition identification ("Strong teamfight, weak in sidelane")

### 7. GRID Data Integration

Rift Oracle is powered exclusively by the **GRID Data Platform**, utilizing:

- **GraphQL API**: For retrieving team rosters, series IDs, and structural data
- **File Download API**: For bulk historical match data extraction
- **Statistics API**: For comprehensive player and team performance metrics

All data is cached locally to ensure responsive performance during live draft scenarios. The system processes end-state game files to extract granular statistics including gold differentials, objective timings, and draft sequences.

---

## Technical Implementation

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State Sync | Custom localStorage/BroadcastChannel adapters |
| Data Source | GRID GraphQL + File Download APIs |
| Caching | File-based cache with TTL management |

### Key Services

- **Draft Analysis Service**: Core recommendation engine that processes draft state against team data to generate picks, predictions, and warnings
- **GRID Data Service**: Handles data fetching, caching, and normalization from GRID APIs
- **Sync Adapter**: Enables real-time state synchronization between draft and analysis pages

### Performance Optimizations

- Debounced API calls to prevent excessive requests during rapid draft actions
- Request deduplication to avoid redundant data fetches
- Abort controller integration to cancel stale requests when draft state changes
- Progressive data loading with polling for long-running preparation jobs

---

## Getting Started

### Prerequisites
- Node.js 18.x or later
- GRID API Key

### Environment Setup
Create a `.env.local` file:
```env
GRID_API_KEY=your_grid_api_key_here
```

### Installation
```bash
npm install
npm run dev
```

### Usage Flow

1. **Setup** (`/setup`): Select the two teams facing each other. The system supports searching through curated professional teams or any team available via GRID.

2. **Draft** (`/draft`): Execute the full 20-turn pick/ban phase. Champions can be filtered by role, class, and sorted by various metrics. A timer simulates competitive draft pressure.

3. **Analysis** (`/analysis`): Monitor AI recommendations in real-time. Switch between tabs to view:
   - Live draft recommendations and enemy predictions
   - Opponent scouting report
   - Your team's historical statistics
   - Head-to-head matchup history

Both draft and analysis pages remain synchronized—changes made in the draft simulator instantly reflect in the analysis dashboard.

---

## Hackathon Context

**Competition**: Sky's the Limit - Cloud9 x JetBrains Hackathon  
**Category**: Drafting Assistant/Predictor (League of Legends)  
**Challenge**: Build a real-time application that simulates and predicts draft picks/bans, providing optimal strategies based on historical GRID data

Rift Oracle directly addresses the hackathon requirements by delivering:
- Turn-by-turn recommendations as the draft progresses
- Win rate impact visualization for each selection
- Probability distributions for enemy picks
- Comprehensive data reasoning behind every insight

---

## Author

Built with precision for Cloud9.

**Category 3 Submission** — Drafting Assistant/Predictor (LoL)


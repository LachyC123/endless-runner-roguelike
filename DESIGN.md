# 🎮 VOID WALKER - Game Design Document

## High-Concept Summary

**Void Walker** is a fast-paced 2D endless runner roguelike where you play as a shadow entity escaping through procedurally generated dimensional rifts. Each run offers random power-ups that synergize in unexpected ways, creating unique builds every time. The game combines the upgrade addiction of Vampire Survivors, the quick reflexes of Subway Surfers, and the build-crafting depth of Brotato—all optimized for one-handed mobile play.

---

## 🔄 Core Gameplay Loop

1. **Start Run** → Choose starting loadout (if unlocked)
2. **Survive** → Auto-run, dodge obstacles, defeat enemies
3. **Collect** → Gather Void Orbs for score and Energy for upgrades
4. **Upgrade** → Every energy threshold, pick 1 of 3 random upgrades
5. **Build Synergies** → Combine upgrades for powerful effects
6. **Die** → Earn Void Essence based on performance
7. **Meta-Progress** → Spend essence on permanent unlocks
8. **Repeat** → New run with new possibilities

---

## 🎯 Roguelike Systems

### 1. Mid-Run Upgrade Choices
Every 15 Energy collected, choose 1 of 3 random upgrades:

**Common Upgrades (60% chance):**
- Speed Boost (+10% run speed)
- Jump Height (+15% jump)
- Quick Slide (faster slide recovery)
- Orb Magnet (attract orbs)
- Shield Charge (+1 hit protection)

**Rare Upgrades (30% chance):**
- Double Jump (jump again mid-air)
- Dash Strike (damage enemies on dash)
- Time Dilation (slow-mo on near-miss)
- Combo Master (+50% combo multiplier)
- Energy Leech (kills give energy)

**Legendary Upgrades (10% chance):**
- Void Form (phase through 1 obstacle per 10s)
- Chain Lightning (damage chains between enemies)
- Gravity Flip (invert gravity on hold)
- Bullet Time (slow-mo lasts longer)
- Phoenix Soul (revive once per run)

### 2. Mutations (Risk/Reward)
Appear occasionally as 4th option with trade-offs:
- **Glass Cannon**: +100% damage, -50% HP
- **Speed Demon**: +50% speed, obstacles spawn faster
- **Giant**: 2x size (easier to hit, easier to hit enemies)
- **Cursed Orbs**: 2x orb value, some orbs damage you

### 3. Build Paths
Upgrades synergize into distinct playstyles:
- **Speed Build**: Speed + Dash + Time Dilation = Blazing fast near-misses
- **Tank Build**: Shield + HP + Regen = Survive anything
- **Combo Build**: Combo Master + Orb Magnet + Multipliers = Score monster
- **Risk Build**: Mutations + High risk powers = Boom or bust

### 4. Synergy Examples
- Double Jump + Gravity Flip = Triple aerial control
- Orb Magnet + Energy Leech = Constant upgrades
- Dash Strike + Chain Lightning = Screen-clearing destruction
- Shield + Phoenix Soul = Maximum survivability

---

## 📈 Meta-Progression System

### Void Essence (Premium Currency)
Earned every run based on:
- Distance traveled (1 essence per 100m)
- Enemies defeated (1 essence per 5 kills)
- Score achieved (1 essence per 1000 points)
- Bonus for personal bests

### Permanent Unlocks

**Upgrade Pool Expansions:**
- Unlock new upgrades to appear in runs
- Each tier costs more essence
- 20+ total upgrades to unlock

**Characters:**
1. **Shadow** (default) - Balanced stats
2. **Spectre** - Faster, less HP, starts with dash
3. **Golem** - Slower, more HP, starts with shield
4. **Wraith** - Glass cannon, starts with 2 random upgrades

**Loadouts:**
- Start runs with 1 pre-selected upgrade
- Unlock loadout slots with essence

**Difficulty Modifiers (Void Challenges):**
- Faster enemies (+25% essence)
- No shields (+50% essence)
- One-hit death (+100% essence)

**Cosmetics:**
- Trail effects (flame, lightning, stars)
- Character skins
- Death animations

---

## 🎮 Controls Mapping

### Primary Controls (One-handed)
| Action | Input | Notes |
|--------|-------|-------|
| Jump | Tap anywhere | Forgiving tap window |
| Double Jump | Tap again mid-air | If unlocked |
| Slide | Swipe down | Slides under obstacles |
| Special Ability | Hold (0.3s) | Context-dependent |

### Special Ability (Hold)
- Default: Activate Shield (if available)
- With Dash: Quick forward dash
- With Slow-mo: Enter bullet time
- With Gravity Flip: Invert gravity

### Gesture Forgiveness
- Tap detection: 50ms grace period
- Swipe threshold: 30px minimum
- Hold detection: 300ms threshold
- Buffer inputs during animations

---

## 📊 Difficulty Scaling

### Speed Curve
```
Speed = BaseSpeed + (Distance / 500) * SpeedMultiplier
Max Speed cap at 2.5x base speed
```

### Obstacle Evolution
| Distance | Obstacles |
|----------|-----------|
| 0-500m | Single gaps, low barriers |
| 500-1000m | Double obstacles, moving platforms |
| 1000-2000m | Enemy spawns, tight gaps |
| 2000m+ | Complex patterns, boss-like sections |

### Visual Intensity
- Background parallax increases with speed
- Screen edges pulse at high speeds
- Particle density increases
- Color saturation shifts toward danger colors

---

## 🎨 Visual Design

### Color Palette
- **Background**: Deep purple to black gradients
- **Player**: Cyan glow with white core
- **Obstacles**: Red/orange warning colors
- **Orbs**: Golden yellow (collectibles), Blue (energy)
- **Enemies**: Dark red with glowing eyes
- **UI**: Clean white with cyan accents

### Juice Effects
- Screen shake on hit (5px, 100ms)
- Hitstop on enemy kill (50ms freeze)
- Trail particles behind player
- Explosion particles on collection
- Speed lines at high velocity
- Chromatic aberration on damage
- Flash white on upgrade selection

### UI Principles
- Score: Top center, large
- Combo: Below score, pulses on increase
- Energy bar: Top left, fills to upgrade
- Shield count: Bottom left icons
- Special ready: Bottom right indicator
- Minimal during gameplay, rich in menus

---

## 🧪 Addiction & Retention Mechanics

### Near-Miss System
- Passing within 10px of obstacle = "Near Miss!"
- Near misses give bonus score
- Chain near-misses for multiplier
- Near-miss streak achievements

### Combo System
- Collecting orbs/killing enemies builds combo
- Combo decays if nothing collected for 2s
- Higher combo = higher score multiplier
- Combo affects visual intensity

### Risk/Reward Decisions
- Take mutation for power boost?
- Go for risky orb placement?
- Use shield now or save it?
- Which upgrade synergizes best?

### "Just Survived" Moments
- Shield break dramatic effect
- Last-second jumps highlighted
- Phoenix revival is epic
- Close calls shown in run summary

### Rare Exciting Drops
- Legendary upgrades have unique sound/effect
- "LEGENDARY!" banner on selection
- Golden orbs worth 10x appear rarely
- Mystery boxes with random rewards

### Run Summary Screen
```
┌─────────────────────────────┐
│     RUN COMPLETE           │
│                            │
│   Distance: 2,450m  NEW!   │
│   Score: 12,500            │
│   Enemies: 23              │
│   Best Combo: x15          │
│                            │
│   Upgrades Used:           │
│   [Icon] [Icon] [Icon]     │
│                            │
│   Void Essence: +45        │
│   Total: 1,234             │
│                            │
│   [UPGRADE] [RUN AGAIN]    │
└─────────────────────────────┘
```

---

## 🏗️ Technical Architecture

### File Structure
```
/void-walker/
├── index.html          # Main game file (all-in-one)
├── DESIGN.md           # This document
├── README.md           # Setup instructions
└── assets/             # Future: extracted assets
    ├── sounds/
    └── sprites/
```

### Game Architecture
```javascript
// Core Systems
Game                    // Main game loop, state management
├── Renderer            // Canvas drawing, effects
├── Input               // Touch handling, gesture recognition
├── Audio               // Sound effects, music
├── Physics             // Collision detection, movement
├── EntityManager       // Spawning, pooling, updates
│   ├── Player          // Player state, abilities
│   ├── Obstacles       // Obstacle types, patterns
│   ├── Enemies         // Enemy AI, attacks
│   ├── Collectibles    // Orbs, power-ups
│   └── Particles       // Visual effects
├── UpgradeSystem       // Roguelike upgrades, synergies
├── MetaProgression     // Persistence, unlocks
├── UIManager           // Screens, HUD, transitions
└── SaveSystem          // LocalStorage persistence
```

### Performance Targets
- 60 FPS on iPhone 8+
- < 100ms load time
- < 50MB memory usage
- No external dependencies
- Offline-capable

---

## 🚀 Roadmap (Post-MVP)

### Phase 2: Content Expansion
- 10 more upgrades
- 3 more characters
- Boss encounters every 1000m
- Daily challenges

### Phase 3: Social Features
- Global leaderboards
- Share run replays
- Weekly tournaments
- Friend challenges

### Phase 4: Polish
- Full sound design
- Music tracks
- Advanced particle systems
- Achievement system

---

## ✅ MVP Checklist

- [x] Core running mechanic
- [x] Jump and slide controls
- [x] Obstacle spawning
- [x] Orb collection
- [x] Score and combo system
- [x] 3 upgrade choices
- [x] 10+ upgrades in pool
- [x] Difficulty scaling
- [x] Death and restart
- [x] Void Essence currency
- [x] Basic meta-progression shop
- [x] Particle effects
- [x] Screen shake
- [x] Mobile touch controls
- [x] Save/load progress

---

*Void Walker - Escape the void, one run at a time.*

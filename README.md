# 🎮 VOID WALKER

**A fast-paced 2D endless runner roguelike optimized for iPhone**

![Game Preview](https://img.shields.io/badge/Platform-Mobile%20Web-blue) ![Version](https://img.shields.io/badge/Version-1.0-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎯 Overview

Void Walker is an addictive endless runner where you play as a shadow entity escaping through procedurally generated dimensional rifts. Each run offers random power-ups that synergize in unexpected ways, creating unique builds every time.

**Inspired by:** Brotato × Subway Surfers × Vampire Survivors

## ✨ Features

- **One-handed touch controls** - Tap to jump, swipe down to slide, hold for special abilities
- **Roguelike progression** - Choose from 15+ upgrades mid-run with synergies
- **Meta-progression** - Permanent unlocks, shop items, and essence currency
- **Addictive gameplay** - Near-miss bonuses, combo system, risk/reward choices
- **Juicy effects** - Screen shake, hitstop, particles, and visual feedback
- **Offline capable** - Runs entirely in browser, saves to localStorage

## 🚀 Quick Start

### Option 1: Open Directly
Simply open `index.html` in any modern mobile browser (Safari, Chrome).

### Option 2: Local Server
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# Then open http://localhost:8000 on your phone
```

### Option 3: Deploy
Upload `index.html` to any static hosting (GitHub Pages, Netlify, Vercel).

## 🎮 Controls

| Action | Input |
|--------|-------|
| **Jump** | Tap anywhere |
| **Double Jump** | Tap again mid-air (if unlocked) |
| **Slide** | Swipe down |
| **Special Ability** | Hold (0.3s) |

### Special Abilities (Hold)
- **Bullet Time** - Slow motion while holding
- **Gravity Flip** - Invert gravity
- **Dash** - Quick forward dash through enemies
- **Void Form** - Phase through obstacles (cooldown)

## 🔄 Core Loop

1. **Start Run** → Choose loadout (if unlocked)
2. **Survive** → Auto-run, dodge obstacles, defeat enemies
3. **Collect** → Gather orbs for score, energy for upgrades
4. **Upgrade** → Every 15 energy, pick 1 of 3 random upgrades
5. **Build Synergies** → Combine upgrades for powerful effects
6. **Die** → Earn Void Essence based on performance
7. **Meta-Progress** → Spend essence in shop
8. **Repeat** → New run, new possibilities!

## ⚡ Upgrade System

### Rarities
- **Common (60%)** - Speed Boost, Jump Height, Quick Slide, Orb Magnet, Shield
- **Rare (30%)** - Double Jump, Dash Strike, Time Dilation, Combo Master, Energy Leech
- **Legendary (10%)** - Void Form, Chain Lightning, Gravity Flip, Bullet Time, Phoenix Soul
- **Mutations** - Risk/reward tradeoffs (Glass Cannon, Speed Demon, Cursed Orbs)

### Synergy Examples
- Double Jump + Gravity Flip = Triple aerial control
- Orb Magnet + Energy Leech = Constant upgrades
- Dash Strike + Chain Lightning = Screen-clearing destruction

## 🏪 Shop (Meta-Progression)

Spend Void Essence on permanent unlocks:
- **Air Walker** (100💎) - Start with Double Jump
- **Shield Start** (50💎) - Start with 1 Shield
- **Magnetic** (75💎) - Start with Orb Magnet
- **Quick Start** (60💎) - +20% starting speed
- **Combo Starter** (80💎) - +25% combo multiplier
- **Essence Hunter** (150💎) - +20% essence earned

## 📊 Scoring

- **Distance**: 1 essence per 100m
- **Enemies**: 1 essence per 5 kills
- **Score**: 1 essence per 1000 points
- **Near-misses**: +25 score × combo
- **Combos**: Multiplier for all score gains

## 🛠️ Technical Details

- **Engine**: Vanilla JavaScript + HTML5 Canvas
- **Dependencies**: None
- **File Size**: ~30KB (single HTML file)
- **Target FPS**: 60fps on iPhone 8+
- **Storage**: LocalStorage for save data
- **Compatibility**: All modern mobile browsers

## 📁 File Structure

```
/void-walker/
├── index.html      # Complete game (HTML + CSS + JS)
├── DESIGN.md       # Full game design document
└── README.md       # This file
```

## 🚀 Roadmap

### Phase 2: Content
- [ ] 10 more upgrades
- [ ] 3 additional characters
- [ ] Boss encounters every 1000m
- [ ] Daily challenges

### Phase 3: Social
- [ ] Global leaderboards
- [ ] Share run replays
- [ ] Weekly tournaments

### Phase 4: Polish
- [ ] Sound effects & music
- [ ] Advanced particles
- [ ] Achievement system

## 🎨 Design Philosophy

- **Mobile-first**: Every decision optimized for one-handed play
- **Readable speed**: Fast but never unfair
- **Meaningful choices**: Every upgrade matters
- **Constant progress**: Even failed runs feel rewarding
- **Juicy feedback**: Every action has satisfying response

## 📄 License

MIT License - Feel free to modify and distribute!

---

*Void Walker - Escape the void, one run at a time.* 🌌

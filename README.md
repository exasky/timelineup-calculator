# 📊 TimelineUp Build Calculator

A modern, high-performance, and 100% static build calculator for the mobile idle game **TimelineUp**.
Hosted on [GitHub Pages](https://exasky.github.io/timelineup-calculator/).

This project is designed to help players optimize their upgrades, card builds, and talent trees without manual calculations, offering a fast, fluid, and responsive client-side interface.

---

## 🚀 Key Features

- **Real-Time Power Calculation:** Instant estimation of total power and aggregated multipliers (Damage, Fire Rate, Crit Chance, Era Multipliers, etc.).
- **Card System Logic:** Implements rarity-based level caps (_Common, Rare, Epic, Legendary, Mythic, Immortal_) with automatic conversion of primary stats into flat damage bonuses once the threshold is reached.
- **Talent Tree Simulation:** Interactive simulation of talent nodes and their cumulative bonuses grouped by category (_Heroes, Champions, Pets, Crowd_).
- **Serverless Architecture:** Fully driven by JSON configuration files, running entirely inside the user's browser.
- **Local Persistence:** Automatic saving of your current build loadout using the browser's `localStorage`.

---

## 🛠️ Tech Stack

- **Framework:** [Angular](https://angular.dev/) (Standalone Components architecture, strict TypeScript typing).
- **Reactivity:** Angular Signals for blazing-fast instant recalculations.
- **Styling:** Tailwind CSS.
- **Deployment:** GitHub Pages (via `angular-cli-ghpages`).

---

## 📁 Data Structure (JSON)

All game statistics and configurations are externalized into JSON files located under `src/assets/data/`, making it easy to update game balancing or add new items:

```text
src/assets/data/
├── cards.json      # Card definitions and base stat types
├── talents.json    # Talent tree nodes and scaling rules
└── ...             # Future data categories (Heroes, Champions, Pets, Mounts...)
```

## 💻 Developer Guide

If you are a developer looking to run, test, or contribute to the source code, please check our Developer Guide.

## 🤝 Contributing

Game data updates rely on the community! If you notice any outdated card statistics or talent node values, check out our Contributing Guide.

## 📄 License

This project is open-source under the MIT License.

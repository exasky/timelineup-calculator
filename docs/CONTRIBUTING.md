# Contributing to TimelineUp Calculator

First off, thank you for taking the time to contribute! 🎉

Whether you are fixing a bug, updating game data (cards, talents), or suggesting a new feature, your help is greatly appreciated.

---

## 🔄 How to Contribute Game Data (JSON Files)

Since **TimelineUp** receives balancing updates and new contents regularly, the community plays a huge role in keeping the stats accurate. You don't even need to touch the Angular code to contribute data!

1. **Locate the Data Files:**
   Head over to `src/assets/data/` to find configuration files like `cards.json` or `talents.json`.
2. **Update or Add Entries:**
   Ensure your JSON syntax is valid and follows the existing structure (e.g., matching stat types, correct rarity levels, etc.).
3. **Submit a Pull Request:**
   Open a Pull Request (PR) explaining what stats or items you updated based on the game.

---

## 💻 Code Contributions (Angular Developers)

If you want to contribute to the application logic, UI components, or calculation engines:

1. **Fork the Repository** and clone your fork locally.
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Run the Development Server:**
   ```bash
   ng serve
   ```
   Navigate to http://localhost:4200/.
4. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/my-new-feature
   ```
5. **Commit your Changes:**
   Follow clean commit message practices.
6. **Push and Open a Pull Request.**

## 💡 Reporting Bugs & Suggesting Features

If you encounter a bug or have an idea for a new calculator feature (e.g., a "Budget Optimizer" mode):

Open an Issue on the GitHub repository.

Provide clear descriptions, screenshots, or expected values if it's a calculation discrepancy.

Thank you for helping the TimelineUp community grow!

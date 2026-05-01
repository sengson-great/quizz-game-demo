# 🏆 Quiz No Cap: Cartoon Edition

A high-energy, real-time multiplayer quiz game built with **Laravel 11** and **React (Vite)**. Featuring a bold **Neubrutalist (Cartoon)** aesthetic, full **Khmer & English** localization, and a powerful real-time engine.

---

## ✨ New "Cartoon Blitz" Aesthetic
The application has been overhauled with a playful, high-impact design system:
- **Visual Style**: Neubrutalism with **3px solid black borders** and **6px offset hard shadows**.
- **Color Palette**: Electric Yellow (`#FACC15`) paired with clean white surfaces and high-contrast black accents.
- **Typography**: 
    - **Headings**: `Luckiest Guy` (EN) & `Koulen` (KM) for blocky, impactful headers.
    - **Body**: `Fredoka` (EN) & `Kantumruy Pro` (KM) for rounded, friendly reading.
- **Tactile UI**: All buttons feature "press-down" physics with satisfying micro-animations.

---

## 🚀 Quick Start (Docker)

The fastest way to get QuizBlitz running is using Docker Compose.

```bash
# 1. Clone and enter the project
cd millionaire-quiz

# 2. Build and start all services (Backend, Frontend, DB, Reverb)
docker-compose up --build -d

# 3. Setup the database & keys
docker-compose exec backend php artisan migrate --seed
docker-compose exec backend php artisan passport:keys
```

**Access the App:**
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API (Backend)**: [http://localhost:8001](http://localhost:8001)

---

## 🛠 Tech Stack

- **Backend**: Laravel 11 (PHP 8.3), Laravel Reverb (Real-time WebSockets), MySQL 8.0.
- **Frontend**: React 18, Vite, Framer Motion (Animations), TailwindCSS.
- **State Management**: React Context API (Auth, PWA, Game State).
- **Localization**: Custom `i18n` system with deep support for Khmer script line-height and spacing.

---

## ✨ Key Features

- **Multilingual Support**: Toggle seamlessly between Khmer and English with optimized typography for both.
- **Game Modes**:
    - **Solo Practice**: 15 progressive questions with classic lifelines (50/50, x2, Skip).
    - **1v1 Battle**: Real-time matchmaking with sub-100ms latency.
    - **Private Rooms**: Create lobbies and invite friends via invite codes.
- **Leaderboard**: Global rankings based on total points and win rates.
- **PWA Support**: Installable on iOS and Android for a native app-like experience.

---

## 👨‍💻 Development

### Adding Questions
Questions are stored in `backend/database/data/questions.json`. After modifying, re-run the seeders:
```bash
docker-compose exec backend php artisan migrate:fresh --seed
```

### Modifying Styles
The design system is centralized in `frontend/src/styles/theme.css`. Use CSS variables (`--primary`, `--font-family-heading`, etc.) to maintain consistency across the app.

---

## 📄 License
Open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

# 🏆 QuizBlitz - Millionaire Style Quiz Game

A beautifully designed, real-time multiplayer quiz game built with **Laravel 12** and **React (Vite)**. Fully localized in **Khmer** and **English**, featuring smooth animations, dynamic categories, and live battle modes.

---

## 🚀 Quick Start

### 1. Backend Setup (Laravel)

```bash
cd backend
composer install
cp .env.example .env
# Configure your .env (SQLite is the default)
touch database/database.sqlite
php artisan key:generate
php artisan migrate --seed
php artisan reverb:start # Required for real-time multiplayer features
# Use another terminal
php artisan serve --port=8001
```

### 2. Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

---

## 🛠 Tech Stack

- **Backend**: Laravel 12 (PHP 8.2+), Reverb (WebSockets), SQLite.
- **Frontend**: React 18, Vite, Framer Motion, TailwindCSS (for base layout), Lucide Icons.
- **State Management**: React Context API.
- **Localization**: Custom `useTranslation` hook with support for Khmer (km) and English (en).

---

## ✨ Key Features

- **Multilingual Support**: Fully localized in Khmer (default) and English.
- **Game Modes**:
    - **Solo Practice**: 15 progressive questions across 3 difficulties.
    - **1v1 Battle**: Real-time matchmaking against other players.
    - **Room Mode**: Create or join private rooms with friends.
- **Lifelines**: Classic 50/50, x2 Chance, Audience Poll, and Skip.
- **Live Leaderboard**: Track global rankings and performance stats.
- **Premium UI**: Glassmorphism aesthetic, smooth transitions, and responsive design.

---

## 📁 Project Structure

- `/backend`: Laravel API, migration, and real-time broadcasting logic.
- `/frontend`: React application, localized dictionary (`/data/translations.js`), and game components.

---

## 👨‍💻 Development

### Adding Translations
Modify `frontend/src/app/data/translations.js` to add or update strings for both Khmer and English.

### Adding Questions
Questions can be added via the database seeds in the backend or by modifying the `frontend/src/app/data/questions.js` file for offline testing/mock data.

---

## 📄 License
Open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

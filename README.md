# Millionaire Quiz Game

Full-stack web application built with Laravel (Backend) and React (Frontend).

## Prerequisites
- PHP 8.2+
- Composer
- Node.js & NPM
- MySQL (or SQLite)

## Setup Instructions

### Backend (Laravel)
1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Install PHP dependencies:
   ```bash
   composer install
   ```
3. Configure environment:
   - Copy `.env.example` to `.env`
   - Set database credentials in `.env` (Default is SQLite for quick start)
   ```bash
   cp .env.example .env
   touch database/database.sqlite
   php artisan key:generate
   ```
4. Run migrations and seed data:
   ```bash
   php artisan migrate --seed
   ```
5. Start the server:
   ```bash
   php artisan serve
   ```
   Server will run at `http://localhost:8000`.

### Frontend (React)
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   App will run at `http://localhost:5173`.

## Features
- **Authentication**: Secure login/registration.
- **Game Logic**: 15 levels, progressive difficulty, timers, score tracking.
- **Lifelines**: 50:50, Skip, Double Chance.
- **Admin**: Manage questions via API (or Seeders for now).
- **Design**: Responsive glassmorphism UI.

## API Documentation
See `DESIGN_DOC.md` for full schema and API details.
# quizz-game-demo

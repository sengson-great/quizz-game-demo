# ⚙️ QuizBlitz Backend (Laravel 12 API)

The backend service for the QuizBlitz game, handling real-time matches, authentication, and scoring.

---

## 🚀 Setup Steps

1.  **Install PHP Dependencies**:
    ```bash
    composer install
    ```

2.  **Environment Setup**:
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

3.  **Database Configuration (SQLite)**:
    -   Ensure `DB_CONNECTION=sqlite` in `.env`.
    -   Create the database file: `touch database/database.sqlite`.

4.  **Run Migrations & Seeds**:
    ```bash
    php artisan migrate:fresh --seed
    ```

5.  **Start Real-Time Broadcast Server (Laravel Reverb)**:
    ```bash
    php artisan reverb:start
    ```

6.  **Serve Application**:
    ```bash
    php artisan serve --port=8001
    ```

---

## 🛠 Key Components

-   `/app/Services/GameService.php`: Core logic for game session management and ranking.
-   `/routes/api.php`: API endpoints for the React frontend.
-   `/app/Events`: WebSocket event dispatching via Reverb.

---

## 📄 Main Setup
For the full project overview, please refer to the [Root README](../README.md).

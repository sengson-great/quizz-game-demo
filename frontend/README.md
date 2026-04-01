# 🎨 QuizBlitz Frontend (React + Vite)

The interactive user interface for the QuizBlitz game, featuring real-time multiplayer, localized Khmer/English text, and high-performance animations.

---

## 🚀 Setup Steps

1.  **Install Node Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    ```bash
    cp .env.example .env # Ensure VITE_API_BASE_URL points to your backend (default: http://localhost:8001/api)
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

---

## 🏗 Key Features

-   **Localization**: Powered by a custom `useTranslation` hook and `/src/app/data/translations.js`.
-   **Real-time Logic**: Integrates with Laravel Reverb via Echo for live multiplayer sync.
-   **Animations**: Built with `framer-motion` for fluid game transitions and effects.

---

## 📄 Main Setup
For the full project overview, please refer to the [Root README](../README.md).

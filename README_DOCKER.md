# Docker Guide for QuizBlitz

This project uses a multi-container Docker setup to ensure a consistent development and production environment.

## 🏗 Container Architecture

- **`frontend`**: Vite-powered React app running on port `3000`.
- **`backend`**: Laravel 11 API running on port `8000` (exposed as `8001` on host).
- **`reverb`**: Laravel Reverb WebSocket server running on port `8081`.
- **`db`**: MySQL 8.0 database.

## 🚀 Commands

### Initial Setup
```bash
docker-compose up --build -d
docker-compose exec backend php artisan migrate --seed
docker-compose exec backend php artisan passport:keys
```

### Viewing Logs
```bash
docker-compose logs -f backend   # Tail backend logs
docker-compose logs -f reverb    # Monitor WebSocket traffic
```

### Running Commands inside Backend
```bash
docker-compose exec backend php artisan tinker
docker-compose exec backend ./vendor/bin/phpunit
```

## ⚙️ Configuration

### Environment Variables
The Docker setup inherits from the `backend/.env` file. Key settings for Docker include:
- `DB_HOST=db`
- `REVERB_HOST=reverb`
- `DB_CONNECTION=mysql`

### Database Persistence
Database data is persisted in a Docker volume named `db_data`. To wipe the database completely, run:
```bash
docker-compose down -v
```

## 🛠 Troubleshooting

### Port Conflicts
If port `3000` or `8001` is already in use on your machine, modify the `ports` mapping in `docker-compose.yml`.

### Reverb Connection Issues
The frontend proxies WebSocket requests through Vite. Ensure `REVERB_HOST=reverb` is set in the `reverb` service environment in `docker-compose.yml`.

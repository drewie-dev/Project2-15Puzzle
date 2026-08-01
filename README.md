# 15 Puzzle: Full-Stack Final Project

A themed sliding tile puzzle built with HTML5, CSS3, JavaScript, PHP, and MySQL.

## Modes
- Beach Boardwalk
- Tide Pool
- Sunset Skyline

## Stack
- Frontend: HTML5, CSS3, vanilla JavaScript
- Backend: PHP API layer (`api/`)
- Database: MySQL (`sql/schema.sql`)

## Setup
1. Create the database: `mysql -u root -p < sql/schema.sql`
2. Configure credentials in `api/db.php`
3. Serve the project root with a PHP-capable server (e.g. `php -S localhost:8000`)
4. Open `index.html` in the browser

If the database is unavailable, scores fall back to browser local storage automatically.
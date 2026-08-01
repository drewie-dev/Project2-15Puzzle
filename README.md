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

# 15 Puzzle: Full-Stack Final Project

A themed 15 Puzzle game built with HTML5, CSS3, JavaScript, PHP, and MySQL. Players solve randomized, solvable puzzles while tracking their time and moves. Scores are stored in a MySQL leaderboard with a localStorage fallback.

---

## Features

- Three puzzle themes
  - Beach Boardwalk
  - Tide Pool
  - Sunset Skyline
- Randomized solvable puzzle generation
- Move counter
- Game timer
- Hint system
- Shuffle and Reset controls
- Leaderboard
- Responsive design
- Local storage fallback

---

## Tech Stack

- Frontend: HTML5, CSS3, JavaScript
- Backend: PHP
- Database: MariaDB (MySQL Compatible)

---

## Project Structure

```
15-puzzle/
│
├── api/
│   ├── db.php
│   ├── save_score.php
│   └── get_leaderboard.php
│
├── assets/
│   ├── beach/
│   ├── tidepool/
│   └── sunset/
│
├── css/
│   └── style.css
│
├── js/
│   └── script.js
│
├── sql/
│   └── schema.sql
│
└── index.html
```

---

## Database

- Database System: MariaDB
- SQL Schema: `sql/schema.sql`

### Table: `leaderboard`

| Column | Type |
|--------|------|
| id | INT (Primary Key) |
| player_name | VARCHAR |
| theme | VARCHAR |
| moves | INT |
| time | INT |
| created_at | TIMESTAMP |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/save_score.php` | POST | Saves a completed game score |
| `/api/get_leaderboard.php` | GET | Returns leaderboard scores |
| `/api/db.php` | — | Database connection |

---

## Responsive Breakpoints

| Screen Size | Layout |
|-------------|--------|
| Desktop | Full game layout |
| Tablet | Adjusted spacing and controls |
| Mobile | Stacked layout with resized puzzle board |

---

## Setup

1. Create a MariaDB database.
2. Import `sql/schema.sql`.
3. Update database credentials in `api/db.php`.
4. Run the project on a PHP-enabled server.
5. Open `index.html`.

---

## Notes

- Puzzle shuffles into a solvable configuration.
- Scores are stored in MySQL.
- If the database is unavailable, scores are saved locally using browser localStorage.
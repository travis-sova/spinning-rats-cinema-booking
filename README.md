<h1>
  <img src="https://github.com/user-attachments/assets/e0483a31-e7e0-4892-8fcc-d9b9061fa9f5" alt="Logo" style="height: 64px; vertical-align: middle; margin-right: 10px;">
  Spinning Rat's Cinema
</h1>

A full-stack school project for browsing movies, filtering showtimes, and demonstrating ticket and seat selection.

Built with Vue 3, TypeScript, Pinia, Vue Router, Vue I18n, Tailwind CSS, and DaisyUI, with an Express and MySQL backend.

## Features

- Movie listings and details
- Showtimes filtered by date and genre, with title sorting
- Cinema information, events, and news
- Account registration, login, profile editing, and password changes
- Admin tools for managing movies, shows, and users
- Movie poster uploads and per-show ticket prices
- Fixed cinema venues with predefined seating layouts
- English and Estonian interfaces
- Ticket selection, saved reservations, and account ticket history

## Demo limitations

Payments are simulated; no real payment provider is used. Seat reservations are
saved, and signed-in purchases appear in the account's ticket history. Guest
purchases are not linked to an account.

The application is intended for a local environment. API URLs currently point to `http://localhost:3000`.
Uploaded movie posters are stored in `backend/uploads/` and are excluded from Git.

## Requirements

- Node.js 22 and npm
- MySQL 8
- Git

## Local setup

### 1. Clone and install

```sh
git clone https://github.com/travis-sova/spinning-rats-cinema-booking.git
cd spinning-rats-cinema-booking

npm run setup
```

### 2. Configure the backend

Copy `backend/.env.example` to `backend/.env` and configure:

```dotenv
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=Cinema
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1h
```

The database name must match the database created below.

### 3. Create the development database

From the repository root, open the MySQL client:

```sh
mysql -u root -p
```

Then run:

```sql
CREATE DATABASE Cinema CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE Cinema;
SOURCE backend/DUMP/dump.sql;
```

**Import into a disposable development database: the dump drops and recreates its tables.**

For an existing database that has not had the initial pricing migration applied,
run both migrations in order:

```sql
SOURCE backend/migrations/001_movie_ticket_prices.sql;
SOURCE backend/migrations/002_show_ticket_prices.sql;
SOURCE backend/migrations/003_account_tickets_and_seat_capacity.sql;
SOURCE backend/migrations/004_fixed_venue_layouts.sql;
```

If migration 001 was already applied, run migrations 002, 003, and 004. If
migration 002 was already applied, run migrations 003 and 004. If migration 003
was already applied, run only `004_fixed_venue_layouts.sql`.
This migration enables account ticket history for future signed-in purchases and
allows show capacities above 127 seats. Existing guest orders remain unassigned.
Migration 004 stores the selected fixed venue for each new screening. Existing
screenings keep their legacy generated seat maps.

The seed includes:

- Three cinemas
- Twenty movies
- Forty screenings dated 19–25 January 2027
- a development-only `admin` account with the password `admin`

The sample screening dates are fixed. Update them when preparing a newer demo.

### 4. Start the application

From the repository root:

```sh
npm start
```

Open the frontend URL printed by Vite. The backend normally runs on port 3000.

Alternatively, start each service in a separate terminal:

```sh
npm --prefix backend run dev
```

```sh
npm --prefix frontend run dev
```

If the homepage contains no show cards, check that the database contains screenings as well as movies.

## Project structure

```text
backend/
  DUMP/          Database schema and demo seed data
  migrations/    Schema updates for existing databases
  middleware/    Authentication and request validation
  routes/        API endpoints

frontend/
  src/
    components/  Reusable interface components
    data/        Static news and event data
    locales/     English and Estonian translations
    router/      Page routes
    stores/      Application state
    types/       Shared TypeScript definitions
    views/       Page components
  tools/         Data preparation utilities
```

## Movie data utility

`frontend/tools/FetchMovies.js` retrieves movie data from TMDb and writes `movies.js` in the working directory.

It is a manual data-preparation utility for refreshing the SQL seed. It does not update MySQL automatically and is not part of application startup.

## Not implemented

- Persistent reservations and real seat availability
- Automated tests and CI checks
- Configurable API URLs
- Search
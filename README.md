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
- English and Estonian interfaces
- Demo ticket selection and purchase summaries

## Demo limitations

Seat occupancy is generated in the browser. Purchase pages display a summary; they do not process payments or save reservations.

The application is intended for a local environment. API URLs currently point to `http://localhost:3000`.

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
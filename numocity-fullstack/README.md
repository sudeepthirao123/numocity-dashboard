# Numocity Full-Stack Demo (React + Django + PostgreSQL)

This is the "Pro" version of the Numocity Dashboard. Unlike the root version (which is static for GitHub Pages), this requires a full server environment.

## Prerequisites
-   Python 3.9+
-   Node.js 16+
-   PostgreSQL

## Setup

### Backend (Django)
1.  Navigate to `backend/`:
    ```bash
    cd backend
    pip install -r requirements.txt
    ```
2.  Configure Database:
    -   Ensure PostgreSQL is running.
    -   Create a DB named `numocity_db`.
    -   Update `core/settings.py` with your DB credentials.
3.  Run Migrations & Server:
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    python manage.py runserver
    ```

### Frontend (React)
1.  Navigate to `frontend/`:
    ```bash
    cd frontend
    npm install
    ```
2.  Start Development Server:
    ```bash
    npm start
    ```
3.  Open `http://localhost:3000`.

## Features
-   **User Auth**: Django Session Authentication (or JWT).
-   **Database**: Full PostgreSQL persistence.
-   **API**: REST API via Django Rest Framework.

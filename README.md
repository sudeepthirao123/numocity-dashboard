# Numocity Dashboard (Static Edition)

https://sudeepthirao123.github.io/numocity-dashboard/

A modern, responsive EV charging station management dashboard, refactored for client-side execution.

## Features
- **User Dashboard**: View stations, start charging, manage wallet, view history.
- **Operator Dashboard**: Analytics (Charts), station status management, CSV export.
- **Authentication**: Client-side login/register simulation (Data persists in LocalStorage).
- **Design**: Glassmorphism UI, responsive layout, animations.

## Deployment (GitHub Pages)
1. Push this repository to GitHub.
2. Go to **Settings** > **Pages**.
3. Select **Source** > **Deploy from a branch**.
4. Select **Branch** > `main` (or `master`) and folder `/` (root).
5. Save. Your site will be live in a few minutes.

## Demo Credentials
Since this is a client-side app, you can register any new user.
Pre-seeded accounts:

| Role | Username | Password |
|------|----------|----------|
| User | `user` | `password` |
| Admin| `admin` | `admin` |

## Project Structure
- `index.html`: Landing & Login
- `dashboard.html`: User Interface
- `operator.html`: Admin Interface
- `assets/`: CSS, JS, Images
# ⚡ Numocity Dashboard
> **Next-Gen EV Charging Station Management System**

<<<<<<< HEAD
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-production_ready-success.svg)
![Version](https://img.shields.io/badge/version-2.0.0-purple.svg)
=======
https://sudeepthirao123.github.io/numocity-dashboard/

A modern, responsive EV charging station management dashboard, refactored for client-side execution.
>>>>>>> 87189aecab58af440abe3e063b31d757aa676d60

Numocity is a modern, high-performance dashboard designed for monitoring and managing Electric Vehicle (EV) charging infrastructure. It provides real-time insights into station status, energy consumption, and user transactions.

---

## 🚀 Two Editions Included

This repository contains two complete versions of the application, catering to different deployment needs.

### 1️⃣ Static Edition (WebAssembly)
**Designed for GitHub Pages & Static Hosting.**
- **Location**: `Root Directory`
- **Architecture**: Serverless Client-Side Application.
- **Database**: Real SQLite database running in the browser via `sql.js` (WebAssembly).
- **Persistence**: Data saved to LocalStorage.
- **Deployment**: Zero-config deployment to GitHub Pages.

### 2️⃣ Full-Stack Pro (Enterprise)
**Designed for Scalable Cloud Deployment.**
- **Location**: `numocity-fullstack/`
- **Architecture**: React (Frontend) + Django Rest Framework (Backend).
- **Database**: PostgreSQL.
- **Features**: JWT Auth, scalable API, robust data integrity.
- **Deployment**: Requires VPS/Cloud (AWS, DigitalOcean, Heroku).

---

## 🛠️ Tech Stack

### Frontend (Both Versions)
- **HTML5 / CSS3**: Custom "Glassmorphism" UI design.
- **JavaScript**: ES6+ modules.
- **Chart.js**: Interactive data visualization.

### Backend Engines
| Feature | Static Edition | Full-Stack Pro |
|:--------|:--------------:|:--------------:|
| **Language** | JavaScript (Client-Side) | Python (Django 4.2) |
| **Database** | SQLite (WASM) | PostgreSQL 14+ |
| **API** | Direct SQL Queries | REST API (DRF) |
| **Hosting** | GitHub Pages / Netlify | Docker / AC2 / App Platform |

---

## ✨ Features

### User Portal
- 🔋 **Live Station Status**: Real-time availability (Available, Occupied, Offline).
- ⚡ **Smart Charging**: Simulate charging sessions with cost calculation.
- 💳 **Wallet System**: Top-up and transaction history.
- 📊 **History**: Detailed logs of energy consumption and costs.

### Operator Dashboard
- 📈 **Analytics**: Visual breakdown of energy usage per station.
- 🔧 **Remote Management**: Toggle stations Online/Offline instantly.
- 📥 **Data Export**: One-click CSV export for external analysis (PowerBI/Excel).

---

## 🚦 Quick Start

### Option A: Run Static Edition (Instant)
1.  Clone the repository.
2.  Open `index.html` in any modern browser.
3.  **Done!** The app will initialize the SQLite database automatically.

### Option B: Deploy to GitHub Pages
1.  Push this repository to your GitHub account.
2.  Go to **Settings** → **Pages**.
3.  Source: `Deploy from a branch`.
4.  Branch: `main` / Folder: `/(root)`.
5.  Click **Save**. Your site is live!

### Option C: Run Full-Stack Pro (Dev Mode)
*Requires Python 3.9+ and Node.js 16+*

**Backend Setup:**
```bash
cd numocity-fullstack/backend
pip install -r requirements.txt
# Configure core/settings.py with your DB credentials
python manage.py migrate
python manage.py runserver
```

**Frontend Setup:**
```bash
cd numocity-fullstack/frontend
npm install
npm start
```

---

## 🔐 Credentials
Both versions come pre-seeded with these demo accounts:

| Role | Username | Password | Access Level |
|:-----|:---------|:---------|:-------------|
| **EV Driver** | `user` | `password` | Charging, Wallet, History |
| **Operator** | `admin` | `admin` | Analytics, Station Control, Export |

---

## 📂 Project Structure
```bash
numocity-dashboard/
├── index.html              # Landing Page & Auth Portal
├── dashboard.html          # User Dashboard
├── operator.html           # Admin Dashboard
├── assets/                 # Static Assets (CSS, JS, WASM)
│   ├── css/
│   ├── js/
│   │   ├── core.js        # Auth & App Logic
│   │   ├── database.js    # SQLite Engine Wrapper
│   │   └── ...
├── numocity-fullstack/     # PRO VERSION SOURCE CODE
│   ├── backend/           # Django Project
│   └── frontend/          # React Project
└── README.md              # Documentation
```

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

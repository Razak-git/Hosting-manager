# ⚡ Hosting Manager

A professional web hosting management platform inspired by cPanel, Plesk, and Hostinger — built as a full-stack internship project.

---

## 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router v6, Axios, Bootstrap 5, Chart.js |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Auth | JWT, bcryptjs |
| Email | Nodemailer |
| Scheduling | node-cron |
| File upload | Multer |

---

## 📁 Project Structure

```
hosting-manager/
├── backend/
│   ├── config/db.js              # MySQL connection + schema init
│   ├── controllers/
│   │   ├── authController.js     # Register (3-step), Login, GetMe
│   │   ├── siteController.js     # CRUD + stats + domain validation
│   │   └── fileController.js     # Upload, download, delete
│   ├── middleware/authMiddleware.js  # JWT verification
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── siteRoutes.js
│   │   └── fileRoutes.js
│   ├── services/
│   │   ├── emailService.js       # Nodemailer HTML emails
│   │   └── domainChecker.js      # DNS + HTTP domain validation
│   ├── server.js                 # Express app + cron job
│   └── .env.example
│
└── frontend/
    ├── public/index.html
    └── src/
        ├── pages/
        │   ├── Login.js           # Email + password login
        │   ├── Register.js        # 3-step: email → code → password
        │   ├── Dashboard.js       # Stats + Chart.js graphs
        │   ├── Sites.js           # Site CRUD with modals
        │   └── Files.js           # File manager with drag & drop
        ├── components/
        │   ├── Layout.js          # Sidebar + topbar shell
        │   ├── PrivateRoute.js    # Route guard
        │   ├── SiteCard.js        # Site row card
        │   └── StatsCard.js       # Dashboard stat tile
        ├── services/api.js        # Axios instance + all API calls
        ├── index.css              # Full design system (CSS vars, components)
        └── App.js                 # Router setup
```

---

## 🚀 Installation

### Prerequisites
- Node.js ≥ 18
- MySQL ≥ 8
- A Gmail account (or SMTP provider) for Nodemailer

---

### 1. Clone & setup backend

```bash
cd backend
cp .env.example .env
# Edit .env with your values (DB credentials, JWT secret, email)
npm install
```

### 2. Create MySQL database

```sql
CREATE DATABASE hosting_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> Tables are created **automatically** on first start via `initDatabase()`.

### 3. Start backend

```bash
npm run dev      # Development (nodemon)
# or
npm start        # Production
```

Server starts on `http://localhost:5000`

---

### 4. Setup frontend

```bash
cd frontend
npm install
npm start
```

App opens on `http://localhost:3000`

---

## ⚙️ Environment Variables

```env
# backend/.env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hosting_manager

JWT_SECRET=your_very_long_secret_key
JWT_EXPIRES_IN=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password       # Gmail App Password (not account password)
EMAIL_FROM=Hosting Manager <your@gmail.com>

UPLOAD_DIR=uploads
MAX_FILE_SIZE=52428800             # 50 MB in bytes
```

### Gmail App Password
1. Google Account → Security → 2-Step Verification → App passwords
2. Generate a password for "Mail"
3. Use that as `EMAIL_PASS`

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-code` | Send 6-digit email verification code |
| POST | `/api/auth/verify-code` | Verify code |
| POST | `/api/auth/register` | Create account (email + code + password) |
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Sites
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sites` | List user's sites |
| POST | `/api/sites` | Add site (validates domain) |
| PUT | `/api/sites/:id` | Update site name |
| DELETE | `/api/sites/:id` | Delete site |
| GET | `/api/sites/stats` | Get dashboard stats |

### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/files` | List user's files |
| POST | `/api/files/upload` | Upload file (multipart) |
| GET | `/api/files/:id/download` | Download file |
| DELETE | `/api/files/:id` | Delete file |

---

## 🔑 Key Features

### 3-Step Registration
1. Enter email → receives 6-digit code via email
2. Enter the code (with visual digit inputs)
3. Set and confirm password (with strength indicator)

### Domain Validation
Before any domain is stored, the server:
1. Performs a DNS lookup (`dns.lookup`)
2. Falls back to HTTP/HTTPS request if DNS fails
3. Rejects non-existent domains with a clear error message

### Automatic Monitoring (Cron)
Every 10 minutes, `node-cron` checks all registered domains:
- Updates `status` to `online` or `offline`
- Stores `last_checked` timestamp

### Dashboard
- 4 stat cards (total sites, online, offline, files)
- Line chart: 7-day uptime history (Chart.js)
- Doughnut chart: current status distribution
- Recent sites activity list

### File Manager
- Drag & drop upload zone
- Upload progress bar
- File type icons
- Search/filter
- Download and delete

---

## 🔒 Security

- Passwords hashed with **bcrypt** (12 salt rounds)
- Routes protected with **JWT Bearer tokens**
- Token auto-attached via Axios interceptor
- 401 responses auto-redirect to `/login`
- Email validation on registration
- Domain existence validation before insert
- Verification codes expire after 15 minutes and are single-use

---

## 📱 Responsive Design

- Sidebar collapses to overlay on mobile
- Stats grid adapts to 2 columns on small screens
- All modals are mobile-friendly
- Touch-friendly tap targets

---

## 🗄️ Database Schema

```sql
users           (id, email, password, created_at)
verification_codes (id, email, code, expires_at, used, created_at)
sites           (id, user_id, domain, name, status, last_checked, created_at, updated_at)
files           (id, user_id, filename, original_name, size, mimetype, path, created_at)
```

---

## 🎨 Design System

The UI uses a custom dark design system defined in `index.css`:
- **Font**: Sora (display) + JetBrains Mono (code/domains)
- **Colors**: Deep navy background (`#080b14`) with indigo accent (`#6366f1`)
- **Components**: Cards, badges, modals, upload zones, stat tiles — all themed via CSS variables
- **Animations**: Page entry, modal fade, hover lifts, pulse indicators

---

## 📦 Build for Production

```bash
# Frontend
cd frontend && npm run build

# Backend — serve frontend build as static files (optional)
# Or deploy separately (Vercel for frontend, Railway/Render for backend)
```

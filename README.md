# 📝 NotesFlow — Secure Notes & Auth Application

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68A063?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%20v9-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT%20Tokens-000000?style=flat&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> A modern, secure, full-stack notes management application with stateless JWT authentication, RESTful API endpoints, robust error handling, and a sleek, responsive glassmorphism UI.

---

## 🌟 Key Features

### 🔐 Authentication & Security
- **Stateless JWT Authentication**: Secure user session management via JSON Web Tokens with configurable expiration.
- **Password Protection**: Passwords are automatically salted and hashed using **bcryptjs** (12 rounds) via Mongoose pre-save hooks.
- **Resource Authorization**: Strict user data isolation — users can only view, edit, or delete notes that belong to their account.
- **Safe Database Queries**: Password hashes are flagged with `select: false` so they are never exposed in database reads by default.

### 📋 Notes Management
- **Full CRUD Capabilities**: Create, read, update, and delete notes in real time.
- **Search & Filter**: Client-side instant keyword filtering across note titles and content.
- **Auto Timestamps**: Notes are automatically stamped with creation and last-updated timestamps.

### 🎨 Modern Frontend UI
- **Responsive Glassmorphism Design**: Polished, modern UI built with clean vanilla HTML5, CSS3, and JavaScript.
- **Dark & Light Modes**: Seamless theme switching with persistent user preference storage.
- **Toast Notifications**: Non-intrusive feedback for actions like login, note creation, and deletions.
- **Interactive Modals**: Smooth creation and editing modals with real-time character counters.

### 🛡️ Robust Backend Architecture
- **Centralized Error Handling**: Custom middleware handles Mongoose validation errors, duplicate keys (`E11000`), invalid `ObjectId` formats (`CastError`), and 404s.
- **Graceful Process Handling**: Listens for `SIGTERM` and `unhandledRejection` events to safely close database connections and server listeners.
- **Environment Driven**: Fully configurable via `.env` files with sample configurations provided.

---

## 🏗️ Project Architecture

```
Notes-Auth/
├── public/                 # Frontend client assets
│   ├── app.js              # Client-side controller, auth state, API client
│   ├── index.html          # Semantic HTML5 layout with modals & nav
│   └── style.css           # Modern styles, CSS variables, dark/light theme
├── src/
│   ├── config/
│   │   └── db.js           # Mongoose MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js  # User registration and login handlers
│   │   └── noteController.js  # CRUD controller logic with ownership checks
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT verification and route protection
│   │   └── errorMiddleware.js # Global error handler and 404 catcher
│   ├── models/
│   │   ├── Note.js         # Note schema with user reference & indexing
│   │   └── User.js         # User schema with pre-save hash & match methods
│   ├── routes/
│   │   ├── authRoutes.js   # POST /register, POST /login
│   │   └── noteRoutes.js   # GET, POST, PUT, DELETE /api/notes
│   └── app.js              # Express app setup, middlewares, static serving
├── .env.example            # Sample environment variables template
├── .gitignore              # Ignored files (node_modules, .env, etc.)
├── package.json            # Project dependencies and npm scripts
├── server.js               # Application entry point & graceful shutdown
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (comes with Node.js)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or a [MongoDB Atlas](https://www.mongodb.com/atlas) cloud URI.

### 1. Clone the Repository
```bash
git clone https://github.com/Bhawna-8910/Notes-Auth.git
cd Notes-Auth
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file and update the values:
```bash
cp .env.example .env
```

Edit `.env` with your preferred configuration:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/notes_db
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
```

### 4. Run the Server

#### Development Mode (with hot-reloading via nodemon):
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

Once running, visit **`http://localhost:5000`** in your browser to interact with the web application!

---

## 📡 REST API Reference

All protected endpoints require an `Authorization` header containing the Bearer token:
```http
Authorization: Bearer <your_jwt_token>
```

### Auth Endpoints

| Method | Endpoint | Description | Auth Required | Request Body |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Register a new user | ❌ | `{ "email": "user@test.com", "password": "password123" }` |
| `POST` | `/api/auth/login` | Authenticate & get token | ❌ | `{ "email": "user@test.com", "password": "password123" }` |

#### Successful Auth Response (`200 OK` / `201 Created`):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "673752e50cfb890012345678",
    "email": "user@test.com"
  }
}
```

---

### Notes Endpoints

| Method | Endpoint | Description | Auth Required | Request Body |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/notes` | Get all notes for logged-in user | ✅ | _None_ |
| `POST` | `/api/notes` | Create a new note | ✅ | `{ "title": "My Note", "content": "Note body here" }` |
| `PUT` | `/api/notes/:id` | Update an existing note | ✅ | `{ "title": "Updated", "content": "Updated content" }` |
| `DELETE` | `/api/notes/:id` | Delete a note by ID | ✅ | _None_ |

#### Sample Note Object:
```json
{
  "_id": "673758a012ab34cd56ef7890",
  "title": "Project Architecture Overview",
  "content": "Modular MVC layout with separate routes, models, and controllers.",
  "user": "673752e50cfb890012345678",
  "createdAt": "2026-11-15T07:15:00.000Z",
  "updatedAt": "2026-11-15T07:15:00.000Z"
}
```

---

## 🗄️ Database Schemas

### User Schema (`User.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `email` | `String` | Required, Unique, Lowercase, Regex validated | User email address |
| `password` | `String` | Required, Min length 6, `select: false` | Hashed password |
| `timestamps` | `Boolean` | `createdAt`, `updatedAt` | Auto-managed audit timestamps |

### Note Schema (`Note.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `user` | `ObjectId` | Ref: `User`, Required, Indexed | Owner user ID |
| `title` | `String` | Required, Trimmed, Max 120 chars | Note title |
| `content` | `String` | Required | Main note content |
| `timestamps` | `Boolean` | `createdAt`, `updatedAt` | Auto-managed audit timestamps |

---

## 🧪 Testing

The project is configured for testing with **Jest** and **Supertest**:
```bash
npm test
```

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/) (v5)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Security**: [bcryptjs](https://github.com/dcodeIO/bcrypt.js), [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), [cors](https://github.com/expressjs/cors)
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 Variables & Flexbox/Grid
- **Dev Tools**: [Nodemon](https://nodemon.io/), [Dotenv](https://github.com/motdotla/dotenv), [Jest](https://jestjs.io/)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

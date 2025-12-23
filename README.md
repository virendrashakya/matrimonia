# Matrimonia - Private Matrimonial Application

A private matrimonial web application for community elders to manage marriage profiles with fraud-resistant social recognition.

## Features

- **Profile Management**: Create, update, view, and soft-delete matrimonial profiles with structured biodata
- **Recognition System**: Fraud-resistant scoring based on verified community members
- **Fraud Detection**: Phone reuse detection, risk scoring, manual flagging
- **Advanced Search**: Filter by age, caste, city, education, recognition level
- **Role-Based Access**: Admin, Elder, Helper, Contributor with different weights

## Tech Stack

- **Backend**: Node.js + Express + MongoDB + Mongoose
- **Frontend**: React + Vite + React Router
- **Auth**: JWT with bcrypt password hashing
- **File Storage**: Cloudinary
- **Styling**: Vanilla CSS (elder-friendly design)

## Project Structure

```
matrimonia/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, Cloudinary config
│   │   ├── middleware/     # Auth, validation
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── app.js          # Express app
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   └── App.jsx         # Router setup
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your MongoDB URI and Cloudinary keys
# Then start the server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (proxies API calls to backend)
npm run dev
```

### Environment Variables (backend/.env)

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/matrimonia
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=http://localhost:3000
```

## API Overview

| Category | Endpoint | Description |
|----------|----------|-------------|
| Auth | `POST /api/auth/register` | Register user |
| Auth | `POST /api/auth/login` | Login |
| Profiles | `GET /api/profiles` | List profiles |
| Profiles | `POST /api/profiles` | Create profile |
| Recognition | `POST /api/profiles/:id/recognitions` | Add recognition |
| Search | `GET /api/search/profiles` | Search with filters |
| Admin | `GET /api/admin/fraud-flags` | Flagged profiles |

## Recognition System

**Weights by Role:**
- Admin: 10, Elder: 8, Helper: 5, Contributor: 2

**Recognition Types:**
- Know personally (1.5x multiplier)
- Know family (1.3x)
- Verified documents (1.2x)
- Community reference (1.0x)

**Levels:** New (0-5) → Low (5-20) → Moderate (20-50) → High (50+)

## License

Private - Community Use Only

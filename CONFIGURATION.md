# Application Configuration

This document outlines the environment variables, system requirements, and configuration settings required to run **Pechan (Matrimonia)**.

## System Requirements

Before running the application, ensure the following are installed:

- **Node.js**: v18.x or higher (v20 Recommended)
- **NPM**: v9.x or higher
- **MongoDB**: v6.0+ (Local installation) or MongoDB Atlas (Cloud)
- **Git**: For version control

## Environment Variables

The application uses `.env` files to manage configuration.
- **Backend:** Create a `.env` file in the `backend/` directory.
- **Frontend:** Create a `.env` file in the `frontend/` directory (or `.env.production`).

### 1. Backend Configuration (`backend/.env`)

These variables are **CRITICAL** for the server to function.

| Key | Required? | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `5000` | The port the backend server listens on. |
| `MONGODB_URI` | **Yes** | - | Connection string for MongoDB database (local or Atlas). |
| `JWT_SECRET` | **Yes** | - | Secret key for signing JSON Web Tokens (auth). **Must be strong.** |
| `NODE_ENV` | No | `development` | Set to `production` in live environments. |

> **Tip:** Generate a strong `JWT_SECRET` using this terminal command:
> ```bash
> openssl rand -base64 64
> ```
> Never commit this secret to version control.
>
> **Important:** If you lose or change the `JWT_SECRET`:
> 1.  **Passwords are SAFE:** User passwords are stored in the database and are NOT affected. No one needs to reset their password.
> 2.  **Sessions are INVALIDATED:** All currently logged-in users will be logged out and must log in again.
> 3.  **Backup your .env:** Keep a secure copy of your production `.env` file locally so you can restore the same secret if needed.

| `FRONTEND_URL` | No | `http://localhost:8000` | URL of the frontend app (used for CORS and Invite links). |

#### External Services (Optional but Recommended)

| Key | Required? | Description |
| :--- | :---: | :--- |
| `CLOUDINARY_CLOUD_NAME` | **Yes** | Cloudinary Cloud Name (for Image Uploads). |
| `CLOUDINARY_API_KEY` | **Yes** | Cloudinary API Key. |
| `CLOUDINARY_API_SECRET` | **Yes** | Cloudinary API Secret. |
| `GOOGLE_CLIENT_ID` | No | Google OAuth Client ID (for Google Login). |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth Client Secret. |
| `GEMINI_API_KEY` | No | Google Gemini API Key (for AI Biodata Parsing). |

> **Note:** If `CLOUDINARY_*` keys are missing, image uploads will fail.
> **Note:** If `GOOGLE_*` keys are missing, "Login with Google" will not work.
> **Note:** If `GEMINI_API_KEY` is missing, the AI parser feature will be disabled.

---

### 2. Frontend Configuration (`frontend/.env`)

| Key | Required? | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | **Yes** | `/api` | Base URL for the Backend API. |

#### Notes on `VITE_API_URL`:
- **Development:** Usually left undefined or `/api` if using proxy.
- **Production:** Set to the full URL of your backend (e.g., `https://api.example.com` or `http://your-ip/api`) if not hosted on the same origin, or keep `/api` if using Nginx reverse proxy (recommended).

## External Services Setup

### 1. Cloudinary (Image Storage)
*Required for profile photo uploads.*
1.  Sign up at [Cloudinary](https://cloudinary.com/).
2.  Go to the Dashboard.
3.  Copy `Cloud Name`, `API Key`, and `API Secret`.
4.  Add these to `backend/.env`.

### 2. Google OAuth (Login with Google)
*Optional, helps with quick registration.*
1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new Project.
3.  Navigate to **APIs & Services** > **Credentials**.
4.  Create **OAuth 2.0 Client ID**.
5.  Set **Authorized Redirect URIs** to:
    -   `http://localhost:3000/api/auth/google/callback` (Local Development)
    -   `https://your-domain.com/api/auth/google/callback` (Production)
6.  Copy `Client ID` and `Client Secret` to `backend/.env`.

### 3. Google Gemini AI (Bio Parser)
*Optional, used for extracting profile data from uploaded Biodatas.*
1.  Get an API Key from [Google AI Studio](https://aistudio.google.com/).
2.  Add `GEMINI_API_KEY` to `backend/.env`.

## Registration Requirements

To successfully register a new user using the default flow (Phone/Password), you need:
1.  **MongoDB Connection** (`MONGODB_URI`) working.
2.  **JWT Secret** (`JWT_SECRET`) configured.

To register using Google:
1.  **Google OAuth Credentials** (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) configured.

## Minimal Setup for Local Run

**backend/.env**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/matrimonia
JWT_SECRET=supersecretkey
CLOUDINARY_CLOUD_NAME=fake (if not uploading images)
CLOUDINARY_API_KEY=fake
CLOUDINARY_API_SECRET=fake
```

**frontend/.env**
```env
# Optional, defaults to proxy in vite.config.js
VITE_API_URL=http://localhost:3000/api
```

## How to Run the Application

### Development Mode
Runs with hot-reloading for code changes.
1.  **Backend:** `cd backend && npm run dev` (Runs on port 3000)
2.  **Frontend:** `cd frontend && npm run dev` (Runs on port 8000)

### Production Mode
1.  **Backend:** `cd backend && npm start`
2.  **Frontend:** `cd frontend && npm run build` (Serve the `dist/` folder using Nginx/Apache)

## Troubleshooting

| Issue | Possible Cause | Fix |
| :--- | :--- | :--- |
| **"Connection Refused" (Mongo)** | MongoDB not running or URI wrong. | Check `MONGODB_URI`. Ensure mongod service is active. |
| **"Invalid Token" / "Logout"** | `JWT_SECRET` changed or mismatched. | Ensure backend uses the same secret. Clear browser cookies. |
| **Image Upload Fail** | Cloudinary keys missing. | Check `CLOUDINARY_*` keys in `.env`. |
| **Google Login Fail** | Redirect URI mismatch. | Whitelist `http://localhost:3000...` in Google Console. |
| **CORS Error** | Frontend URL mismatch. | Set `FRONTEND_URL` in backend `.env` to your frontend's address. |
| **Site Not Loading (Timeout)** | AWS Security Group blocked. | Ensure Inbound Rules allow HTTP (80) and HTTPS (443) from `0.0.0.0/0`. |

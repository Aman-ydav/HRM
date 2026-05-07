# HRM Employee Reward System - Development Guide

## Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB Atlas connection string
- Google Gemini API key
- Brevo (Sendinblue) API key for email

### Environment Setup

#### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install --legacy-peer-deps
   ```

2. **Configure Environment Variables**
   
   Copy `.env.example` to `.env` and update with your credentials:
   ```bash
   cp .env.example .env
   ```

   **Required Variables:**
   - `MONGODB_URI` - MongoDB Atlas connection string
   - `ACCESS_TOKEN_SECRET` - Secret key for JWT access token
   - `REFRESH_TOKEN_SECRET` - Secret key for JWT refresh token
   - `BREVO_API_KEY` - Brevo (Sendinblue) API key for email
   - `SMTP_FROM_EMAIL` - Email sender address
   - `GENAI_API_KEY` - Google Gemini API key
   - `CORS_ALLOWED_ORIGINS` - Comma-separated list of allowed frontend URLs

   **Example .env:**
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hrm
   
   ACCESS_TOKEN_SECRET=your_secret_here
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_secret_here
   REFRESH_TOKEN_EXPIRY=10d
   
   BREVO_API_KEY=xkeysib-xxxxx
   SMTP_FROM_EMAIL="Your Company <noreply@company.com>"
   
   GENAI_API_KEY=AIzaXXXX
   GENAI_MODEL=gemini-2.5-flash
   
   CORS_ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
   
   API_BASE_URL=http://localhost:5000
   API_VERSION=v1
   ```

3. **Start Backend with Hot Reload**
   ```bash
   npm run dev
   ```
   Backend will start on `http://localhost:5000`

#### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   ```

2. **Configure Environment Variables**
   
   Create or update `.env`:
   ```
   VITE_API_URL=http://localhost:5000/api/v1
   VITE_SOCKET_URL=http://localhost:5000
   VITE_APP_NAME=HRM - Employee Reward System
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Frontend will start on `http://localhost:5173`

### Running Both Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Starts on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Starts on http://localhost:5173
```

**Terminal 3 - MongoDB (optional if using Atlas):**
If using local MongoDB:
```bash
mongod
```

## Testing the Application

### Demo Credentials
```
Email: admin@hrm.com
Password: Password123

Email: hr@hrm.com
Password: Password123

Email: emp@hrm.com
Password: Password123
```

### Login Flow Test
1. Go to `http://localhost:5173/login`
2. Enter credentials from above
3. Should redirect to dashboard with appropriate role-based UI

### API Testing
Use Postman or any HTTP client to test endpoints:
```
Base URL: http://localhost:5000/api/v1

Examples:
GET /api/v1/auth/profile (requires JWT token)
POST /api/v1/attendance/check-in (requires JWT token)
GET /api/v1/dashboard/admin (admin only)
```

## Production Deployment

### Backend Deployment (Render/Railway)

1. **Update .env for Production:**
   ```
   NODE_ENV=production
   MONGODB_URI=your_production_db
   CORS_ALLOWED_ORIGINS=https://yourdomain.vercel.app
   API_BASE_URL=https://api.yourdomain.com
   ```

2. **Deploy:**
   - Push to GitHub
   - Connect to Render/Railway
   - Set environment variables in dashboard
   - Auto-deploy on push

### Frontend Deployment (Vercel)

1. **Update .env for Vercel:**
   ```
   VITE_API_URL=https://api.yourdomain.com/api/v1
   VITE_SOCKET_URL=https://api.yourdomain.com
   ```

2. **Deploy:**
   - Connect GitHub repo to Vercel
   - Vercel auto-detects Vite config
   - Auto-deploys on push to main branch

## Development Scripts

### Backend
```bash
npm run dev      # Start with nodemon (hot reload)
npm start        # Start production build
npm run seed     # Seed database with test data
```

### Frontend
```bash
npm run dev      # Start dev server with hot reload
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

## Environment-Specific Configuration

### CORS Setup
The backend automatically configures CORS based on environment:

**Development:**
- Allows: `http://localhost:5173`

**Production:**
- Allows: Your deployed frontend URL

Specify multiple origins with comma separation:
```
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://yourapp.vercel.app,https://yourdomain.com
```

## API Keys & Services

### Google Gemini API
- **Purpose:** AI recommendations, burnout analysis, reward fairness
- **Get Key:** https://ai.google.dev
- **Model:** gemini-2.5-flash (recommended)
- **Cost:** Free tier available, then pay-as-you-go

### Brevo (Sendinblue)
- **Purpose:** Email notifications
- **Get Key:** https://www.brevo.com
- **Features:** Email templates, scheduling, analytics
- **Free Tier:** 300 emails/day

### MongoDB Atlas
- **Purpose:** Database
- **Get URL:** https://www.mongodb.com/cloud/atlas
- **Connection:** `mongodb+srv://user:pass@cluster.mongodb.net/dbname`

## Troubleshooting

### CORS Errors
**Problem:** "Access to XMLHttpRequest at 'http://localhost:5000/...' blocked"

**Solution:**
1. Verify `CORS_ALLOWED_ORIGINS` includes frontend URL
2. Ensure `credentials: true` is set in axios config
3. Clear browser cache and cookies

### JWT Errors
**Problem:** "Invalid token" or "Token expired"

**Solution:**
1. Verify JWT secrets in `.env` are set correctly
2. Check token expiry times are reasonable
3. Clear localStorage and re-login

### Database Connection
**Problem:** "Cannot connect to MongoDB"

**Solution:**
1. Verify MongoDB URI in `.env` is correct
2. Check MongoDB Atlas IP whitelist includes your IP
3. Test connection: `mongodb+srv://...` should work

### Hot Reload Not Working
**Problem:** Changes in backend not reflected

**Solution:**
1. Ensure running with `npm run dev` (not `npm start`)
2. Check nodemon is installed: `npm list nodemon`
3. Verify file is saved (Ctrl+S)

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: description"

# Push to remote
git push origin feature/feature-name

# Create pull request on GitHub
```

## Performance Tips

- **Frontend:** Use Vite's code splitting, lazy load routes
- **Backend:** Add caching, database indexes, pagination
- **Database:** Monitor query performance, add indexes for frequently filtered fields
- **API:** Implement rate limiting, request logging

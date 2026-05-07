# HRM Reward System - Frontend

Complete React + Vite + Tailwind CSS frontend for the Employee Reward Management System.

## Features

✨ **Employee Dashboard**
- Real-time check-in/check-out
- Attendance tracking and analytics
- Reward history and leaderboard
- Performance reviews and analytics
- Feedback submission and management
- AI-powered insights (Gemini)

🏢 **Admin Dashboard**
- System-wide analytics
- Employee management
- Reward assignment and approval
- Department breakdown
- Monthly trends and forecasting

🎨 **Modern UI**
- Orange (#FF5E00) + Dark color scheme (NO BLUE)
- Responsive design (mobile, tablet, desktop)
- Smooth animations with Tailwind CSS
- Dark mode optimized
- Accessible components

## Tech Stack

- **Framework:** React 19.2.5 + Vite 8
- **Styling:** Tailwind CSS 3.4
- **Routing:** React Router v6
- **HTTP Client:** Axios 1.6.2
- **Icons:** Lucide React
- **API:** RESTful backend at http://localhost:5000/api/v1

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend server running (http://localhost:5000)

### Installation

1. **Clone and Install Dependencies**
```bash
cd frontend
npm install
```

2. **Configure Environment**
Create `.env` file (already provided as `.env.example`):
```
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=HRM - Employee Reward System
```

3. **Start Development Server**
```bash
npm run dev
```
Visit http://localhost:5173

### Production Build
```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── App.jsx              # Main app with routing
├── main.jsx             # Entry point
├── index.css            # Tailwind CSS imports
│
├── contexts/
│   └── AuthContext.jsx  # Authentication state management
│
├── layouts/
│   ├── DashboardLayout.jsx   # Main app layout with sidebar
│   └── AuthLayout.jsx        # Login/Register layout
│
├── pages/
│   ├── auth/ (4 pages)
│   ├── dashboard/
│   ├── attendance/
│   ├── rewards/
│   ├── performance/
│   ├── feedback/
│   ├── ai/
│   └── admin/ (3 pages)
│
├── components/
│   ├── ProtectedRoute.jsx
│   └── ui/ (Button, Card, Badge, Modal, etc.)
│
└── lib/
    └── api.js # Axios + all backend services
```

## Color Scheme (NO BLUE)

- **Primary:** Orange #FF5E00
- **Dark:** #0A0A0A, #111111
- **Gray:** #1A1A1A, #B8B8B8
- **Success:** #22c55e (Emerald)
- **Warning:** #eab308 (Yellow)
- **Error:** #ef4444 (Red)

## Quick Start

```bash
npm install
npm run dev
# Visit http://localhost:5173
# Login with: admin@hrm.com / Password123
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Testing Flow

1. **Auth:** Login → Verify token → Check dashboard
2. **Attendance:** Check-in → Check-out → View history
3. **Rewards:** View → Leaderboard → History
4. **Admin:** Dashboard → Manage → Assign rewards

## Deployment

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy dist/ folder
```

## Documentation

See [FRONTEND_SETUP.md](./FRONTEND_SETUP.md) for detailed setup and architecture.

# Frontend Developer Assignment - Full Stack Task Manager

A scalable web application with authentication and dashboard functionality built with React.js/Next.js and Node.js/Express.

## 🚀 Features Implemented

### ✅ Frontend (Primary Focus)
- **Modern React.js with Next.js 15** - Latest App Router with TypeScript
- **Responsive Design** - TailwindCSS for beautiful, mobile-first UI
- **Form Validation** - React Hook Form with Zod schema validation (client + server-side)
- **Protected Routes** - Login required for dashboard access
- **Authentication UI** - Complete login/register flows with error handling

### ✅ Backend (Supportive)
- **Node.js/Express Server** - RESTful API with proper error handling
- **JWT Authentication** - Secure token-based auth with bcrypt password hashing
- **MongoDB Database** - User and Task models with Mongoose ODM
- **CRUD Operations** - Complete task management with filtering and pagination
- **Security Middleware** - CORS, Helmet, input validation, and authentication

### ✅ Dashboard Features
- **User Profile Display** - Shows user information fetched from backend
- **Task Management** - Full CRUD operations (Create, Read, Update, Delete)
- **Real-time Updates** - Task status changes reflect immediately
- **Clean Interface** - Intuitive task listing with priority and status indicators
- **Secure Logout** - Proper session management

### ✅ Security & Scalability
- **Password Security** - bcrypt hashing with salt rounds
- **JWT Middleware** - Token validation on protected routes
- **Input Validation** - express-validator for API endpoints
- **Error Handling** - Comprehensive error responses with proper HTTP codes
- **Modular Architecture** - Organized codebase for easy scaling

## 🛠 Tech Stack

**Frontend:**
- Next.js 15 (React 18)
- TypeScript
- TailwindCSS
- React Hook Form + Zod
- Axios for API calls
- js-cookie for token management

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT + bcrypt
- express-validator
- CORS + Helmet
- dotenv for configuration

## 📦 Project Structure

```
Frontend-Developer-Assignment/
├── backend/
│   ├── models/          # Database models (User, Task)
│   ├── controllers/     # Business logic (auth, tasks)
│   ├── routes/          # API endpoints
│   ├── middleware/      # JWT auth middleware
│   ├── server.js        # Express app entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js App Router pages
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # React context (AuthContext)
│   │   ├── lib/         # Utilities (API client, validations)
│   │   └── types/       # TypeScript type definitions
│   └── package.json
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or MongoDB Atlas)
- Git

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd Frontend-Developer-Assignment
```

### 2. Quick Start (Windows)
Use the startup script to launch both backend and frontend (assumes Node and npm are available):
```bat
start.bat
```
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

### 3. Backend Setup (manual)
```bash
cd backend
npm install

# Create .env from template
# Windows (PowerShell)
Copy-Item .env.example .env
# macOS/Linux
cp .env.example .env

# Edit .env with your MongoDB connection or Atlas credentials

# Start the backend server
echo NODE_ENV=development >> .env
npm run dev
```

### 4. Frontend Setup (manual)
```bash
cd ../frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

### 5. Docker (optional)
A docker-compose.yml is provided:
```bash
# Provide env in backend/.env for MONGO_USER, MONGO_PASS, DB_NAME
# Then launch services
docker compose up --build
```
- MongoDB: exposed on 27017
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

### 4. Environment Variables

**Backend (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/frontend-developer-assignment
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
NODE_ENV=development
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)
- `GET /api/auth/validate` - Validate JWT token

### Tasks
- `GET /api/tasks` - Get all tasks with filtering (protected)
- `POST /api/tasks` - Create new task (protected)
- `GET /api/tasks/:id` - Get single task (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)
- `POST /api/tasks/bulk` - Bulk operations (protected)

### Users
- `GET /api/users/me` - Get current user (protected)
- `GET /api/users/stats` - Get user statistics (protected)

## 🧪 Testing the Application

### Manual Testing Flow:
1. **Registration**: Create a new account at `/register`
2. **Login**: Sign in with your credentials at `/login`
3. **Dashboard**: Access protected dashboard with user profile
4. **Task Management**: Create, update status, and delete tasks
5. **Logout**: Secure session termination

### Example API Usage:
```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com", 
    "password": "Password123"
  }'

# Create a task (requires JWT token)
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete assignment",
    "priority": "high"
  }'
```

## 🏗 Production Scaling Notes

### Frontend Scaling:
1. Static Generation (SSG) for static pages where possible
2. CDN-backed deployment (e.g., Vercel/Netlify) for global performance
3. Route-based code splitting and lazy loading of heavy components
4. Performance optimizations (React.memo, useMemo, useCallback where appropriate)
5. Error boundaries for crash protection

### Backend Scaling:
1. Database optimization: indexes, connection pooling
2. Caching layer: Redis for rate-limits and API responses
3. Horizontal scaling via PM2 cluster mode or container orchestration
4. API rate limiting (already implemented)
5. Observability: structured logging (Winston/pino), health checks, uptime monitoring

### DevOps & Deployment:
1. Containerization with Docker (compose config included)
2. CI/CD with GitHub Actions (basic CI included)
3. Environment-specific configs and secrets via env vars
4. Database migrations/versioning strategy
5. Security: HTTPS, secret management, security headers

### Token Storage (Auth)
- In this implementation, JWT is stored in a cookie (client-managed via js-cookie) and attached as an Authorization header for API calls.
- For production hardening, prefer issuing an HTTP-only, Secure cookie from the backend and validating CSRF via SameSite=strict or a CSRF token. Update the axios layer accordingly.

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Security**: Secure tokens with expiration (7 days)
- **Input Validation**: Server-side validation with express-validator
- **CORS Configuration**: Restricted origins in production
- **Security Headers**: Helmet.js for security headers
- **Protected Routes**: Authentication middleware on sensitive endpoints

## 🎯 Key Highlights

1. **Modern Stack**: Latest Next.js 15 with App Router and TypeScript
2. **Production Ready**: Comprehensive error handling and security measures
3. **Scalable Architecture**: Clean separation of concerns, modular design
4. **User Experience**: Smooth authentication flow with loading states
5. **Developer Experience**: TypeScript, ESLint, proper project structure

## 📝 Development Notes

- Built with modern React patterns (hooks, context, functional components)
- Responsive design tested on desktop and mobile viewports
- Form validation provides immediate feedback to users
- API responses include proper HTTP status codes and error messages
- JWT tokens stored securely in HTTP-only cookies (in production)

## 🏆 Assignment Completion

✅ **Frontend**: React.js with Next.js, TailwindCSS, form validation, protected routes  
✅ **Backend**: Node.js/Express APIs with JWT auth, MongoDB integration  
✅ **Dashboard**: User profile display, full CRUD task management  
✅ **Security**: Password hashing, JWT middleware, input validation  
✅ **Documentation**: Complete README with setup instructions  

This project demonstrates proficiency in modern full-stack development with a focus on security, scalability, and user experience.

---

**Author**: Frontend Developer Assignment  
**Completion Time**: 3 days  
**Focus**: Production-ready, scalable web application with authentication
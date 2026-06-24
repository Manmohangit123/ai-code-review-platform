# AI Code Review Platform

> A production-grade, full-stack AI-powered code review platform that analyzes GitHub repositories using Google Gemini AI — deployed on Vercel and Railway.

**Live Demo:** [https://ai-code-review-pro-seven.vercel.app](https://ai-code-review-pro-seven.vercel.app)

---

## What It Does

This platform connects to your GitHub account and uses AI to automatically review your code for bugs, security vulnerabilities, performance issues, and generates professional README files — all in a clean, modern UI.

---

## Features

### GitHub Integration
- **OAuth Login** — Authenticate securely with your GitHub account
- **Repository Browser** — View all your GitHub repositories with metadata
- **File Tree Explorer** — Navigate repository folder structure and view file contents

### AI-Powered Code Analysis (Google Gemini 2.5 Flash)
- **AI Code Review** — Analyzes code for bugs, logic errors, code quality issues, and missing error handling with an overall score (0–100) and detailed findings per line
- **Security Scan** — Detects OWASP Top 10 vulnerabilities including SQL injection, XSS, hardcoded secrets, insecure authentication, path traversal, and command injection
- **Performance Scan** — Identifies performance bottlenecks such as O(n²) complexity, N+1 database queries, memory leaks, blocking operations, and unnecessary re-renders
- **README Generator** — Auto-generates a complete, professional README.md from your repository's file structure and code samples

### PR Analysis
- View open Pull Requests for any repository
- Analyze PR files for code quality issues with severity badges

### Dashboard & Analytics
- Overview of total reviews, repositories analyzed, and issues found
- Recent activity feed

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│                 │     │                  │     │                  │
│    Frontend     │────▶│   Auth Service   │────▶│    PostgreSQL    │
│  React + Vite   │     │   Node.js/Express│     │    (Railway)     │
│   (Vercel)      │     │   (Railway)      │     │                  │
│                 │     └──────────────────┘     └──────────────────┘
│                 │
│                 │     ┌──────────────────┐
│                 │────▶│  GitHub Service  │
│                 │     │  Node.js/Express │
│                 │     │  (Railway)       │
│                 │     └──────────────────┘
│                 │
│                 │     ┌──────────────────┐     ┌──────────────────┐
│                 │────▶│   AI Service     │────▶│  Google Gemini   │
└─────────────────┘     │  Python FastAPI  │     │  2.5 Flash API   │
                        │  (Railway)       │     └──────────────────┘
                        └──────────────────┘
```

**Microservices architecture** with 4 independent services communicating over REST APIs:

| Service | Tech | Responsibility |
|---|---|---|
| Frontend | React 18, Vite, Axios | UI, routing, state management |
| Auth Service | Node.js, Express, JWT | GitHub OAuth, user sessions |
| GitHub Service | Node.js, Express | GitHub API proxy, repo/file data |
| AI Service | Python, FastAPI, httpx | AI analysis via Gemini API |
| Database | PostgreSQL | User data and GitHub tokens |

---

## Tech Stack

### Frontend
- **React 18** — Component-based UI
- **Vite** — Fast build tool and dev server
- **React Router v6** — Client-side routing
- **Axios** — HTTP client for API calls
- **CSS Variables** — Custom design system with dark theme

### Backend Services
- **Node.js + Express** — Auth and GitHub services
- **Python 3.13 + FastAPI** — AI service with async support
- **JWT (jsonwebtoken)** — Stateless authentication
- **express-rate-limit** — API rate limiting
- **httpx** — Async HTTP client for Gemini API calls
- **pydantic** — Request/response validation

### AI & External APIs
- **Google Gemini 2.5 Flash** — Primary AI model for code analysis
- **GitHub REST API** — Repository, file tree, PR data
- **GitHub OAuth 2.0** — User authentication

### Infrastructure & Deployment
- **Vercel** — Frontend hosting with SPA routing (vercel.json rewrites)
- **Railway** — Backend services hosting (3 services + PostgreSQL)
- **PostgreSQL** — Relational database for user data
- **nixpacks** — Railway build configuration
- **GitHub Actions** — Automatic deploys on push

---

## Project Structure

```
ai-code-review-platform/
├── services/
│   ├── frontend/               # React + Vite SPA
│   │   ├── src/
│   │   │   ├── pages/          # Dashboard, Repos, RepoDetail, PRAnalysis, etc.
│   │   │   ├── components/     # Navbar, Sidebar, ErrorBoundary
│   │   │   ├── context/        # AuthContext (JWT management)
│   │   │   └── services/       # api.js (all HTTP calls)
│   │   └── vercel.json         # SPA routing rewrites
│   │
│   ├── auth-service/           # Node.js OAuth + JWT service
│   │   └── src/
│   │       ├── routes/         # /auth/github, /auth/callback, /auth/me
│   │       └── index.js        # Express app with rate limiting
│   │
│   ├── github-service/         # Node.js GitHub API proxy
│   │   └── src/
│   │       ├── routes/         # /github/repos, /tree, /file, /pulls
│   │       └── middleware/     # JWT auth middleware
│   │
│   └── ai-service/             # Python FastAPI AI analysis
│       ├── src/
│       │   ├── routers/        # review, security, performance, docs_gen
│       │   └── services/       # gemini_service.py, prompt_builder.py
│       ├── nixpacks.toml       # Railway build config
│       └── Procfile            # Railway start command
│
└── docker-compose.yml          # Local development setup
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker Desktop
- GitHub OAuth App ([create here](https://github.com/settings/developers))
- Google AI Studio API key ([get here](https://aistudio.google.com/apikey))

### 1. Clone the repository
```bash
git clone https://github.com/Manmohangit123/ai-code-review-platform.git
cd ai-code-review-platform
```

### 2. Start the database
```bash
docker-compose up -d postgres
```

### 3. Set up Auth Service
```bash
cd services/auth-service
npm install
cp .env.example .env   # Fill in GitHub OAuth credentials and JWT secret
npm run dev
```

### 4. Set up GitHub Service
```bash
cd services/github-service
npm install
cp .env.example .env   # Fill in JWT secret and DATABASE_URL
npm run dev
```

### 5. Set up AI Service
```bash
cd services/ai-service
pip install -r requirements.txt
cp .env.example .env   # Fill in GEMINI_API_KEY
uvicorn src.main:app --reload --port 8000
```

### 6. Start the Frontend
```bash
cd services/frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Environment Variables

### Auth Service
| Variable | Description |
|---|---|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret |
| `JWT_SECRET` | Secret for signing JWT tokens (128 chars) |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `DATABASE_URL` | PostgreSQL connection string |
| `FRONTEND_URL` | Frontend URL for OAuth redirect |

### GitHub Service
| Variable | Description |
|---|---|
| `JWT_SECRET` | Must match Auth Service JWT_SECRET |
| `DATABASE_URL` | PostgreSQL connection string |

### AI Service
| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio API key |
| `GEMINI_MODEL` | Model name (default: gemini-2.5-flash) |
| `FRONTEND_URL` | Frontend URL for CORS |

### Frontend (Vercel)
| Variable | Description |
|---|---|
| `VITE_AUTH_URL` | Auth service URL |
| `VITE_GITHUB_URL` | GitHub service URL |
| `VITE_AI_URL` | AI service URL |

---

## Key Engineering Decisions

- **Microservices over monolith** — Each service deploys and scales independently; a bug in the AI service doesn't take down authentication
- **JWT stateless auth** — No session storage needed; tokens verified by each service independently using a shared secret
- **Python for AI service** — FastAPI's async support and Python's AI ecosystem made it the right choice for the Gemini API integration
- **Gemini 2.5 Flash** — Best balance of speed, quality, and free-tier availability for code analysis tasks
- **Railway for backends** — Simple GitHub-connected deploys with built-in PostgreSQL, environment variables, and logs

---

## Live Demo

**URL:** [https://ai-code-review-pro-seven.vercel.app](https://ai-code-review-pro-seven.vercel.app)

Log in with any GitHub account to try it. The platform will show your real repositories and let you run AI analysis on any file.

---

## Author

**Manmohan** — [GitHub](https://github.com/Manmohangit123)

# InfraPro — E-Commerce Infrastructure Platform

A production-ready, full-stack e-commerce infrastructure platform demonstrating modern architecture patterns, DevOps practices, and scalable design.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   infra-pro.com │     │ app.infra-pro   │     │api.infra-pro.com│
│  (Landing Page) │     │   (Dashboard)   │     │    (Backend)    │
│   Static HTML   │     │   Next.js 16    │     │  Express + TS   │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │         Nginx           │
                    │  (SSL, Routing, CORS)   │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌────────▼────────┐    ┌─────────▼──────────┐  ┌─────────▼─────────┐
│    Frontend     │    │      Backend       │  │      Worker       │
│   (Next.js)     │    │     (Express)      │  │    (BullMQ)       │
└─────────────────┘    └─────────┬──────────┘  └───────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
           ┌────────▼──┐  ┌─────▼────┐  ┌────▼───┐
           │PostgreSQL │  │  Redis   │  │Grafana │
           │  (Data)   │  │(Queue)   │  │(Metrics)│
           └───────────┘  └──────────┘  └────────┘
```

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router, React 19)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Charts**: Recharts
- **Testing**: Vitest + Testing Library + MSW

### Backend
- **Runtime**: Node.js + Express 5
- **Language**: TypeScript
- **ORM**: Sequelize
- **Database**: PostgreSQL 15
- **Cache/Queue**: Redis 7 + BullMQ
- **Auth**: JWT (Access + Refresh tokens), bcrypt
- **Testing**: Jest + Supertest

### Infrastructure
- **Reverse Proxy**: Nginx 1.25 (SSL termination, CORS, rate limiting)
- **Monitoring**: Prometheus + Grafana
- **Containerization**: Docker + Docker Compose
- **SSL**: mkcert (local development)

## Project Structure

```
ecommerce-infra/
├── backend/              # Express API
│   ├── src/
│   │   ├── modules/      # Feature modules (auth, users, products)
│   │   ├── config/       # Database, Redis, env
│   │   ├── middlewares/  # Auth, CORS, rate limiting
│   │   └── utils/        # Error handling, logging
│   ├── tests/            # Unit & integration tests
│   └── Dockerfile
├── frontend/             # Next.js Dashboard
│   ├── app/              # App Router pages
│   ├── components/       # UI components
│   ├── lib/              # API client, contexts
│   ├── tests/            # Component & page tests
│   └── Dockerfile
├── nginx/                # Nginx configuration
│   ├── nginx.conf        # Main config
│   ├── conf.d/           # Additional configs
│   ├── certs/            # SSL certificates
│   └── landing/          # Static landing page
├── docker-compose.yml    # Full stack orchestration
└── README.md
```

## Quick Start

### Prerequisites
- Docker + Docker Compose
- Node.js 20+ (for local development)
- mkcert (for local SSL)

### 1. Clone and Setup SSL
```bash
git clone <repo>
cd ecommerce-infra

# Generate SSL certificates
./nginx/generate-ssl.sh

# Add hosts entries
sudo echo "127.0.0.1 infra-pro.com app.infra-pro.com api.infra-pro.com" >> /etc/hosts
```

### 2. Start All Services
```bash
docker compose up -d
```

### 3. Access the Application
| Service | URL | Description |
|---------|-----|-------------|
| Landing Page | https://infra-pro.com | Public marketing site |
| Dashboard | https://app.infra-pro.com | Admin dashboard (login required) |
| API | https://api.infra-pro.com | Backend API endpoints |
| Grafana | http://localhost:3001 | Monitoring dashboards |

### Default Admin Credentials
```
Email: admin@test.com
Password: Test1234!
```

## Development

### Backend Development
```bash
cd backend
cp .env.example .env
npm install
npm run dev          # tsx watch
npm run test         # Jest tests
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev          # Next.js dev server
npm run test         # Vitest tests
npm run test:watch   # Watch mode
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Login, get tokens |
| POST | `/api/v1/auth/logout` | Invalidate session |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/forgot-password` | Request reset link |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | List all users |

### Products (Public read, Admin write)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products` | List products |
| GET | `/api/v1/products/:id` | Get single product |
| POST | `/api/v1/products` | Create product (admin) |
| PUT | `/api/v1/products/:id` | Update product (admin) |
| DELETE | `/api/v1/products/:id` | Delete product (admin) |

## Testing Strategy

### Frontend Tests (Vitest)
- **Unit Tests**: UI components (Button, Input, Badge, etc.)
- **Integration Tests**: Pages (Login, Products, Dashboard)
- **API Mocking**: MSW for backend API simulation
- **Location**: `frontend/tests/`

Run: `npm test`

### Backend Tests (Jest)
- **Unit Tests**: Services, repositories, utilities
- **Integration Tests**: API endpoints with test database
- **Location**: `backend/tests/`

Run: `npm test`

## Key Features

### Security
- JWT-based authentication with refresh token rotation
- Password hashing with bcrypt
- Rate limiting on auth endpoints
- CORS properly configured
- SQL injection protection (Sequelize ORM)
- Helmet security headers

### Architecture Patterns
- **Layered Architecture**: Routes → Controller → Service → Repository → Model
- **Feature Modules**: Auth, Users, Products each self-contained
- **API Versioning**: `/api/v1/` prefix for backward compatibility
- **Subdomain Separation**: Clear separation of concerns

### DevOps
- Docker multi-stage builds (optimized images)
- Health checks for all services
- Centralized logging
- Prometheus metrics collection
- Nginx caching and compression

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ecommerce
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://api.infra-pro.com
```

## Monitoring

- **Prometheus**: Scrapes metrics at `/metrics` endpoint
- **Grafana**: Pre-configured dashboards at http://localhost:3001
- **Metrics**: HTTP requests, response times, error rates

## Troubleshooting

### Containers won't start
```bash
docker compose down -v
docker compose up -d --build
```

### Database connection issues
```bash
docker compose logs postgres
# Check env vars match docker-compose settings
```

### CORS errors
- Verify `api.infra-pro.com` CORS config in `nginx/nginx.conf`
- Check frontend `.env` has correct API URL

## License

MIT

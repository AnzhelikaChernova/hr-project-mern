# HR Recruitment Platform

A full-stack HR recruitment platform for managing job vacancies, applications, interviews, and feedback with real-time updates.

## Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **GraphQL** + **Apollo Server** - API layer
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **graphql-ws** - Real-time subscriptions
- **Jest** - Testing

### Frontend
- **Next.js 14** (App Router) - React framework
- **TailwindCSS** - Styling
- **Apollo Client** - GraphQL client
- **Zustand** - State management
- **React Hook Form** + **Zod** - Form handling & validation

### DevOps
- **Docker** + **Docker Compose** - Containerization

---

## Data Models

```
User (HR / CANDIDATE)
├── email, password, firstName, lastName
├── role, phone, avatar
├── skills[] (candidates)
├── company, position
└── isDeleted

Vacancy
├── title, description, requirements[]
├── salary { min, max, currency }
├── location, type, status
├── createdBy -> User (HR)
├── department
└── isDeleted

Application
├── vacancy -> Vacancy
├── candidate -> User
├── status, coverLetter, resume
├── appliedAt, notes
└── isDeleted

Interview
├── application -> Application
├── scheduledAt, duration, type
├── location, status
├── interviewers[] -> User
└── notes

Feedback
├── interview -> Interview
├── author -> User
├── rating, technicalSkills
├── communication, cultureFit
├── comments, recommendation
└── isDeleted
```

### Relationships
- **User** 1-to-many **Vacancy** (HR creates vacancies)
- **User** 1-to-many **Application** (Candidate applies)
- **Vacancy** 1-to-many **Application**
- **Application** 1-to-many **Interview**
- **Interview** 1-to-many **Feedback**

---

## Quick Start with Docker

### Prerequisites
- Docker & Docker Compose installed

### Run the Application

```bash
# Clone the repository
git clone <repository-url>
cd final

# Start all services
docker-compose up --build
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **GraphQL API**: http://localhost:4000/graphql
- **WebSocket**: ws://localhost:4000/graphql

### Seed Test Data

```bash
# Run seed script (requires local Node.js or run in container)
cd server
npm install
npm run seed
```

---

## Local Development

### Backend (Server)

```bash
cd server

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start MongoDB (or use Docker)
docker run -d -p 27017:27017 mongo:7

# Seed database
npm run seed

# Start development server
npm run dev
```

### Frontend (Client)

```bash
cd client

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

---

## Scripts

### Server
| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run seed` | Seed database with test data |
| `npm test` | Run Jest tests |
| `npm run lint` | Run ESLint |

### Client
| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| HR | hr@company.com | password123 |
| HR | recruiter@company.com | password123 |
| Candidate | candidate@email.com | password123 |
| Candidate | jane.doe@email.com | password123 |

---

## GraphQL API

### Queries (8)
- `me` - Current user profile
- `users(role, search)` - List users
- `vacancies(filters, page)` - List vacancies
- `vacancy(id)` - Single vacancy
- `applications(filters, page)` - List applications
- `application(id)` - Single application
- `myInterviews` - User's interviews
- `dashboardStats` - Dashboard statistics

### Mutations (12)
- `register(input)` - User registration
- `login(input)` - Authentication
- `updateUser(input)` - Update profile
- `createVacancy(input)` - Create job posting
- `updateVacancy(id, input)` - Update vacancy
- `deleteVacancy(id)` - Delete vacancy
- `applyToVacancy(input)` - Submit application
- `updateApplication(id, input)` - Update status
- `scheduleInterview(input)` - Schedule interview
- `updateInterview(id, input)` - Update interview
- `submitFeedback(input)` - Add feedback
- `cancelInterview(id)` - Cancel interview

### Subscriptions (3)
- `applicationCreated(vacancyId)` - New application notifications
- `applicationStatusUpdated(candidateId)` - Status change notifications
- `interviewScheduled(applicationId)` - Interview scheduled

---

## Real-time Features Testing

### Test Application Notifications (HR)

1. Open two browser windows
2. **Window 1**: Login as HR (`hr@company.com`)
3. **Window 2**: Login as Candidate (`candidate@email.com`)
4. HR: Go to Dashboard, keep it open
5. Candidate: Browse jobs, apply to a vacancy
6. HR: See real-time notification appear

### Test Status Updates (Candidate)

1. **Window 1**: Login as Candidate, go to Dashboard
2. **Window 2**: Login as HR
3. HR: Go to Applications, change status of an application
4. Candidate: See real-time notification of status change

---

## Project Structure

```
final/
├── client/                     # Next.js frontend
│   ├── app/                    # App Router pages
│   │   ├── (dashboard)/        # Protected routes
│   │   ├── login/
│   │   └── register/
│   ├── components/             # React components
│   │   ├── layout/
│   │   └── ui/
│   ├── graphql/                # GraphQL operations
│   ├── lib/                    # Apollo, stores
│   └── Dockerfile
│
├── server/                     # Express + GraphQL backend
│   ├── src/
│   │   ├── config/             # Database config
│   │   ├── graphql/            # Schema & resolvers
│   │   ├── middleware/         # Auth middleware
│   │   ├── models/             # Mongoose schemas
│   │   ├── utils/              # Helpers
│   │   ├── index.ts            # Entry point
│   │   └── seed.ts             # Seed script
│   ├── tests/                  # Jest tests
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## Tests

The project includes 15+ Jest tests:

### Unit Tests
- User model validation
- Password hashing
- JWT token generation/verification
- Input validation (Zod schemas)
- Vacancy model validation
- Application model validation

### Integration Tests
- Full recruitment flow
- Multiple candidates per vacancy

Run tests:
```bash
cd server
npm test
```

---

## Environment Variables

### Server (.env)
```
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/hr-platform
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
```

### Client (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:4000/graphql
```

---

## Team Contributions

| Member | Contributions |
|--------|--------------|
| Анжелика | Backend: Models, GraphQL resolvers, Auth, Tests |
| Виктория | Frontend: UI components, Pages, Real-time subscriptions |

---

## Architecture Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Server    │────▶│   MongoDB   │
│  (Next.js)  │◀────│  (Express)  │◀────│             │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │
      │                   │
      ▼                   ▼
┌─────────────┐     ┌─────────────┐
│   Apollo    │     │   Apollo    │
│   Client    │     │   Server    │
└─────────────┘     └─────────────┘
      │                   │
      └────────┬──────────┘
               │
      ┌────────▼────────┐
      │   WebSocket     │
      │  (graphql-ws)   │
      └─────────────────┘
```

---

## License

University Project - HR Recruitment Platform

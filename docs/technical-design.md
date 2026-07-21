# Technical Design - Capstone Bench Allocator

## 1. Purpose

Define the technical architecture and implementation design for an AI-powered bench allocation and resource recommendation system using a React UI and a Python AI/backend stack.

## 2. Chosen Architecture Pattern

We will use a **Modular Monolith** with **Clean (Hexagonal) Architecture**.

Why this pattern:
- Fast to build and demo for MVP
- Clear separation between business logic and external tools (LLM, DB, vector store)
- Easy to evolve into microservices later if scale requires it

Layers:
1. **Presentation Layer** - React UI and HTTP API endpoints
2. **Application Layer** - Use-case orchestration
3. **Domain Layer** - Core entities and ranking rules
4. **Infrastructure Layer** - Database, vector DB, LLM adapters, ingestion, logging

## 3. Chosen Technology Stack

### Frontend
- React + TypeScript + Vite
- UI: MUI
- Data fetching/state: React Query + Axios
- Charts: Recharts

### Backend and AI
- FastAPI (Python)
- RAG orchestration: LlamaIndex or LangChain
- LLM/embeddings: OpenAI or Azure OpenAI
- Relational DB: PostgreSQL
- Vector DB: Qdrant (or pgvector if single-DB setup is preferred)

### Platform
- Docker Compose for local/development deployment
- Optional reverse proxy: Nginx

## 4. High-Level Component Design

## Frontend (React)
- **Chat Module**: Ask staffing questions and view recommendations with reasoning
- **Recommendations Module**: Ranked candidates with filters and explanation columns
- **Dashboard Module**: Bench status, utilization trends, allocation summaries
- **API Client Module**: Typed hooks for backend endpoints

## Backend (FastAPI)
- **API Router**: REST endpoints for chat, recommendations, dashboard metrics
- **Use Cases**:
  - `AskStaffingQuestion`
  - `RecommendCandidates`
  - `GetBenchMetrics`
  - `GetUtilizationMetrics`
- **Domain Services**:
  - Ranking service
  - Skill normalization service
  - Explainability service
- **Repositories**:
  - Employee repository
  - Project repository
  - Allocation history repository
- **RAG Service**:
  - Retrieval + context builder + answer generation

## Data Stores
- PostgreSQL for transactional and analytical base data
- Vector store for embeddings and semantic retrieval

## 5. Domain Model (Core Entities)

- **Employee**: id, name, role, skills, experience, availability, utilization
- **ProjectNeed**: id, project_name, required_skills, priority, start_date
- **AllocationHistory**: employee_id, project_id, role, start_date, end_date, outcome
- **Recommendation**: request_id, employee_id, score, reasons, rank

## 6. RAG Pipeline Design

1. Ingest employee, project, and allocation datasets
2. Clean and normalize skills/tags
3. Chunk and embed relevant records/documents
4. Store vectors in vector DB
5. Retrieve top-k evidence for user query
6. Re-rank candidates using domain scoring logic
7. Generate response grounded in retrieved evidence
8. Return ranked list + explanation + source snippets

Guardrails:
- Responses must be evidence-grounded
- Include "why suggested" factors
- No final automated allocation; human approval remains required

## 7. Recommendation/Ranking Design

Scoring factors (weighted):
- Skill match score
- Recent relevant project experience
- Current utilization and bench availability
- Historical allocation fit (role/domain similarity)
- Optional business priority boost

Implementation pattern:
- **Strategy Pattern** for ranking strategies:
  - Skill-first
  - Utilization-first
  - Hybrid (default)

## 8. API Design (MVP Endpoints)

- `POST /api/chat/query`
  - Input: staffing question/context
  - Output: answer, ranked recommendations, evidence

- `POST /api/recommendations`
  - Input: project need + constraints
  - Output: ranked candidates + scores + reasons

- `GET /api/dashboard/bench`
  - Output: current bench metrics and breakdowns

- `GET /api/dashboard/utilization`
  - Output: utilization trends and summaries

- `GET /api/dashboard/allocations`
  - Output: allocation summary metrics

## 9. Security and Access (MVP)

- JWT-based authentication
- Role checks for manager-level features
- Input validation on all API endpoints
- Audit logging for recommendation requests

## 10. Non-Functional Design

- Reliability: deterministic ranking logic with fallback messages on low-confidence retrieval
- Explainability: always return scoring reasons and evidence snippets
- Performance targets (MVP):
  - Chat/recommendation response: <= 5 seconds for common queries
  - Dashboard loads: <= 2 seconds for cached/aggregated metrics

## 11. Deployment Design

Docker Compose services:
- `frontend` (React app)
- `backend` (FastAPI app)
- `postgres`
- `qdrant`

Environment configuration:
- LLM keys and DB credentials via environment variables
- Separate `.env` values per local/dev/prod profile

## 12. Observability

- Structured application logs
- Request/response timing metrics
- Error tracking with clear API error responses
- Basic health checks:
  - `/health` for backend
  - DB and vector DB connectivity checks

## 13. Delivery Phases

1. Data ingestion + validation
2. Core backend domain + repositories
3. RAG and ranking implementation
4. React chat + recommendations UI
5. React dashboard analytics UI
6. End-to-end integration, testing, and demo script

## 14. Future Evolution (Post-MVP)

- Integrate HRMS/ERP sources
- Add forecasting/capacity planning models
- Introduce stronger RBAC and governance
- Split modules into services if scale/performance requires


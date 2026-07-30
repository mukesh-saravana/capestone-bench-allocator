from collections import defaultdict
from datetime import UTC, date, datetime
from uuid import uuid4

from sqlalchemy import JSON, Column, Date, DateTime, ForeignKey, Integer, String, Text, func, select
from sqlalchemy.orm import DeclarativeBase, Session

from .db import SessionLocal, engine
from .models import AllocationHistory, Employee, EmployeeSkill, ProjectNeed, Skill, SkillTag, User


class Base(DeclarativeBase):
    pass


class UserRow(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    role = Column(String(64), nullable=False)
    password_hash = Column(String(255), nullable=False, default="")


class AuthTokenRow(Base):
    __tablename__ = "auth_tokens"

    token = Column(String(255), primary_key=True)
    user_email = Column(String(255), ForeignKey("users.email", ondelete="CASCADE"), index=True)


class EmployeeRow(Base):
    __tablename__ = "employees"

    id = Column(String(64), primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    role = Column(String(255), nullable=False)
    department = Column(String(128), nullable=False)
    experience_years = Column(Integer, nullable=False, default=0)
    availability = Column(String(32), nullable=False)
    utilization_pct = Column(Integer, nullable=False, default=0)
    bench_since = Column(Date, nullable=True)
    interview_score = Column(Integer, nullable=True)
    interview_result = Column(String(64), nullable=True)
    avatar = Column(String(255), nullable=True)
    skills_json = Column(JSON, nullable=False, default=list)


class ProjectNeedRow(Base):
    __tablename__ = "project_needs"

    id = Column(String(64), primary_key=True)
    project_id = Column(String(64), nullable=False, index=True)
    project_name = Column(String(255), nullable=False)
    role_title = Column(String(255), nullable=False)
    open_slots = Column(Integer, nullable=False, default=1)
    required_skills_json = Column(JSON, nullable=False, default=list)
    start_date = Column(Date, nullable=True)
    status = Column(String(32), nullable=False)
    priority = Column(String(32), nullable=False)


class AllocationHistoryRow(Base):
    __tablename__ = "allocation_history"

    id = Column(String(64), primary_key=True)
    employee_id = Column(String(64), ForeignKey("employees.id"), index=True)
    employee_name = Column(String(255), nullable=False)
    project_id = Column(String(64), nullable=False, index=True)
    project_name = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    outcome = Column(String(32), nullable=False)
    notes = Column(Text, nullable=True)


class ImportEventRow(Base):
    __tablename__ = "import_events"

    id = Column(String(64), primary_key=True)
    dataset_key = Column(String(64), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    imported_rows = Column(Integer, nullable=False, default=0)
    updated_rows = Column(Integer, nullable=False, default=0)
    skipped_rows = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(UTC))


class SkillTagRow(Base):
    __tablename__ = "skill_tags"

    id = Column(String(64), primary_key=True)
    name = Column(String(128), unique=True, nullable=False)
    category = Column(String(128), nullable=False)
    usage = Column(Integer, nullable=False, default=0)


SEED_USERS = [
    {"id": "usr-001", "email": "manager@company.com", "name": "Demo Manager", "role": "resource_manager"},
]

SEED_EMPLOYEES = [
    {
        "id": "emp-001",
        "name": "John Doe",
        "email": "john.doe@company.com",
        "role": "Senior Engineer",
        "department": "Frontend",
        "experience_years": 6,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-01"),
        "skills_json": [
            {"id": "s1", "name": "React", "category": "Frontend", "proficiency": 5},
            {"id": "s2", "name": "TypeScript", "category": "Frontend", "proficiency": 5},
            {"id": "s3", "name": "AWS", "category": "Cloud", "proficiency": 4},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 3},
        ],
    },
    {
        "id": "emp-002",
        "name": "Jane Smith",
        "email": "jane.smith@company.com",
        "role": "Engineer",
        "department": "Backend",
        "experience_years": 4,
        "availability": "available",
        "utilization_pct": 20,
        "bench_since": date.fromisoformat("2026-07-10"),
        "skills_json": [
            {"id": "s5", "name": "React", "category": "Frontend", "proficiency": 4},
            {"id": "s6", "name": "Node.js", "category": "Backend", "proficiency": 5},
            {"id": "s3", "name": "AWS", "category": "Cloud", "proficiency": 4},
        ],
    },
    {
        "id": "emp-003",
        "name": "Bob Johnson",
        "email": "bob.j@company.com",
        "role": "Senior Engineer",
        "department": "Platform",
        "experience_years": 5,
        "availability": "available",
        "utilization_pct": 10,
        "bench_since": date.fromisoformat("2026-07-05"),
        "skills_json": [
            {"id": "s1", "name": "React", "category": "Frontend", "proficiency": 4},
            {"id": "s7", "name": "Docker", "category": "DevOps", "proficiency": 5},
            {"id": "s8", "name": "Kubernetes", "category": "DevOps", "proficiency": 4},
        ],
    },
    {
        "id": "emp-004",
        "name": "Alice Chen",
        "email": "alice.chen@company.com",
        "role": "Tech Lead",
        "department": "Frontend",
        "experience_years": 8,
        "availability": "allocated",
        "utilization_pct": 100,
        "bench_since": None,
        "skills_json": [
            {"id": "s1", "name": "React", "category": "Frontend", "proficiency": 5},
            {"id": "s2", "name": "TypeScript", "category": "Frontend", "proficiency": 5},
            {"id": "s9", "name": "Angular", "category": "Frontend", "proficiency": 4},
        ],
    },
    {
        "id": "emp-005",
        "name": "Carlos Rivera",
        "email": "carlos.r@company.com",
        "role": "Engineer",
        "department": "Data",
        "experience_years": 3,
        "availability": "allocated",
        "utilization_pct": 80,
        "bench_since": None,
        "skills_json": [
            {"id": "s10", "name": "Python", "category": "Backend", "proficiency": 5},
            {"id": "s11", "name": "PostgreSQL", "category": "Data", "proficiency": 4},
            {"id": "s12", "name": "Spark", "category": "Data", "proficiency": 3},
        ],
    },
    {
        "id": "emp-006",
        "name": "Priya Nair",
        "email": "priya.n@company.com",
        "role": "QA Engineer",
        "department": "Platform",
        "experience_years": 4,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-15"),
        "skills_json": [
            {"id": "s13", "name": "Selenium", "category": "QA", "proficiency": 5},
            {"id": "s14", "name": "Cypress", "category": "QA", "proficiency": 4},
        ],
    },
    {
        "id": "emp-007",
        "name": "Sam Wilson",
        "email": "sam.w@company.com",
        "role": "Engineer",
        "department": "Backend",
        "experience_years": 5,
        "availability": "allocated",
        "utilization_pct": 100,
        "bench_since": None,
        "skills_json": [
            {"id": "s15", "name": "Java", "category": "Backend", "proficiency": 5},
            {"id": "s16", "name": "Spring Boot", "category": "Backend", "proficiency": 5},
        ],
    },
    {
        "id": "emp-008",
        "name": "Nina Patel",
        "email": "nina.p@company.com",
        "role": "Engineer",
        "department": "Frontend",
        "experience_years": 3,
        "availability": "on_leave",
        "utilization_pct": 0,
        "bench_since": None,
        "skills_json": [
            {"id": "s1", "name": "React", "category": "Frontend", "proficiency": 3},
            {"id": "s2", "name": "TypeScript", "category": "Frontend", "proficiency": 3},
        ],
    },
    # ── Frontend ─────────────────────────────────────────────────────────────
    {
        "id": "emp-009",
        "name": "Arjun Sharma",
        "email": "arjun.sharma@company.com",
        "role": "Senior Frontend Engineer",
        "department": "Frontend",
        "experience_years": 7,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-10"),
        "skills_json": [
            {"id": "s1", "name": "React", "category": "Frontend", "proficiency": 5},
            {"id": "s2", "name": "TypeScript", "category": "Frontend", "proficiency": 5},
            {"id": "s26", "name": "Next.js", "category": "Frontend", "proficiency": 4},
            {"id": "s28", "name": "GraphQL", "category": "Backend", "proficiency": 3},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 3},
            {"id": "s11", "name": "PostgreSQL", "category": "Data", "proficiency": 3},
        ],
    },
    {
        "id": "emp-010",
        "name": "Divya Krishnan",
        "email": "divya.k@company.com",
        "role": "Frontend Engineer",
        "department": "Frontend",
        "experience_years": 4,
        "availability": "available",
        "utilization_pct": 10,
        "bench_since": date.fromisoformat("2026-07-18"),
        "skills_json": [
            {"id": "s25", "name": "Vue.js", "category": "Frontend", "proficiency": 5},
            {"id": "s2", "name": "TypeScript", "category": "Frontend", "proficiency": 4},
            {"id": "s59", "name": "Tailwind CSS", "category": "Frontend", "proficiency": 4},
            {"id": "s6", "name": "Node.js", "category": "Backend", "proficiency": 3},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 2},
        ],
    },
    {
        "id": "emp-011",
        "name": "Ethan Clarke",
        "email": "ethan.c@company.com",
        "role": "Frontend Engineer",
        "department": "Frontend",
        "experience_years": 3,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-20"),
        "skills_json": [
            {"id": "s9", "name": "Angular", "category": "Frontend", "proficiency": 4},
            {"id": "s2", "name": "TypeScript", "category": "Frontend", "proficiency": 4},
            {"id": "s15", "name": "Java", "category": "Backend", "proficiency": 3},
            {"id": "s6", "name": "Node.js", "category": "Backend", "proficiency": 3},
        ],
    },
    {
        "id": "emp-012",
        "name": "Fatima Al-Rashid",
        "email": "fatima.ar@company.com",
        "role": "Senior Frontend Engineer",
        "department": "Frontend",
        "experience_years": 6,
        "availability": "allocated",
        "utilization_pct": 90,
        "bench_since": None,
        "skills_json": [
            {"id": "s1", "name": "React", "category": "Frontend", "proficiency": 5},
            {"id": "s26", "name": "Next.js", "category": "Frontend", "proficiency": 5},
            {"id": "s2", "name": "TypeScript", "category": "Frontend", "proficiency": 5},
            {"id": "s28", "name": "GraphQL", "category": "Backend", "proficiency": 4},
            {"id": "s6", "name": "Node.js", "category": "Backend", "proficiency": 3},
        ],
    },
    {
        "id": "emp-013",
        "name": "Hiroshi Tanaka",
        "email": "hiroshi.t@company.com",
        "role": "Frontend Engineer",
        "department": "Frontend",
        "experience_years": 5,
        "availability": "allocated",
        "utilization_pct": 100,
        "bench_since": None,
        "skills_json": [
            {"id": "s27", "name": "Svelte", "category": "Frontend", "proficiency": 5},
            {"id": "s2", "name": "TypeScript", "category": "Frontend", "proficiency": 5},
            {"id": "s17", "name": "Go", "category": "Backend", "proficiency": 3},
            {"id": "s11", "name": "PostgreSQL", "category": "Data", "proficiency": 3},
        ],
    },
    {
        "id": "emp-014",
        "name": "Meera Iyer",
        "email": "meera.i@company.com",
        "role": "Senior Frontend Engineer",
        "department": "Frontend",
        "experience_years": 5,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-12"),
        "skills_json": [
            {"id": "s1", "name": "React", "category": "Frontend", "proficiency": 4},
            {"id": "s2", "name": "TypeScript", "category": "Frontend", "proficiency": 4},
            {"id": "s59", "name": "Tailwind CSS", "category": "Frontend", "proficiency": 4},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 3},
            {"id": "s37", "name": "Django", "category": "Backend", "proficiency": 3},
        ],
    },
    {
        "id": "emp-015",
        "name": "Leon Hoffmann",
        "email": "leon.h@company.com",
        "role": "Tech Lead",
        "department": "Frontend",
        "experience_years": 9,
        "availability": "available",
        "utilization_pct": 20,
        "bench_since": date.fromisoformat("2026-07-05"),
        "skills_json": [
            {"id": "s9", "name": "Angular", "category": "Frontend", "proficiency": 5},
            {"id": "s1", "name": "React", "category": "Frontend", "proficiency": 4},
            {"id": "s2", "name": "TypeScript", "category": "Frontend", "proficiency": 5},
            {"id": "s15", "name": "Java", "category": "Backend", "proficiency": 4},
            {"id": "s20", "name": "C#", "category": "Backend", "proficiency": 3},
            {"id": "s3", "name": "AWS", "category": "Cloud", "proficiency": 3},
        ],
    },
    # ── Backend ───────────────────────────────────────────────────────────────
    {
        "id": "emp-016",
        "name": "Ivan Petrov",
        "email": "ivan.p@company.com",
        "role": "Senior Backend Engineer",
        "department": "Backend",
        "experience_years": 8,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-08"),
        "skills_json": [
            {"id": "s17", "name": "Go", "category": "Backend", "proficiency": 5},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 4},
            {"id": "s60", "name": "gRPC", "category": "Backend", "proficiency": 4},
            {"id": "s11", "name": "PostgreSQL", "category": "Data", "proficiency": 4},
            {"id": "s32", "name": "Kafka", "category": "Data", "proficiency": 3},
            {"id": "s7", "name": "Docker", "category": "DevOps", "proficiency": 4},
        ],
    },
    {
        "id": "emp-017",
        "name": "Julia Martinez",
        "email": "julia.m@company.com",
        "role": "Backend Engineer",
        "department": "Backend",
        "experience_years": 4,
        "availability": "available",
        "utilization_pct": 10,
        "bench_since": date.fromisoformat("2026-07-22"),
        "skills_json": [
            {"id": "s15", "name": "Java", "category": "Backend", "proficiency": 4},
            {"id": "s16", "name": "Spring Boot", "category": "Backend", "proficiency": 4},
            {"id": "s31", "name": "MySQL", "category": "Data", "proficiency": 3},
            {"id": "s7", "name": "Docker", "category": "DevOps", "proficiency": 3},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 2},
        ],
    },
    {
        "id": "emp-018",
        "name": "Kwame Asante",
        "email": "kwame.a@company.com",
        "role": "Senior Backend Engineer",
        "department": "Backend",
        "experience_years": 7,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-01"),
        "skills_json": [
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 5},
            {"id": "s38", "name": "FastAPI", "category": "Backend", "proficiency": 5},
            {"id": "s11", "name": "PostgreSQL", "category": "Data", "proficiency": 4},
            {"id": "s30", "name": "Redis", "category": "Data", "proficiency": 4},
            {"id": "s32", "name": "Kafka", "category": "Data", "proficiency": 3},
            {"id": "s3", "name": "AWS", "category": "Cloud", "proficiency": 3},
        ],
    },
    {
        "id": "emp-019",
        "name": "Lena Fischer",
        "email": "lena.f@company.com",
        "role": "Backend Engineer",
        "department": "Backend",
        "experience_years": 3,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-25"),
        "skills_json": [
            {"id": "s18", "name": "PHP", "category": "Backend", "proficiency": 4},
            {"id": "s40", "name": "Laravel", "category": "Backend", "proficiency": 4},
            {"id": "s31", "name": "MySQL", "category": "Data", "proficiency": 3},
            {"id": "s25", "name": "Vue.js", "category": "Frontend", "proficiency": 3},
            {"id": "s7", "name": "Docker", "category": "DevOps", "proficiency": 2},
        ],
    },
    {
        "id": "emp-020",
        "name": "Marco Rossi",
        "email": "marco.r@company.com",
        "role": "Tech Lead",
        "department": "Backend",
        "experience_years": 9,
        "availability": "allocated",
        "utilization_pct": 100,
        "bench_since": None,
        "skills_json": [
            {"id": "s15", "name": "Java", "category": "Backend", "proficiency": 5},
            {"id": "s23", "name": "Kotlin", "category": "Mobile", "proficiency": 4},
            {"id": "s16", "name": "Spring Boot", "category": "Backend", "proficiency": 5},
            {"id": "s11", "name": "PostgreSQL", "category": "Data", "proficiency": 4},
            {"id": "s3", "name": "AWS", "category": "Cloud", "proficiency": 3},
            {"id": "s8", "name": "Kubernetes", "category": "DevOps", "proficiency": 3},
        ],
    },
    {
        "id": "emp-021",
        "name": "Nadia Kovacs",
        "email": "nadia.k@company.com",
        "role": "Backend Engineer",
        "department": "Backend",
        "experience_years": 5,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-14"),
        "skills_json": [
            {"id": "s19", "name": "Ruby", "category": "Backend", "proficiency": 4},
            {"id": "s41", "name": "Rails", "category": "Backend", "proficiency": 4},
            {"id": "s11", "name": "PostgreSQL", "category": "Data", "proficiency": 4},
            {"id": "s30", "name": "Redis", "category": "Data", "proficiency": 3},
            {"id": "s6", "name": "Node.js", "category": "Backend", "proficiency": 2},
        ],
    },
    {
        "id": "emp-022",
        "name": "Omar Hassan",
        "email": "omar.h@company.com",
        "role": "Senior Backend Engineer",
        "department": "Backend",
        "experience_years": 6,
        "availability": "allocated",
        "utilization_pct": 80,
        "bench_since": None,
        "skills_json": [
            {"id": "s20", "name": "C#", "category": "Backend", "proficiency": 5},
            {"id": "s42", "name": ".NET", "category": "Backend", "proficiency": 5},
            {"id": "s43", "name": "Azure", "category": "Cloud", "proficiency": 4},
            {"id": "s65", "name": "SQL Server", "category": "Data", "proficiency": 3},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 2},
        ],
    },
    {
        "id": "emp-023",
        "name": "Pita Havili",
        "email": "pita.h@company.com",
        "role": "Backend Engineer",
        "department": "Backend",
        "experience_years": 4,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-19"),
        "skills_json": [
            {"id": "s6", "name": "Node.js", "category": "Backend", "proficiency": 5},
            {"id": "s2", "name": "TypeScript", "category": "Frontend", "proficiency": 4},
            {"id": "s29", "name": "MongoDB", "category": "Data", "proficiency": 4},
            {"id": "s39", "name": "Express.js", "category": "Backend", "proficiency": 4},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 3},
            {"id": "s30", "name": "Redis", "category": "Data", "proficiency": 2},
        ],
    },
    {
        "id": "emp-024",
        "name": "Qin Zhang",
        "email": "qin.z@company.com",
        "role": "Senior Backend Engineer",
        "department": "Backend",
        "experience_years": 8,
        "availability": "available",
        "utilization_pct": 20,
        "bench_since": date.fromisoformat("2026-07-03"),
        "skills_json": [
            {"id": "s36", "name": "Scala", "category": "Backend", "proficiency": 5},
            {"id": "s15", "name": "Java", "category": "Backend", "proficiency": 4},
            {"id": "s12", "name": "Spark", "category": "Data", "proficiency": 4},
            {"id": "s32", "name": "Kafka", "category": "Data", "proficiency": 4},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 3},
            {"id": "s7", "name": "Docker", "category": "DevOps", "proficiency": 3},
        ],
    },
    {
        "id": "emp-025",
        "name": "Riya Desai",
        "email": "riya.d@company.com",
        "role": "Backend Engineer",
        "department": "Backend",
        "experience_years": 3,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-22"),
        "skills_json": [
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 4},
            {"id": "s37", "name": "Django", "category": "Backend", "proficiency": 4},
            {"id": "s11", "name": "PostgreSQL", "category": "Data", "proficiency": 3},
            {"id": "s30", "name": "Redis", "category": "Data", "proficiency": 2},
            {"id": "s6", "name": "Node.js", "category": "Backend", "proficiency": 2},
        ],
    },
    {
        "id": "emp-026",
        "name": "Stefan Mueller",
        "email": "stefan.m@company.com",
        "role": "Backend Engineer",
        "department": "Backend",
        "experience_years": 5,
        "availability": "allocated",
        "utilization_pct": 90,
        "bench_since": None,
        "skills_json": [
            {"id": "s18", "name": "PHP", "category": "Backend", "proficiency": 4},
            {"id": "s40", "name": "Laravel", "category": "Backend", "proficiency": 4},
            {"id": "s25", "name": "Vue.js", "category": "Frontend", "proficiency": 3},
            {"id": "s31", "name": "MySQL", "category": "Data", "proficiency": 3},
            {"id": "s3", "name": "AWS", "category": "Cloud", "proficiency": 2},
        ],
    },
    {
        "id": "emp-027",
        "name": "Tanya Williams",
        "email": "tanya.w@company.com",
        "role": "Senior Backend Engineer",
        "department": "Backend",
        "experience_years": 7,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-10"),
        "skills_json": [
            {"id": "s17", "name": "Go", "category": "Backend", "proficiency": 5},
            {"id": "s21", "name": "Rust", "category": "Backend", "proficiency": 4},
            {"id": "s60", "name": "gRPC", "category": "Backend", "proficiency": 4},
            {"id": "s7", "name": "Docker", "category": "DevOps", "proficiency": 4},
            {"id": "s11", "name": "PostgreSQL", "category": "Data", "proficiency": 4},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 3},
        ],
    },
    {
        "id": "emp-028",
        "name": "Umar Khan",
        "email": "umar.k@company.com",
        "role": "Backend Engineer",
        "department": "Backend",
        "experience_years": 4,
        "availability": "available",
        "utilization_pct": 10,
        "bench_since": date.fromisoformat("2026-07-20"),
        "skills_json": [
            {"id": "s15", "name": "Java", "category": "Backend", "proficiency": 4},
            {"id": "s16", "name": "Spring Boot", "category": "Backend", "proficiency": 4},
            {"id": "s11", "name": "PostgreSQL", "category": "Data", "proficiency": 3},
            {"id": "s8", "name": "Kubernetes", "category": "DevOps", "proficiency": 2},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 2},
        ],
    },
    {
        "id": "emp-029",
        "name": "Valentina Cruz",
        "email": "valentina.c@company.com",
        "role": "Backend Engineer",
        "department": "Backend",
        "experience_years": 3,
        "availability": "on_leave",
        "utilization_pct": 0,
        "bench_since": None,
        "skills_json": [
            {"id": "s6", "name": "Node.js", "category": "Backend", "proficiency": 3},
            {"id": "s2", "name": "TypeScript", "category": "Frontend", "proficiency": 3},
            {"id": "s29", "name": "MongoDB", "category": "Data", "proficiency": 3},
            {"id": "s30", "name": "Redis", "category": "Data", "proficiency": 2},
        ],
    },
    {
        "id": "emp-030",
        "name": "William Park",
        "email": "william.p@company.com",
        "role": "Senior Backend Engineer",
        "department": "Backend",
        "experience_years": 6,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-08"),
        "skills_json": [
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 5},
            {"id": "s38", "name": "FastAPI", "category": "Backend", "proficiency": 5},
            {"id": "s11", "name": "PostgreSQL", "category": "Data", "proficiency": 4},
            {"id": "s7", "name": "Docker", "category": "DevOps", "proficiency": 3},
            {"id": "s3", "name": "AWS", "category": "Cloud", "proficiency": 3},
            {"id": "s84", "name": "RabbitMQ", "category": "Backend", "proficiency": 3},
        ],
    },
    # ── Platform / DevOps ─────────────────────────────────────────────────────
    {
        "id": "emp-031",
        "name": "Anika Becker",
        "email": "anika.b@company.com",
        "role": "DevOps Engineer",
        "department": "Platform",
        "experience_years": 5,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-12"),
        "skills_json": [
            {"id": "s7", "name": "Docker", "category": "DevOps", "proficiency": 5},
            {"id": "s8", "name": "Kubernetes", "category": "DevOps", "proficiency": 5},
            {"id": "s45", "name": "Terraform", "category": "DevOps", "proficiency": 4},
            {"id": "s3", "name": "AWS", "category": "Cloud", "proficiency": 4},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 3},
            {"id": "s17", "name": "Go", "category": "Backend", "proficiency": 2},
        ],
    },
    {
        "id": "emp-032",
        "name": "Ben Okafor",
        "email": "ben.o@company.com",
        "role": "Senior DevOps Engineer",
        "department": "Platform",
        "experience_years": 7,
        "availability": "available",
        "utilization_pct": 10,
        "bench_since": date.fromisoformat("2026-07-05"),
        "skills_json": [
            {"id": "s7", "name": "Docker", "category": "DevOps", "proficiency": 5},
            {"id": "s8", "name": "Kubernetes", "category": "DevOps", "proficiency": 5},
            {"id": "s45", "name": "Terraform", "category": "DevOps", "proficiency": 5},
            {"id": "s3", "name": "AWS", "category": "Cloud", "proficiency": 5},
            {"id": "s43", "name": "Azure", "category": "Cloud", "proficiency": 3},
            {"id": "s17", "name": "Go", "category": "Backend", "proficiency": 3},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 4},
        ],
    },
    {
        "id": "emp-033",
        "name": "Clara Johansson",
        "email": "clara.j@company.com",
        "role": "Cloud Engineer",
        "department": "Platform",
        "experience_years": 6,
        "availability": "allocated",
        "utilization_pct": 100,
        "bench_since": None,
        "skills_json": [
            {"id": "s3", "name": "AWS", "category": "Cloud", "proficiency": 5},
            {"id": "s43", "name": "Azure", "category": "Cloud", "proficiency": 4},
            {"id": "s44", "name": "GCP", "category": "Cloud", "proficiency": 4},
            {"id": "s45", "name": "Terraform", "category": "DevOps", "proficiency": 5},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 3},
            {"id": "s17", "name": "Go", "category": "Backend", "proficiency": 3},
        ],
    },
    {
        "id": "emp-034",
        "name": "Diego Morales",
        "email": "diego.mo@company.com",
        "role": "DevOps Engineer",
        "department": "Platform",
        "experience_years": 4,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-17"),
        "skills_json": [
            {"id": "s7", "name": "Docker", "category": "DevOps", "proficiency": 4},
            {"id": "s8", "name": "Kubernetes", "category": "DevOps", "proficiency": 4},
            {"id": "s46", "name": "Ansible", "category": "DevOps", "proficiency": 3},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 3},
            {"id": "s3", "name": "AWS", "category": "Cloud", "proficiency": 3},
        ],
    },
    {
        "id": "emp-035",
        "name": "Ella Thompson",
        "email": "ella.t@company.com",
        "role": "Platform Engineer",
        "department": "Platform",
        "experience_years": 5,
        "availability": "available",
        "utilization_pct": 20,
        "bench_since": date.fromisoformat("2026-07-09"),
        "skills_json": [
            {"id": "s17", "name": "Go", "category": "Backend", "proficiency": 4},
            {"id": "s8", "name": "Kubernetes", "category": "DevOps", "proficiency": 4},
            {"id": "s7", "name": "Docker", "category": "DevOps", "proficiency": 4},
            {"id": "s11", "name": "PostgreSQL", "category": "Data", "proficiency": 3},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 3},
        ],
    },
    {
        "id": "emp-036",
        "name": "Felix Wagner",
        "email": "felix.w@company.com",
        "role": "Senior Platform Engineer",
        "department": "Platform",
        "experience_years": 8,
        "availability": "allocated",
        "utilization_pct": 80,
        "bench_since": None,
        "skills_json": [
            {"id": "s8", "name": "Kubernetes", "category": "DevOps", "proficiency": 5},
            {"id": "s7", "name": "Docker", "category": "DevOps", "proficiency": 5},
            {"id": "s45", "name": "Terraform", "category": "DevOps", "proficiency": 4},
            {"id": "s3", "name": "AWS", "category": "Cloud", "proficiency": 4},
            {"id": "s17", "name": "Go", "category": "Backend", "proficiency": 4},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 3},
        ],
    },
    {
        "id": "emp-037",
        "name": "Grace Lee",
        "email": "grace.l@company.com",
        "role": "DevOps Engineer",
        "department": "Platform",
        "experience_years": 3,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-21"),
        "skills_json": [
            {"id": "s7", "name": "Docker", "category": "DevOps", "proficiency": 3},
            {"id": "s8", "name": "Kubernetes", "category": "DevOps", "proficiency": 3},
            {"id": "s45", "name": "Terraform", "category": "DevOps", "proficiency": 2},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 3},
        ],
    },
    # ── Data / Analytics / ML ─────────────────────────────────────────────────
    {
        "id": "emp-038",
        "name": "Hana Sato",
        "email": "hana.s@company.com",
        "role": "Data Scientist",
        "department": "Data",
        "experience_years": 5,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-11"),
        "skills_json": [
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 5},
            {"id": "s35", "name": "R", "category": "Data", "proficiency": 4},
            {"id": "s62", "name": "scikit-learn", "category": "ML", "proficiency": 4},
            {"id": "s63", "name": "Pandas", "category": "Data", "proficiency": 5},
            {"id": "s11", "name": "PostgreSQL", "category": "Data", "proficiency": 3},
            {"id": "s33", "name": "TensorFlow", "category": "ML", "proficiency": 3},
        ],
    },
    {
        "id": "emp-039",
        "name": "Ibrahim Yilmaz",
        "email": "ibrahim.y@company.com",
        "role": "ML Engineer",
        "department": "Data",
        "experience_years": 6,
        "availability": "available",
        "utilization_pct": 10,
        "bench_since": date.fromisoformat("2026-07-07"),
        "skills_json": [
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 5},
            {"id": "s34", "name": "PyTorch", "category": "ML", "proficiency": 5},
            {"id": "s36", "name": "Scala", "category": "Backend", "proficiency": 3},
            {"id": "s32", "name": "Kafka", "category": "Data", "proficiency": 3},
            {"id": "s55", "name": "MLflow", "category": "ML", "proficiency": 4},
            {"id": "s3", "name": "AWS", "category": "Cloud", "proficiency": 3},
        ],
    },
    {
        "id": "emp-040",
        "name": "Jasmine Brown",
        "email": "jasmine.b@company.com",
        "role": "Data Engineer",
        "department": "Data",
        "experience_years": 4,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-16"),
        "skills_json": [
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 4},
            {"id": "s36", "name": "Scala", "category": "Backend", "proficiency": 3},
            {"id": "s12", "name": "Spark", "category": "Data", "proficiency": 4},
            {"id": "s52", "name": "Airflow", "category": "Data", "proficiency": 4},
            {"id": "s32", "name": "Kafka", "category": "Data", "proficiency": 3},
            {"id": "s11", "name": "PostgreSQL", "category": "Data", "proficiency": 3},
        ],
    },
    {
        "id": "emp-041",
        "name": "Kenji Watanabe",
        "email": "kenji.w@company.com",
        "role": "Senior Data Engineer",
        "department": "Data",
        "experience_years": 7,
        "availability": "allocated",
        "utilization_pct": 90,
        "bench_since": None,
        "skills_json": [
            {"id": "s36", "name": "Scala", "category": "Backend", "proficiency": 5},
            {"id": "s15", "name": "Java", "category": "Backend", "proficiency": 4},
            {"id": "s12", "name": "Spark", "category": "Data", "proficiency": 5},
            {"id": "s61", "name": "Hadoop", "category": "Data", "proficiency": 4},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 4},
            {"id": "s32", "name": "Kafka", "category": "Data", "proficiency": 4},
        ],
    },
    {
        "id": "emp-042",
        "name": "Lily Chen",
        "email": "lily.c@company.com",
        "role": "ML Engineer",
        "department": "Data",
        "experience_years": 5,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-13"),
        "skills_json": [
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 5},
            {"id": "s33", "name": "TensorFlow", "category": "ML", "proficiency": 5},
            {"id": "s34", "name": "PyTorch", "category": "ML", "proficiency": 4},
            {"id": "s73", "name": "Hugging Face", "category": "ML", "proficiency": 4},
            {"id": "s55", "name": "MLflow", "category": "ML", "proficiency": 3},
            {"id": "s35", "name": "R", "category": "Data", "proficiency": 3},
        ],
    },
    {
        "id": "emp-043",
        "name": "Marcus Davis",
        "email": "marcus.d@company.com",
        "role": "Data Analyst",
        "department": "Data",
        "experience_years": 3,
        "availability": "available",
        "utilization_pct": 20,
        "bench_since": date.fromisoformat("2026-07-18"),
        "skills_json": [
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 3},
            {"id": "s35", "name": "R", "category": "Data", "proficiency": 4},
            {"id": "s11", "name": "PostgreSQL", "category": "Data", "proficiency": 4},
            {"id": "s63", "name": "Pandas", "category": "Data", "proficiency": 4},
        ],
    },
    {
        "id": "emp-044",
        "name": "Naledi Dlamini",
        "email": "naledi.d@company.com",
        "role": "Data Engineer",
        "department": "Data",
        "experience_years": 4,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-20"),
        "skills_json": [
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 4},
            {"id": "s53", "name": "dbt", "category": "Data", "proficiency": 4},
            {"id": "s54", "name": "Snowflake", "category": "Data", "proficiency": 4},
            {"id": "s52", "name": "Airflow", "category": "Data", "proficiency": 3},
            {"id": "s11", "name": "PostgreSQL", "category": "Data", "proficiency": 4},
        ],
    },
    {
        "id": "emp-045",
        "name": "Oscar Lindqvist",
        "email": "oscar.l@company.com",
        "role": "Senior ML Engineer",
        "department": "Data",
        "experience_years": 8,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-04"),
        "skills_json": [
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 5},
            {"id": "s33", "name": "TensorFlow", "category": "ML", "proficiency": 5},
            {"id": "s36", "name": "Scala", "category": "Backend", "proficiency": 4},
            {"id": "s55", "name": "MLflow", "category": "ML", "proficiency": 4},
            {"id": "s3", "name": "AWS", "category": "Cloud", "proficiency": 4},
            {"id": "s8", "name": "Kubernetes", "category": "DevOps", "proficiency": 3},
        ],
    },
    # ── Mobile ────────────────────────────────────────────────────────────────
    {
        "id": "emp-046",
        "name": "Priya Shah",
        "email": "priya.s@company.com",
        "role": "iOS Engineer",
        "department": "Mobile",
        "experience_years": 5,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-15"),
        "skills_json": [
            {"id": "s22", "name": "Swift", "category": "Mobile", "proficiency": 5},
            {"id": "s77", "name": "iOS", "category": "Mobile", "proficiency": 5},
            {"id": "s23", "name": "Kotlin", "category": "Mobile", "proficiency": 3},
            {"id": "s50", "name": "Firebase", "category": "Mobile", "proficiency": 3},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 2},
        ],
    },
    {
        "id": "emp-047",
        "name": "Rafael Souza",
        "email": "rafael.s@company.com",
        "role": "Android Engineer",
        "department": "Mobile",
        "experience_years": 4,
        "availability": "available",
        "utilization_pct": 10,
        "bench_since": date.fromisoformat("2026-07-18"),
        "skills_json": [
            {"id": "s23", "name": "Kotlin", "category": "Mobile", "proficiency": 5},
            {"id": "s15", "name": "Java", "category": "Backend", "proficiency": 4},
            {"id": "s78", "name": "Android", "category": "Mobile", "proficiency": 5},
            {"id": "s50", "name": "Firebase", "category": "Mobile", "proficiency": 4},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 2},
        ],
    },
    {
        "id": "emp-048",
        "name": "Sophie Martin",
        "email": "sophie.m@company.com",
        "role": "Mobile Engineer",
        "department": "Mobile",
        "experience_years": 3,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-22"),
        "skills_json": [
            {"id": "s75", "name": "Flutter", "category": "Mobile", "proficiency": 4},
            {"id": "s23", "name": "Kotlin", "category": "Mobile", "proficiency": 3},
            {"id": "s22", "name": "Swift", "category": "Mobile", "proficiency": 3},
            {"id": "s50", "name": "Firebase", "category": "Mobile", "proficiency": 4},
            {"id": "s7", "name": "Docker", "category": "DevOps", "proficiency": 2},
        ],
    },
    {
        "id": "emp-049",
        "name": "Tariq Al-Amin",
        "email": "tariq.aa@company.com",
        "role": "Senior Mobile Engineer",
        "department": "Mobile",
        "experience_years": 7,
        "availability": "allocated",
        "utilization_pct": 100,
        "bench_since": None,
        "skills_json": [
            {"id": "s74", "name": "React Native", "category": "Mobile", "proficiency": 5},
            {"id": "s1", "name": "React", "category": "Frontend", "proficiency": 4},
            {"id": "s2", "name": "TypeScript", "category": "Frontend", "proficiency": 4},
            {"id": "s22", "name": "Swift", "category": "Mobile", "proficiency": 3},
            {"id": "s23", "name": "Kotlin", "category": "Mobile", "proficiency": 3},
        ],
    },
    {
        "id": "emp-050",
        "name": "Uma Krishnaswamy",
        "email": "uma.k@company.com",
        "role": "Mobile Engineer",
        "department": "Mobile",
        "experience_years": 4,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-14"),
        "skills_json": [
            {"id": "s74", "name": "React Native", "category": "Mobile", "proficiency": 4},
            {"id": "s2", "name": "TypeScript", "category": "Frontend", "proficiency": 3},
            {"id": "s23", "name": "Kotlin", "category": "Mobile", "proficiency": 3},
            {"id": "s50", "name": "Firebase", "category": "Mobile", "proficiency": 4},
        ],
    },
    {
        "id": "emp-051",
        "name": "Viktor Novak",
        "email": "viktor.n@company.com",
        "role": "Senior Mobile Engineer",
        "department": "Mobile",
        "experience_years": 6,
        "availability": "available",
        "utilization_pct": 10,
        "bench_since": date.fromisoformat("2026-07-09"),
        "skills_json": [
            {"id": "s22", "name": "Swift", "category": "Mobile", "proficiency": 5},
            {"id": "s77", "name": "iOS", "category": "Mobile", "proficiency": 5},
            {"id": "s75", "name": "Flutter", "category": "Mobile", "proficiency": 4},
            {"id": "s23", "name": "Kotlin", "category": "Mobile", "proficiency": 4},
            {"id": "s50", "name": "Firebase", "category": "Mobile", "proficiency": 3},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 2},
        ],
    },
    {
        "id": "emp-052",
        "name": "Wendy Osei",
        "email": "wendy.o@company.com",
        "role": "Flutter Engineer",
        "department": "Mobile",
        "experience_years": 3,
        "availability": "on_leave",
        "utilization_pct": 0,
        "bench_since": None,
        "skills_json": [
            {"id": "s75", "name": "Flutter", "category": "Mobile", "proficiency": 4},
            {"id": "s23", "name": "Kotlin", "category": "Mobile", "proficiency": 3},
            {"id": "s50", "name": "Firebase", "category": "Mobile", "proficiency": 3},
        ],
    },
    # ── Cloud ─────────────────────────────────────────────────────────────────
    {
        "id": "emp-053",
        "name": "Xavier Dubois",
        "email": "xavier.d@company.com",
        "role": "Cloud Architect",
        "department": "Cloud",
        "experience_years": 10,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-06"),
        "skills_json": [
            {"id": "s3", "name": "AWS", "category": "Cloud", "proficiency": 5},
            {"id": "s43", "name": "Azure", "category": "Cloud", "proficiency": 5},
            {"id": "s44", "name": "GCP", "category": "Cloud", "proficiency": 4},
            {"id": "s45", "name": "Terraform", "category": "DevOps", "proficiency": 5},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 4},
            {"id": "s17", "name": "Go", "category": "Backend", "proficiency": 3},
        ],
    },
    {
        "id": "emp-054",
        "name": "Yuki Nakamura",
        "email": "yuki.n@company.com",
        "role": "Cloud Engineer",
        "department": "Cloud",
        "experience_years": 5,
        "availability": "available",
        "utilization_pct": 20,
        "bench_since": date.fromisoformat("2026-07-10"),
        "skills_json": [
            {"id": "s3", "name": "AWS", "category": "Cloud", "proficiency": 5},
            {"id": "s59d", "name": "DynamoDB", "category": "Cloud", "proficiency": 4},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 4},
            {"id": "s45", "name": "Terraform", "category": "DevOps", "proficiency": 3},
            {"id": "s7", "name": "Docker", "category": "DevOps", "proficiency": 3},
        ],
    },
    {
        "id": "emp-055",
        "name": "Zara Ahmed",
        "email": "zara.a@company.com",
        "role": "Azure Cloud Engineer",
        "department": "Cloud",
        "experience_years": 4,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-17"),
        "skills_json": [
            {"id": "s43", "name": "Azure", "category": "Cloud", "proficiency": 5},
            {"id": "s20", "name": "C#", "category": "Backend", "proficiency": 4},
            {"id": "s42", "name": ".NET", "category": "Backend", "proficiency": 3},
            {"id": "s45", "name": "Terraform", "category": "DevOps", "proficiency": 3},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 2},
        ],
    },
    {
        "id": "emp-056",
        "name": "Aaron Mitchell",
        "email": "aaron.m@company.com",
        "role": "GCP Engineer",
        "department": "Cloud",
        "experience_years": 6,
        "availability": "allocated",
        "utilization_pct": 90,
        "bench_since": None,
        "skills_json": [
            {"id": "s44", "name": "GCP", "category": "Cloud", "proficiency": 5},
            {"id": "s3", "name": "AWS", "category": "Cloud", "proficiency": 3},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 4},
            {"id": "s17", "name": "Go", "category": "Backend", "proficiency": 4},
            {"id": "s8", "name": "Kubernetes", "category": "DevOps", "proficiency": 4},
        ],
    },
    {
        "id": "emp-057",
        "name": "Beatriz Ferreira",
        "email": "beatriz.f@company.com",
        "role": "Cloud Security Engineer",
        "department": "Cloud",
        "experience_years": 7,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-08"),
        "skills_json": [
            {"id": "s3", "name": "AWS", "category": "Cloud", "proficiency": 5},
            {"id": "s43", "name": "Azure", "category": "Cloud", "proficiency": 4},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 4},
            {"id": "s17", "name": "Go", "category": "Backend", "proficiency": 3},
            {"id": "s45", "name": "Terraform", "category": "DevOps", "proficiency": 4},
        ],
    },
    # ── Security ──────────────────────────────────────────────────────────────
    {
        "id": "emp-058",
        "name": "Cyrus Rahimi",
        "email": "cyrus.r@company.com",
        "role": "Security Engineer",
        "department": "Security",
        "experience_years": 6,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-11"),
        "skills_json": [
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 5},
            {"id": "s17", "name": "Go", "category": "Backend", "proficiency": 4},
            {"id": "s7", "name": "Docker", "category": "DevOps", "proficiency": 3},
            {"id": "s8", "name": "Kubernetes", "category": "DevOps", "proficiency": 3},
            {"id": "s3", "name": "AWS", "category": "Cloud", "proficiency": 3},
        ],
    },
    {
        "id": "emp-059",
        "name": "Daniyar Seitkali",
        "email": "daniyar.s@company.com",
        "role": "Senior Security Engineer",
        "department": "Security",
        "experience_years": 8,
        "availability": "available",
        "utilization_pct": 10,
        "bench_since": date.fromisoformat("2026-07-05"),
        "skills_json": [
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 5},
            {"id": "s21", "name": "Rust", "category": "Backend", "proficiency": 4},
            {"id": "s17", "name": "Go", "category": "Backend", "proficiency": 4},
            {"id": "s7", "name": "Docker", "category": "DevOps", "proficiency": 4},
            {"id": "s8", "name": "Kubernetes", "category": "DevOps", "proficiency": 3},
        ],
    },
    {
        "id": "emp-060",
        "name": "Elena Volkov",
        "email": "elena.v@company.com",
        "role": "AppSec Engineer",
        "department": "Security",
        "experience_years": 5,
        "availability": "allocated",
        "utilization_pct": 80,
        "bench_since": None,
        "skills_json": [
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 4},
            {"id": "s15", "name": "Java", "category": "Backend", "proficiency": 3},
            {"id": "s20", "name": "C#", "category": "Backend", "proficiency": 3},
            {"id": "s7", "name": "Docker", "category": "DevOps", "proficiency": 3},
        ],
    },
    # ── QA / Testing ──────────────────────────────────────────────────────────
    {
        "id": "emp-061",
        "name": "Farida Abubakar",
        "email": "farida.a@company.com",
        "role": "QA Engineer",
        "department": "QA",
        "experience_years": 3,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-22"),
        "skills_json": [
            {"id": "s13", "name": "Selenium", "category": "QA", "proficiency": 4},
            {"id": "s14", "name": "Cypress", "category": "QA", "proficiency": 4},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 3},
            {"id": "s82", "name": "Jest", "category": "QA", "proficiency": 3},
        ],
    },
    {
        "id": "emp-062",
        "name": "George Papadopoulos",
        "email": "george.p@company.com",
        "role": "Senior QA Engineer",
        "department": "QA",
        "experience_years": 6,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-10"),
        "skills_json": [
            {"id": "s13", "name": "Selenium", "category": "QA", "proficiency": 5},
            {"id": "s15", "name": "Java", "category": "Backend", "proficiency": 4},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 3},
            {"id": "s56", "name": "Playwright", "category": "QA", "proficiency": 4},
            {"id": "s83", "name": "pytest", "category": "QA", "proficiency": 4},
        ],
    },
    {
        "id": "emp-063",
        "name": "Hannah Nguyen",
        "email": "hannah.n@company.com",
        "role": "QA Automation Engineer",
        "department": "QA",
        "experience_years": 4,
        "availability": "available",
        "utilization_pct": 20,
        "bench_since": date.fromisoformat("2026-07-16"),
        "skills_json": [
            {"id": "s14", "name": "Cypress", "category": "QA", "proficiency": 5},
            {"id": "s56", "name": "Playwright", "category": "QA", "proficiency": 4},
            {"id": "s82", "name": "Jest", "category": "QA", "proficiency": 4},
            {"id": "s2", "name": "TypeScript", "category": "Frontend", "proficiency": 3},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 2},
        ],
    },
    {
        "id": "emp-064",
        "name": "Ishaan Mehta",
        "email": "ishaan.m@company.com",
        "role": "QA Lead",
        "department": "QA",
        "experience_years": 7,
        "availability": "allocated",
        "utilization_pct": 80,
        "bench_since": None,
        "skills_json": [
            {"id": "s13", "name": "Selenium", "category": "QA", "proficiency": 5},
            {"id": "s15", "name": "Java", "category": "Backend", "proficiency": 4},
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 3},
            {"id": "s14", "name": "Cypress", "category": "QA", "proficiency": 4},
            {"id": "s56", "name": "Playwright", "category": "QA", "proficiency": 3},
            {"id": "s7", "name": "Docker", "category": "DevOps", "proficiency": 3},
        ],
    },
    {
        "id": "emp-065",
        "name": "Josephine Andersen",
        "email": "josephine.a@company.com",
        "role": "Performance QA Engineer",
        "department": "QA",
        "experience_years": 5,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-13"),
        "skills_json": [
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 4},
            {"id": "s15", "name": "Java", "category": "Backend", "proficiency": 3},
            {"id": "s13", "name": "Selenium", "category": "QA", "proficiency": 4},
            {"id": "s83", "name": "pytest", "category": "QA", "proficiency": 4},
            {"id": "s7", "name": "Docker", "category": "DevOps", "proficiency": 3},
        ],
    },
    # ── Full-Stack (mixed department) ─────────────────────────────────────────
    {
        "id": "emp-066",
        "name": "Karan Joshi",
        "email": "karan.j@company.com",
        "role": "Full Stack Engineer",
        "department": "Backend",
        "experience_years": 5,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-15"),
        "skills_json": [
            {"id": "s4", "name": "Python", "category": "Backend", "proficiency": 4},
            {"id": "s37", "name": "Django", "category": "Backend", "proficiency": 4},
            {"id": "s1", "name": "React", "category": "Frontend", "proficiency": 4},
            {"id": "s11", "name": "PostgreSQL", "category": "Data", "proficiency": 3},
            {"id": "s3", "name": "AWS", "category": "Cloud", "proficiency": 3},
        ],
    },
    {
        "id": "emp-067",
        "name": "Laura Santos",
        "email": "laura.s@company.com",
        "role": "Full Stack Engineer",
        "department": "Frontend",
        "experience_years": 4,
        "availability": "available",
        "utilization_pct": 10,
        "bench_since": date.fromisoformat("2026-07-19"),
        "skills_json": [
            {"id": "s1", "name": "React", "category": "Frontend", "proficiency": 4},
            {"id": "s2", "name": "TypeScript", "category": "Frontend", "proficiency": 4},
            {"id": "s6", "name": "Node.js", "category": "Backend", "proficiency": 4},
            {"id": "s29", "name": "MongoDB", "category": "Data", "proficiency": 3},
            {"id": "s39", "name": "Express.js", "category": "Backend", "proficiency": 3},
        ],
    },
    {
        "id": "emp-068",
        "name": "Mohammed Al-Farsi",
        "email": "mohammed.af@company.com",
        "role": "Full Stack Engineer",
        "department": "Backend",
        "experience_years": 6,
        "availability": "available",
        "utilization_pct": 0,
        "bench_since": date.fromisoformat("2026-07-10"),
        "skills_json": [
            {"id": "s18", "name": "PHP", "category": "Backend", "proficiency": 5},
            {"id": "s1", "name": "React", "category": "Frontend", "proficiency": 4},
            {"id": "s31", "name": "MySQL", "category": "Data", "proficiency": 4},
            {"id": "s3", "name": "AWS", "category": "Cloud", "proficiency": 3},
            {"id": "s7", "name": "Docker", "category": "DevOps", "proficiency": 3},
        ],
    },
]

SEED_PROJECT_NEEDS = [
    {
        "id": "need-001",
        "project_id": "proj-001",
        "project_name": "Alpha Commerce Platform",
        "role_title": "Frontend Lead",
        "open_slots": 1,
        "required_skills_json": ["React", "TypeScript"],
        "start_date": date.fromisoformat("2026-08-01"),
        "status": "open",
        "priority": "high",
    },
    {
        "id": "need-002",
        "project_id": "proj-003",
        "project_name": "Gamma Mobile App",
        "role_title": "Full-Stack Engineer",
        "open_slots": 2,
        "required_skills_json": ["React", "Node.js", "AWS"],
        "start_date": date.fromisoformat("2026-08-01"),
        "status": "open",
        "priority": "high",
    },
    {
        "id": "need-003",
        "project_id": "proj-004",
        "project_name": "Delta DevOps Pipeline",
        "role_title": "DevOps Engineer",
        "open_slots": 1,
        "required_skills_json": ["Docker", "Kubernetes"],
        "start_date": date.fromisoformat("2026-07-20"),
        "status": "open",
        "priority": "low",
    },
    {
        "id": "need-004",
        "project_id": "proj-006",
        "project_name": "Zeta AI Platform",
        "role_title": "ML Engineer",
        "open_slots": 2,
        "required_skills_json": ["Python", "TensorFlow", "PyTorch"],
        "start_date": date.fromisoformat("2026-08-15"),
        "status": "open",
        "priority": "high",
    },
    {
        "id": "need-005",
        "project_id": "proj-007",
        "project_name": "Eta Data Warehouse",
        "role_title": "Data Engineer",
        "open_slots": 2,
        "required_skills_json": ["Python", "Spark", "Airflow"],
        "start_date": date.fromisoformat("2026-08-01"),
        "status": "open",
        "priority": "medium",
    },
    {
        "id": "need-006",
        "project_id": "proj-008",
        "project_name": "Theta Mobile Banking",
        "role_title": "iOS Developer",
        "open_slots": 1,
        "required_skills_json": ["Swift", "iOS", "Firebase"],
        "start_date": date.fromisoformat("2026-08-10"),
        "status": "open",
        "priority": "high",
    },
    {
        "id": "need-007",
        "project_id": "proj-009",
        "project_name": "Iota Cloud Migration",
        "role_title": "Cloud Architect",
        "open_slots": 1,
        "required_skills_json": ["AWS", "Terraform", "Kubernetes"],
        "start_date": date.fromisoformat("2026-09-01"),
        "status": "open",
        "priority": "high",
    },
    {
        "id": "need-008",
        "project_id": "proj-010",
        "project_name": "Kappa E-Commerce Backend",
        "role_title": "Java Backend Engineer",
        "open_slots": 2,
        "required_skills_json": ["Java", "Spring Boot", "PostgreSQL"],
        "start_date": date.fromisoformat("2026-08-05"),
        "status": "open",
        "priority": "medium",
    },
    {
        "id": "need-009",
        "project_id": "proj-011",
        "project_name": "Lambda Security Hardening",
        "role_title": "Security Engineer",
        "open_slots": 1,
        "required_skills_json": ["Python", "Go", "Kubernetes"],
        "start_date": date.fromisoformat("2026-08-20"),
        "status": "open",
        "priority": "high",
    },
    {
        "id": "need-010",
        "project_id": "proj-012",
        "project_name": "Mu SaaS Portal",
        "role_title": "Full Stack Engineer",
        "open_slots": 3,
        "required_skills_json": ["React", "Python", "PostgreSQL", "Docker"],
        "start_date": date.fromisoformat("2026-08-15"),
        "status": "open",
        "priority": "medium",
    },
]

SEED_ALLOCATIONS = [
    {
        "id": "alloc-001",
        "employee_id": "emp-004",
        "employee_name": "Alice Chen",
        "project_id": "proj-001",
        "project_name": "Alpha Commerce Platform",
        "role": "Tech Lead",
        "start_date": date.fromisoformat("2026-06-01"),
        "end_date": None,
        "outcome": "ongoing",
        "notes": None,
    },
    {
        "id": "alloc-002",
        "employee_id": "emp-007",
        "employee_name": "Sam Wilson",
        "project_id": "proj-002",
        "project_name": "Beta Analytics Dashboard",
        "role": "Senior Engineer",
        "start_date": date.fromisoformat("2026-05-15"),
        "end_date": None,
        "outcome": "ongoing",
        "notes": None,
    },
    {
        "id": "alloc-003",
        "employee_id": "emp-001",
        "employee_name": "John Doe",
        "project_id": "proj-005",
        "project_name": "Epsilon Data Lake",
        "role": "Frontend Engineer",
        "start_date": date.fromisoformat("2026-02-01"),
        "end_date": date.fromisoformat("2026-06-30"),
        "outcome": "completed",
        "notes": None,
    },
    {
        "id": "alloc-004",
        "employee_id": "emp-003",
        "employee_name": "Bob Johnson",
        "project_id": "proj-005",
        "project_name": "Epsilon Data Lake",
        "role": "DevOps Engineer",
        "start_date": date.fromisoformat("2026-03-01"),
        "end_date": date.fromisoformat("2026-06-30"),
        "outcome": "completed",
        "notes": None,
    },
    {
        "id": "alloc-005",
        "employee_id": "emp-012",
        "employee_name": "Fatima Al-Rashid",
        "project_id": "proj-001",
        "project_name": "Alpha Commerce Platform",
        "role": "Senior Frontend Engineer",
        "start_date": date.fromisoformat("2026-06-15"),
        "end_date": None,
        "outcome": "ongoing",
        "notes": None,
    },
    {
        "id": "alloc-006",
        "employee_id": "emp-013",
        "employee_name": "Hiroshi Tanaka",
        "project_id": "proj-003",
        "project_name": "Gamma Mobile App",
        "role": "Frontend Engineer",
        "start_date": date.fromisoformat("2026-06-01"),
        "end_date": None,
        "outcome": "ongoing",
        "notes": None,
    },
    {
        "id": "alloc-007",
        "employee_id": "emp-020",
        "employee_name": "Marco Rossi",
        "project_id": "proj-010",
        "project_name": "Kappa E-Commerce Backend",
        "role": "Tech Lead",
        "start_date": date.fromisoformat("2026-05-01"),
        "end_date": None,
        "outcome": "ongoing",
        "notes": None,
    },
    {
        "id": "alloc-008",
        "employee_id": "emp-022",
        "employee_name": "Omar Hassan",
        "project_id": "proj-013",
        "project_name": "Nu Enterprise Portal",
        "role": "Senior Backend Engineer",
        "start_date": date.fromisoformat("2026-06-01"),
        "end_date": None,
        "outcome": "ongoing",
        "notes": None,
    },
    {
        "id": "alloc-009",
        "employee_id": "emp-026",
        "employee_name": "Stefan Mueller",
        "project_id": "proj-014",
        "project_name": "Xi CMS Platform",
        "role": "Backend Engineer",
        "start_date": date.fromisoformat("2026-07-01"),
        "end_date": None,
        "outcome": "ongoing",
        "notes": None,
    },
    {
        "id": "alloc-010",
        "employee_id": "emp-033",
        "employee_name": "Clara Johansson",
        "project_id": "proj-007",
        "project_name": "Iota Cloud Migration",
        "role": "Cloud Engineer",
        "start_date": date.fromisoformat("2026-06-01"),
        "end_date": None,
        "outcome": "ongoing",
        "notes": None,
    },
    {
        "id": "alloc-011",
        "employee_id": "emp-036",
        "employee_name": "Felix Wagner",
        "project_id": "proj-004",
        "project_name": "Delta DevOps Pipeline",
        "role": "Platform Engineer",
        "start_date": date.fromisoformat("2026-05-15"),
        "end_date": None,
        "outcome": "ongoing",
        "notes": None,
    },
    {
        "id": "alloc-012",
        "employee_id": "emp-041",
        "employee_name": "Kenji Watanabe",
        "project_id": "proj-007",
        "project_name": "Eta Data Warehouse",
        "role": "Senior Data Engineer",
        "start_date": date.fromisoformat("2026-06-15"),
        "end_date": None,
        "outcome": "ongoing",
        "notes": None,
    },
    {
        "id": "alloc-013",
        "employee_id": "emp-049",
        "employee_name": "Tariq Al-Amin",
        "project_id": "proj-008",
        "project_name": "Theta Mobile Banking",
        "role": "Senior Mobile Engineer",
        "start_date": date.fromisoformat("2026-07-01"),
        "end_date": None,
        "outcome": "ongoing",
        "notes": None,
    },
    {
        "id": "alloc-014",
        "employee_id": "emp-056",
        "employee_name": "Aaron Mitchell",
        "project_id": "proj-015",
        "project_name": "Omicron Analytics Backend",
        "role": "GCP Engineer",
        "start_date": date.fromisoformat("2026-05-01"),
        "end_date": None,
        "outcome": "ongoing",
        "notes": None,
    },
    {
        "id": "alloc-015",
        "employee_id": "emp-060",
        "employee_name": "Elena Volkov",
        "project_id": "proj-011",
        "project_name": "Lambda Security Hardening",
        "role": "AppSec Engineer",
        "start_date": date.fromisoformat("2026-06-15"),
        "end_date": None,
        "outcome": "ongoing",
        "notes": None,
    },
    {
        "id": "alloc-016",
        "employee_id": "emp-064",
        "employee_name": "Ishaan Mehta",
        "project_id": "proj-016",
        "project_name": "Pi Payments Gateway",
        "role": "QA Lead",
        "start_date": date.fromisoformat("2026-06-01"),
        "end_date": None,
        "outcome": "ongoing",
        "notes": None,
    },
    {
        "id": "alloc-017",
        "employee_id": "emp-009",
        "employee_name": "Arjun Sharma",
        "project_id": "proj-017",
        "project_name": "Rho Fintech Dashboard",
        "role": "Senior Frontend Engineer",
        "start_date": date.fromisoformat("2026-01-15"),
        "end_date": date.fromisoformat("2026-06-30"),
        "outcome": "completed",
        "notes": None,
    },
    {
        "id": "alloc-018",
        "employee_id": "emp-039",
        "employee_name": "Ibrahim Yilmaz",
        "project_id": "proj-006",
        "project_name": "Zeta AI Platform",
        "role": "ML Engineer",
        "start_date": date.fromisoformat("2026-03-01"),
        "end_date": date.fromisoformat("2026-06-30"),
        "outcome": "completed",
        "notes": None,
    },
]

SEED_SKILL_TAGS = [
    # Frontend
    {"id": "tag-001", "name": "React", "category": "Frontend", "usage": 18},
    {"id": "tag-002", "name": "TypeScript", "category": "Frontend", "usage": 16},
    {"id": "tag-025", "name": "Vue.js", "category": "Frontend", "usage": 8},
    {"id": "tag-026", "name": "Next.js", "category": "Frontend", "usage": 9},
    {"id": "tag-027", "name": "Angular", "category": "Frontend", "usage": 7},
    {"id": "tag-028", "name": "Svelte", "category": "Frontend", "usage": 3},
    {"id": "tag-029", "name": "GraphQL", "category": "Frontend", "usage": 8},
    {"id": "tag-030", "name": "Tailwind CSS", "category": "Frontend", "usage": 6},
    # Backend Languages
    {"id": "tag-003", "name": "Python", "category": "Backend", "usage": 22},
    {"id": "tag-015", "name": "Java", "category": "Backend", "usage": 14},
    {"id": "tag-031", "name": "Go", "category": "Backend", "usage": 9},
    {"id": "tag-032", "name": "Rust", "category": "Backend", "usage": 4},
    {"id": "tag-033", "name": "PHP", "category": "Backend", "usage": 7},
    {"id": "tag-034", "name": "Ruby", "category": "Backend", "usage": 5},
    {"id": "tag-035", "name": "C#", "category": "Backend", "usage": 8},
    {"id": "tag-036", "name": "Scala", "category": "Backend", "usage": 6},
    {"id": "tag-037", "name": "Node.js", "category": "Backend", "usage": 12},
    {"id": "tag-038", "name": "Kotlin", "category": "Mobile", "usage": 7},
    {"id": "tag-039", "name": "Swift", "category": "Mobile", "usage": 5},
    # Backend Frameworks
    {"id": "tag-040", "name": "Spring Boot", "category": "Backend", "usage": 10},
    {"id": "tag-041", "name": "Django", "category": "Backend", "usage": 8},
    {"id": "tag-042", "name": "FastAPI", "category": "Backend", "usage": 7},
    {"id": "tag-043", "name": "Laravel", "category": "Backend", "usage": 5},
    {"id": "tag-044", "name": "Rails", "category": "Backend", "usage": 4},
    {"id": "tag-045", "name": ".NET", "category": "Backend", "usage": 7},
    {"id": "tag-046", "name": "Express.js", "category": "Backend", "usage": 8},
    {"id": "tag-047", "name": "gRPC", "category": "Backend", "usage": 5},
    # Cloud & DevOps
    {"id": "tag-004", "name": "AWS", "category": "Cloud", "usage": 20},
    {"id": "tag-048", "name": "Azure", "category": "Cloud", "usage": 10},
    {"id": "tag-049", "name": "GCP", "category": "Cloud", "usage": 7},
    {"id": "tag-005", "name": "Docker", "category": "DevOps", "usage": 18},
    {"id": "tag-050", "name": "Kubernetes", "category": "DevOps", "usage": 14},
    {"id": "tag-051", "name": "Terraform", "category": "DevOps", "usage": 9},
    {"id": "tag-052", "name": "Ansible", "category": "DevOps", "usage": 5},
    {"id": "tag-053", "name": "Jenkins", "category": "DevOps", "usage": 6},
    # Data & Databases
    {"id": "tag-006", "name": "PostgreSQL", "category": "Data", "usage": 16},
    {"id": "tag-054", "name": "MySQL", "category": "Data", "usage": 12},
    {"id": "tag-055", "name": "MongoDB", "category": "Data", "usage": 10},
    {"id": "tag-056", "name": "Redis", "category": "Data", "usage": 11},
    {"id": "tag-057", "name": "Elasticsearch", "category": "Data", "usage": 6},
    {"id": "tag-058", "name": "Cassandra", "category": "Data", "usage": 4},
    {"id": "tag-059", "name": "DynamoDB", "category": "Cloud", "usage": 5},
    {"id": "tag-060", "name": "SQL Server", "category": "Data", "usage": 6},
    {"id": "tag-061", "name": "Snowflake", "category": "Data", "usage": 4},
    # Data Engineering & ML
    {"id": "tag-062", "name": "Spark", "category": "Data", "usage": 8},
    {"id": "tag-063", "name": "Kafka", "category": "Data", "usage": 9},
    {"id": "tag-064", "name": "Airflow", "category": "Data", "usage": 6},
    {"id": "tag-065", "name": "dbt", "category": "Data", "usage": 4},
    {"id": "tag-066", "name": "Hadoop", "category": "Data", "usage": 4},
    {"id": "tag-067", "name": "TensorFlow", "category": "ML", "usage": 7},
    {"id": "tag-068", "name": "PyTorch", "category": "ML", "usage": 6},
    {"id": "tag-069", "name": "scikit-learn", "category": "ML", "usage": 5},
    {"id": "tag-070", "name": "R", "category": "Data", "usage": 5},
    {"id": "tag-071", "name": "Pandas", "category": "Data", "usage": 8},
    {"id": "tag-072", "name": "MLflow", "category": "ML", "usage": 4},
    {"id": "tag-073", "name": "Hugging Face", "category": "ML", "usage": 4},
    # Mobile
    {"id": "tag-074", "name": "React Native", "category": "Mobile", "usage": 6},
    {"id": "tag-075", "name": "Flutter", "category": "Mobile", "usage": 5},
    {"id": "tag-076", "name": "Firebase", "category": "Mobile", "usage": 7},
    {"id": "tag-077", "name": "iOS", "category": "Mobile", "usage": 5},
    {"id": "tag-078", "name": "Android", "category": "Mobile", "usage": 6},
    # QA
    {"id": "tag-079", "name": "Selenium", "category": "QA", "usage": 8},
    {"id": "tag-080", "name": "Cypress", "category": "QA", "usage": 7},
    {"id": "tag-081", "name": "Playwright", "category": "QA", "usage": 5},
    {"id": "tag-082", "name": "Jest", "category": "QA", "usage": 6},
    {"id": "tag-083", "name": "pytest", "category": "QA", "usage": 7},
    # Messaging
    {"id": "tag-084", "name": "RabbitMQ", "category": "Backend", "usage": 5},
]


def _employee_from_row(row: EmployeeRow) -> Employee:
    skills = [
        EmployeeSkill(
            skill=Skill(id=str(entry["id"]), name=str(entry["name"]), category=str(entry["category"])),
            proficiency=int(entry["proficiency"]),
        )
        for entry in row.skills_json
    ]
    return Employee(
        id=row.id,
        name=row.name,
        email=row.email,
        role=row.role,
        department=row.department,
        experienceYears=row.experience_years,
        availability=row.availability,
        utilizationPct=row.utilization_pct,
        benchSince=row.bench_since,
        interviewScore=row.interview_score,
        interviewResult=row.interview_result,
        skills=skills,
        avatar=row.avatar,
    )


def _project_need_from_row(row: ProjectNeedRow) -> ProjectNeed:
    return ProjectNeed(
        id=row.id,
        projectId=row.project_id,
        projectName=row.project_name,
        roleTitle=row.role_title,
        openSlots=row.open_slots,
        requiredSkills=[str(skill) for skill in row.required_skills_json],
        startDate=row.start_date,
        status=row.status,
        priority=row.priority,
    )


def _allocation_from_row(row: AllocationHistoryRow) -> AllocationHistory:
    return AllocationHistory(
        id=row.id,
        employeeId=row.employee_id,
        employeeName=row.employee_name,
        projectId=row.project_id,
        projectName=row.project_name,
        role=row.role,
        startDate=row.start_date,
        endDate=row.end_date,
        outcome=row.outcome,
        notes=row.notes,
    )


def _skill_tag_from_row(row: SkillTagRow) -> SkillTag:
    return SkillTag(id=row.id, name=row.name, category=row.category, usage=row.usage)


class DatabaseStore:
    def __init__(self) -> None:
        self._seeded = False

    def initialize(self) -> None:
        if self._seeded:
            return
        Base.metadata.create_all(bind=engine)
        self._ensure_employee_columns()
        with SessionLocal() as session:
            existing = session.scalar(select(EmployeeRow.id).limit(1))
            if existing is None:
                self._seed(session)
            else:
                # Top-up: insert any seed employees/needs/allocations/tags not yet in the DB
                self._topup_seed(session)
        self._seeded = True

    def _topup_seed(self, session: Session) -> None:
        """Insert any seed records that are missing from the database (safe to call on existing DBs)."""
        existing_employee_ids = set(session.scalars(select(EmployeeRow.id)).all())
        for row in SEED_EMPLOYEES:
            if row["id"] not in existing_employee_ids:
                session.add(EmployeeRow(**row))

        existing_need_ids = set(session.scalars(select(ProjectNeedRow.id)).all())
        for row in SEED_PROJECT_NEEDS:
            if row["id"] not in existing_need_ids:
                session.add(ProjectNeedRow(**row))

        existing_alloc_ids = set(session.scalars(select(AllocationHistoryRow.id)).all())
        for row in SEED_ALLOCATIONS:
            if row["id"] not in existing_alloc_ids:
                session.add(AllocationHistoryRow(**row))

        existing_tag_names = set(session.scalars(select(SkillTagRow.name)).all())
        for row in SEED_SKILL_TAGS:
            if row["name"] not in existing_tag_names:
                session.add(SkillTagRow(**row))

        session.commit()

    def _ensure_employee_columns(self) -> None:
        with engine.begin() as connection:
            dialect = connection.dialect.name
            if dialect == "sqlite":
                columns = {row[1] for row in connection.exec_driver_sql("PRAGMA table_info(employees)").fetchall()}
            else:
                columns = {
                    row[0]
                    for row in connection.exec_driver_sql(
                        "SELECT column_name FROM information_schema.columns WHERE table_name = 'employees'"
                    ).fetchall()
                }
            if "interview_score" not in columns:
                connection.exec_driver_sql("ALTER TABLE employees ADD COLUMN interview_score INTEGER")
            if "interview_result" not in columns:
                connection.exec_driver_sql("ALTER TABLE employees ADD COLUMN interview_result VARCHAR(64)")

    def _seed(self, session: Session) -> None:
        session.add_all(UserRow(password_hash="", **row) for row in SEED_USERS)
        session.add_all(EmployeeRow(**row) for row in SEED_EMPLOYEES)
        session.add_all(ProjectNeedRow(**row) for row in SEED_PROJECT_NEEDS)
        session.add_all(AllocationHistoryRow(**row) for row in SEED_ALLOCATIONS)
        session.add_all(SkillTagRow(**row) for row in SEED_SKILL_TAGS)
        session.commit()

    @property
    def users(self) -> dict[str, User]:
        self.initialize()
        with SessionLocal() as session:
            rows = session.scalars(select(UserRow)).all()
        return {row.email: User(id=row.id, name=row.name, email=row.email, role=row.role) for row in rows}

    @property
    def employees(self) -> dict[str, Employee]:
        return {employee.id: employee for employee in self.list_employees()}

    @property
    def project_needs(self) -> dict[str, ProjectNeed]:
        return {need.id: need for need in self.list_project_needs()}

    @property
    def allocations(self) -> list[AllocationHistory]:
        return self.list_allocations()

    def get_user_by_email(self, email: str) -> User | None:
        self.initialize()
        with SessionLocal() as session:
            row = session.scalar(select(UserRow).where(UserRow.email == email))
        if not row:
            return None
        return User(id=row.id, name=row.name, email=row.email, role=row.role)

    def save_user(self, user: User) -> User:
        self.initialize()
        with SessionLocal() as session:
            existing = session.scalar(select(UserRow).where(UserRow.email == user.email))
            if existing:
                existing.name = user.name
                existing.role = user.role
            else:
                session.add(UserRow(id=user.id, email=user.email, name=user.name, role=user.role, password_hash=""))
            session.commit()
        return user

    def issue_token(self, email: str) -> str:
        self.initialize()
        token = f"mock-jwt-{uuid4()}"
        with SessionLocal() as session:
            session.add(AuthTokenRow(token=token, user_email=email))
            session.commit()
        return token

    def revoke_token(self, token: str) -> None:
        self.initialize()
        with SessionLocal() as session:
            row = session.scalar(select(AuthTokenRow).where(AuthTokenRow.token == token))
            if row:
                session.delete(row)
                session.commit()

    def get_user_by_token(self, token: str | None) -> User | None:
        self.initialize()
        if not token:
            return None
        with SessionLocal() as session:
            token_row = session.scalar(select(AuthTokenRow).where(AuthTokenRow.token == token))
            if not token_row:
                return None
            user_row = session.scalar(select(UserRow).where(UserRow.email == token_row.user_email))
        if not user_row:
            return None
        return User(id=user_row.id, name=user_row.name, email=user_row.email, role=user_row.role)

    def list_employees(self) -> list[Employee]:
        self.initialize()
        with SessionLocal() as session:
            rows = session.scalars(select(EmployeeRow)).all()
        return [_employee_from_row(row) for row in rows]

    def list_project_needs(self) -> list[ProjectNeed]:
        self.initialize()
        with SessionLocal() as session:
            rows = session.scalars(select(ProjectNeedRow)).all()
        return [_project_need_from_row(row) for row in rows]

    def get_project_need(self, project_need_id: str) -> ProjectNeed | None:
        self.initialize()
        with SessionLocal() as session:
            row = session.scalar(select(ProjectNeedRow).where(ProjectNeedRow.id == project_need_id))
        if not row:
            return None
        return _project_need_from_row(row)

    def list_allocations(self) -> list[AllocationHistory]:
        self.initialize()
        with SessionLocal() as session:
            rows = session.scalars(select(AllocationHistoryRow).order_by(AllocationHistoryRow.start_date.desc())).all()
        return [_allocation_from_row(row) for row in rows]

    def _record_import_event(
        self,
        *,
        session: Session,
        dataset_key: str,
        source_file: str,
        imported: int,
        updated: int,
        skipped: int,
    ) -> None:
        session.add(
            ImportEventRow(
                id=f"imp-{uuid4()}",
                dataset_key=dataset_key,
                filename=source_file,
                imported_rows=imported,
                updated_rows=updated,
                skipped_rows=skipped,
                created_at=datetime.now(UTC),
            )
        )

    def list_skill_tags(self) -> list[SkillTag]:
        self.initialize()
        with SessionLocal() as session:
            rows = session.scalars(select(SkillTagRow).order_by(SkillTagRow.name.asc())).all()
        return [_skill_tag_from_row(row) for row in rows]

    def create_skill_tag(self, *, name: str, category: str) -> SkillTag:
        self.initialize()
        normalized_name = name.strip()
        with SessionLocal() as session:
            existing = session.scalar(select(SkillTagRow).where(SkillTagRow.name == normalized_name))
            if existing:
                raise ValueError("Skill tag already exists")
            row = SkillTagRow(id=f"tag-{uuid4()}", name=normalized_name, category=category.strip(), usage=0)
            session.add(row)
            session.commit()
            session.refresh(row)
            return _skill_tag_from_row(row)

    def update_skill_tag(self, *, skill_id: str, name: str, category: str) -> SkillTag:
        self.initialize()
        with SessionLocal() as session:
            row = session.scalar(select(SkillTagRow).where(SkillTagRow.id == skill_id))
            if not row:
                raise ValueError("Skill tag not found")
            duplicate = session.scalar(select(SkillTagRow).where(SkillTagRow.name == name.strip(), SkillTagRow.id != skill_id))
            if duplicate:
                raise ValueError("Skill tag already exists")
            row.name = name.strip()
            row.category = category.strip()
            session.commit()
            session.refresh(row)
            return _skill_tag_from_row(row)

    def delete_skill_tag(self, *, skill_id: str) -> None:
        self.initialize()
        with SessionLocal() as session:
            row = session.scalar(select(SkillTagRow).where(SkillTagRow.id == skill_id))
            if not row:
                raise ValueError("Skill tag not found")
            session.delete(row)
            session.commit()

    def import_candidates(self, rows: list[dict[str, object]], source_file: str) -> dict[str, int | str]:
        self.initialize()
        imported = 0
        updated = 0
        skipped = 0
        with SessionLocal() as session:
            for entry in rows:
                candidate_id = str(entry["id"])
                existing = session.scalar(select(EmployeeRow).where(EmployeeRow.id == candidate_id))
                skills_json = [
                    {
                        "id": f"imp-{candidate_id}-{idx + 1}",
                        "name": skill_name.strip(),
                        "category": "Imported",
                        "proficiency": 3,
                    }
                    for idx, skill_name in enumerate(str(entry["skills"]).split("|"))
                    if skill_name.strip()
                ]
                if not skills_json:
                    skipped += 1
                    continue

                if existing:
                    existing.name = str(entry["name"])
                    existing.email = str(entry["email"])
                    existing.role = str(entry["role"])
                    existing.department = str(entry["department"])
                    existing.experience_years = int(entry["experienceYears"])
                    existing.availability = str(entry["availability"])
                    existing.utilization_pct = int(entry["utilizationPct"])
                    existing.interview_score = int(entry["interviewScore"]) if entry["interviewScore"] is not None else None
                    existing.interview_result = str(entry["interviewResult"]) if entry["interviewResult"] else None
                    existing.skills_json = skills_json
                    updated += 1
                else:
                    session.add(
                        EmployeeRow(
                            id=candidate_id,
                            name=str(entry["name"]),
                            email=str(entry["email"]),
                            role=str(entry["role"]),
                            department=str(entry["department"]),
                            experience_years=int(entry["experienceYears"]),
                            availability=str(entry["availability"]),
                            utilization_pct=int(entry["utilizationPct"]),
                            bench_since=entry["benchSince"],
                            interview_score=int(entry["interviewScore"]) if entry["interviewScore"] is not None else None,
                            interview_result=str(entry["interviewResult"]) if entry["interviewResult"] else None,
                            avatar=None,
                            skills_json=skills_json,
                        )
                    )
                    imported += 1

            self._record_import_event(
                session=session,
                dataset_key="candidate_profiles",
                source_file=source_file,
                imported=imported,
                updated=updated,
                skipped=skipped,
            )
            session.commit()
        return {"imported": imported, "updated": updated, "skipped": skipped, "sourceFile": source_file, "dataset": "candidate_profiles"}

    def import_employees(self, rows: list[dict[str, object]], source_file: str) -> dict[str, int | str]:
        self.initialize()
        imported = 0
        updated = 0
        skipped = 0
        with SessionLocal() as session:
            for entry in rows:
                employee_id = str(entry["id"])
                existing = session.scalar(select(EmployeeRow).where(EmployeeRow.id == employee_id))
                skills_json = [
                    {
                        "id": f"emp-{employee_id}-{index + 1}",
                        "name": skill_name.strip(),
                        "category": "Imported",
                        "proficiency": 3,
                    }
                    for index, skill_name in enumerate(str(entry["skills"]).split("|"))
                    if skill_name.strip()
                ]
                if not skills_json:
                    skipped += 1
                    continue
                if existing:
                    existing.name = str(entry["name"])
                    existing.email = str(entry["email"])
                    existing.role = str(entry["role"])
                    existing.department = str(entry["department"])
                    existing.experience_years = int(entry["experienceYears"])
                    existing.availability = str(entry["availability"])
                    existing.utilization_pct = int(entry["utilizationPct"])
                    existing.bench_since = entry["benchSince"]
                    existing.skills_json = skills_json
                    updated += 1
                else:
                    session.add(
                        EmployeeRow(
                            id=employee_id,
                            name=str(entry["name"]),
                            email=str(entry["email"]),
                            role=str(entry["role"]),
                            department=str(entry["department"]),
                            experience_years=int(entry["experienceYears"]),
                            availability=str(entry["availability"]),
                            utilization_pct=int(entry["utilizationPct"]),
                            bench_since=entry["benchSince"],
                            interview_score=None,
                            interview_result=None,
                            avatar=None,
                            skills_json=skills_json,
                        )
                    )
                    imported += 1
            self._record_import_event(
                session=session,
                dataset_key="employees",
                source_file=source_file,
                imported=imported,
                updated=updated,
                skipped=skipped,
            )
            session.commit()
        return {"imported": imported, "updated": updated, "skipped": skipped, "sourceFile": source_file, "dataset": "employees"}

    def import_project_needs(self, rows: list[dict[str, object]], source_file: str) -> dict[str, int | str]:
        self.initialize()
        imported = 0
        updated = 0
        skipped = 0
        with SessionLocal() as session:
            for entry in rows:
                need_id = str(entry["id"])
                existing = session.scalar(select(ProjectNeedRow).where(ProjectNeedRow.id == need_id))
                required_skills = [skill.strip() for skill in str(entry["requiredSkills"]).split("|") if skill.strip()]
                if not required_skills:
                    skipped += 1
                    continue
                if existing:
                    existing.project_id = str(entry["projectId"])
                    existing.project_name = str(entry["projectName"])
                    existing.role_title = str(entry["roleTitle"])
                    existing.open_slots = int(entry["openSlots"])
                    existing.required_skills_json = required_skills
                    existing.start_date = entry["startDate"]
                    existing.status = str(entry["status"])
                    existing.priority = str(entry["priority"])
                    updated += 1
                else:
                    session.add(
                        ProjectNeedRow(
                            id=need_id,
                            project_id=str(entry["projectId"]),
                            project_name=str(entry["projectName"]),
                            role_title=str(entry["roleTitle"]),
                            open_slots=int(entry["openSlots"]),
                            required_skills_json=required_skills,
                            start_date=entry["startDate"],
                            status=str(entry["status"]),
                            priority=str(entry["priority"]),
                        )
                    )
                    imported += 1
            self._record_import_event(
                session=session,
                dataset_key="project_needs",
                source_file=source_file,
                imported=imported,
                updated=updated,
                skipped=skipped,
            )
            session.commit()
        return {"imported": imported, "updated": updated, "skipped": skipped, "sourceFile": source_file, "dataset": "project_needs"}

    def import_allocation_history(self, rows: list[dict[str, object]], source_file: str) -> dict[str, int | str]:
        self.initialize()
        imported = 0
        updated = 0
        skipped = 0
        with SessionLocal() as session:
            for entry in rows:
                allocation_id = str(entry["id"])
                existing = session.scalar(select(AllocationHistoryRow).where(AllocationHistoryRow.id == allocation_id))
                if existing:
                    existing.employee_id = str(entry["employeeId"])
                    existing.employee_name = str(entry["employeeName"])
                    existing.project_id = str(entry["projectId"])
                    existing.project_name = str(entry["projectName"])
                    existing.role = str(entry["role"])
                    existing.start_date = entry["startDate"]
                    existing.end_date = entry["endDate"]
                    existing.outcome = str(entry["outcome"])
                    existing.notes = entry["notes"]
                    updated += 1
                else:
                    session.add(
                        AllocationHistoryRow(
                            id=allocation_id,
                            employee_id=str(entry["employeeId"]),
                            employee_name=str(entry["employeeName"]),
                            project_id=str(entry["projectId"]),
                            project_name=str(entry["projectName"]),
                            role=str(entry["role"]),
                            start_date=entry["startDate"],
                            end_date=entry["endDate"],
                            outcome=str(entry["outcome"]),
                            notes=entry["notes"],
                        )
                    )
                    imported += 1
            self._record_import_event(
                session=session,
                dataset_key="allocation_history",
                source_file=source_file,
                imported=imported,
                updated=updated,
                skipped=skipped,
            )
            session.commit()
        return {
            "imported": imported,
            "updated": updated,
            "skipped": skipped,
            "sourceFile": source_file,
            "dataset": "allocation_history",
        }

    def get_dataset_summaries(self) -> list[dict[str, object]]:
        self.initialize()
        with SessionLocal() as session:
            employee_count = session.scalar(select(func.count()).select_from(EmployeeRow))
            need_count = session.scalar(select(func.count()).select_from(ProjectNeedRow))
            allocation_count = session.scalar(select(func.count()).select_from(AllocationHistoryRow))
            import_rows = session.scalars(
                select(ImportEventRow).order_by(ImportEventRow.created_at.desc())
            ).all()
        today = date.today().isoformat()
        latest_by_dataset: dict[str, str] = {}
        for row in import_rows:
            if row.dataset_key not in latest_by_dataset:
                latest_by_dataset[row.dataset_key] = row.created_at.date().isoformat()
        return [
            {
                "key": "employees",
                "label": "Employee Data",
                "rows": int(employee_count or 0),
                "lastUpdated": latest_by_dataset.get("employees", today),
                "importEnabled": True,
            },
            {
                "key": "project_needs",
                "label": "Projects Data",
                "rows": int(need_count or 0),
                "lastUpdated": latest_by_dataset.get("project_needs", today),
                "importEnabled": True,
            },
            {
                "key": "allocation_history",
                "label": "Allocations History",
                "rows": int(allocation_count or 0),
                "lastUpdated": latest_by_dataset.get("allocation_history", today),
                "importEnabled": True,
            },
            {
                "key": "candidate_profiles",
                "label": "Candidate Profiles + Interview Scores",
                "rows": int(employee_count or 0),
                "lastUpdated": latest_by_dataset.get("candidate_profiles", today),
                "importEnabled": True,
            },
        ]

    def export_candidates_csv(self) -> str:
        self.initialize()
        employees = self.list_employees()
        lines = [
            "candidate_id,name,email,role,department,experience_years,skills,availability,utilization_pct,interview_score,interview_result,bench_since"
        ]
        for employee in employees:
            skill_names = "|".join(skill.skill.name for skill in employee.skills)
            interview_score = "" if employee.interviewScore is None else str(employee.interviewScore)
            interview_result = "" if employee.interviewResult is None else employee.interviewResult
            bench_since = "" if employee.benchSince is None else employee.benchSince.isoformat()
            safe_name = employee.name.replace(",", " ")
            safe_role = employee.role.replace(",", " ")
            safe_department = employee.department.replace(",", " ")
            safe_result = interview_result.replace(",", " ")
            lines.append(
                f"{employee.id},{safe_name},{employee.email},{safe_role},{safe_department},{employee.experienceYears},{skill_names},"
                f"{employee.availability},{employee.utilizationPct},{interview_score},{safe_result},{bench_since}"
            )
        return "\n".join(lines)

    def get_bench_department_counts(self) -> dict[str, int]:
        counts: dict[str, int] = defaultdict(int)
        for employee in self.list_employees():
            if employee.availability == "available":
                counts[employee.department] += 1
        return dict(counts)

    def create_allocation(
        self, *, employee_id: str, project_need_id: str, role: str, start_date: date, notes: str | None
    ) -> AllocationHistory:
        self.initialize()
        with SessionLocal() as session:
            employee = session.scalar(select(EmployeeRow).where(EmployeeRow.id == employee_id))
            need = session.scalar(select(ProjectNeedRow).where(ProjectNeedRow.id == project_need_id))
            if not employee or not need:
                raise ValueError("Employee or project need not found")

            allocation_row = AllocationHistoryRow(
                id=f"alloc-{uuid4()}",
                employee_id=employee.id,
                employee_name=employee.name,
                project_id=need.project_id,
                project_name=need.project_name,
                role=role,
                start_date=start_date,
                end_date=None,
                outcome="ongoing",
                notes=notes,
            )
            session.add(allocation_row)

            employee.availability = "allocated"
            employee.utilization_pct = min(100, max(employee.utilization_pct, 70))
            employee.bench_since = None

            if need.open_slots > 1:
                need.open_slots -= 1
            else:
                need.open_slots = 0
                need.status = "filled"

            session.commit()
            session.refresh(allocation_row)
            return _allocation_from_row(allocation_row)


store = DatabaseStore()

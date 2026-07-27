from collections import defaultdict
from datetime import UTC, date, datetime
from uuid import uuid4

from sqlalchemy import JSON, Column, Date, DateTime, ForeignKey, Integer, String, Text, func, select
from sqlalchemy.orm import DeclarativeBase, Session

from .db import SessionLocal, engine
from .models import AllocationHistory, Employee, EmployeeSkill, ProjectNeed, Skill, User


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
        self._seeded = True

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

            session.add(
                ImportEventRow(
                    id=f"imp-{uuid4()}",
                    dataset_key="candidate_profiles",
                    filename=source_file,
                    imported_rows=imported,
                    updated_rows=updated,
                    skipped_rows=skipped,
                    created_at=datetime.now(UTC),
                )
            )
            session.commit()
        return {"imported": imported, "updated": updated, "skipped": skipped, "sourceFile": source_file}

    def get_dataset_summaries(self) -> list[dict[str, object]]:
        self.initialize()
        with SessionLocal() as session:
            employee_count = session.scalar(select(func.count()).select_from(EmployeeRow))
            need_count = session.scalar(select(func.count()).select_from(ProjectNeedRow))
            allocation_count = session.scalar(select(func.count()).select_from(AllocationHistoryRow))
            latest_import = session.scalar(
                select(ImportEventRow).where(ImportEventRow.dataset_key == "candidate_profiles").order_by(ImportEventRow.created_at.desc())
            )
        today = date.today().isoformat()
        import_updated = latest_import.created_at.date().isoformat() if latest_import else today
        return [
            {"key": "employees", "label": "Employee Data", "rows": int(employee_count or 0), "lastUpdated": today, "importEnabled": False},
            {"key": "project_needs", "label": "Projects Data", "rows": int(need_count or 0), "lastUpdated": today, "importEnabled": False},
            {"key": "allocation_history", "label": "Allocations History", "rows": int(allocation_count or 0), "lastUpdated": today, "importEnabled": False},
            {
                "key": "candidate_profiles",
                "label": "Candidate Profiles + Interview Scores",
                "rows": int(employee_count or 0),
                "lastUpdated": import_updated,
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

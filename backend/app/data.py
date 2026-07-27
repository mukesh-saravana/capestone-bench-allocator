from __future__ import annotations

from collections import defaultdict
from datetime import date
from uuid import uuid4

from .models import AllocationHistory, Employee, EmployeeSkill, Project, ProjectNeed, Skill, User


class InMemoryStore:
    def __init__(self) -> None:
        self.users: dict[str, User] = {
            "manager@company.com": User(
                id="usr-001",
                name="Demo Manager",
                email="manager@company.com",
                role="resource_manager",
            )
        }
        self.tokens: dict[str, str] = {}

        self.employees: dict[str, Employee] = {
            "emp-001": Employee(
                id="emp-001",
                name="John Doe",
                email="john.doe@company.com",
                role="Senior Engineer",
                department="Frontend",
                experienceYears=6,
                availability="available",
                utilizationPct=0,
                benchSince=date.fromisoformat("2026-07-01"),
                skills=[
                    EmployeeSkill(skill=Skill(id="s1", name="React", category="Frontend"), proficiency=5),
                    EmployeeSkill(skill=Skill(id="s2", name="TypeScript", category="Frontend"), proficiency=5),
                    EmployeeSkill(skill=Skill(id="s3", name="AWS", category="Cloud"), proficiency=4),
                    EmployeeSkill(skill=Skill(id="s4", name="Python", category="Backend"), proficiency=3),
                ],
            ),
            "emp-002": Employee(
                id="emp-002",
                name="Jane Smith",
                email="jane.smith@company.com",
                role="Engineer",
                department="Backend",
                experienceYears=4,
                availability="available",
                utilizationPct=20,
                benchSince=date.fromisoformat("2026-07-10"),
                skills=[
                    EmployeeSkill(skill=Skill(id="s5", name="React", category="Frontend"), proficiency=4),
                    EmployeeSkill(skill=Skill(id="s6", name="Node.js", category="Backend"), proficiency=5),
                    EmployeeSkill(skill=Skill(id="s3", name="AWS", category="Cloud"), proficiency=4),
                ],
            ),
            "emp-003": Employee(
                id="emp-003",
                name="Bob Johnson",
                email="bob.j@company.com",
                role="Senior Engineer",
                department="Platform",
                experienceYears=5,
                availability="available",
                utilizationPct=10,
                benchSince=date.fromisoformat("2026-07-05"),
                skills=[
                    EmployeeSkill(skill=Skill(id="s1", name="React", category="Frontend"), proficiency=4),
                    EmployeeSkill(skill=Skill(id="s7", name="Docker", category="DevOps"), proficiency=5),
                    EmployeeSkill(skill=Skill(id="s8", name="Kubernetes", category="DevOps"), proficiency=4),
                ],
            ),
            "emp-004": Employee(
                id="emp-004",
                name="Alice Chen",
                email="alice.chen@company.com",
                role="Tech Lead",
                department="Frontend",
                experienceYears=8,
                availability="allocated",
                utilizationPct=100,
                skills=[
                    EmployeeSkill(skill=Skill(id="s1", name="React", category="Frontend"), proficiency=5),
                    EmployeeSkill(skill=Skill(id="s2", name="TypeScript", category="Frontend"), proficiency=5),
                    EmployeeSkill(skill=Skill(id="s9", name="Angular", category="Frontend"), proficiency=4),
                ],
            ),
            "emp-005": Employee(
                id="emp-005",
                name="Carlos Rivera",
                email="carlos.r@company.com",
                role="Engineer",
                department="Data",
                experienceYears=3,
                availability="allocated",
                utilizationPct=80,
                skills=[
                    EmployeeSkill(skill=Skill(id="s10", name="Python", category="Backend"), proficiency=5),
                    EmployeeSkill(skill=Skill(id="s11", name="PostgreSQL", category="Data"), proficiency=4),
                    EmployeeSkill(skill=Skill(id="s12", name="Spark", category="Data"), proficiency=3),
                ],
            ),
            "emp-006": Employee(
                id="emp-006",
                name="Priya Nair",
                email="priya.n@company.com",
                role="QA Engineer",
                department="Platform",
                experienceYears=4,
                availability="available",
                utilizationPct=0,
                benchSince=date.fromisoformat("2026-07-15"),
                skills=[
                    EmployeeSkill(skill=Skill(id="s13", name="Selenium", category="QA"), proficiency=5),
                    EmployeeSkill(skill=Skill(id="s14", name="Cypress", category="QA"), proficiency=4),
                ],
            ),
            "emp-007": Employee(
                id="emp-007",
                name="Sam Wilson",
                email="sam.w@company.com",
                role="Engineer",
                department="Backend",
                experienceYears=5,
                availability="allocated",
                utilizationPct=100,
                skills=[
                    EmployeeSkill(skill=Skill(id="s15", name="Java", category="Backend"), proficiency=5),
                    EmployeeSkill(skill=Skill(id="s16", name="Spring Boot", category="Backend"), proficiency=5),
                ],
            ),
            "emp-008": Employee(
                id="emp-008",
                name="Nina Patel",
                email="nina.p@company.com",
                role="Engineer",
                department="Frontend",
                experienceYears=3,
                availability="on_leave",
                utilizationPct=0,
                skills=[
                    EmployeeSkill(skill=Skill(id="s1", name="React", category="Frontend"), proficiency=3),
                    EmployeeSkill(skill=Skill(id="s2", name="TypeScript", category="Frontend"), proficiency=3),
                ],
            ),
        }

        self.projects: dict[str, Project] = {
            "proj-001": Project(id="proj-001", name="Alpha Commerce Platform", status="active", priority="high", startDate=date.fromisoformat("2026-06-01")),
            "proj-002": Project(id="proj-002", name="Beta Analytics Dashboard", status="active", priority="medium", startDate=date.fromisoformat("2026-05-15")),
            "proj-003": Project(id="proj-003", name="Gamma Mobile App", status="upcoming", priority="high", startDate=date.fromisoformat("2026-08-01")),
            "proj-004": Project(id="proj-004", name="Delta DevOps Pipeline", status="active", priority="low", startDate=date.fromisoformat("2026-04-01")),
            "proj-005": Project(
                id="proj-005",
                name="Epsilon Data Lake",
                status="completed",
                priority="medium",
                endDate=date.fromisoformat("2026-06-30"),
            ),
        }

        self.project_needs: dict[str, ProjectNeed] = {
            "need-001": ProjectNeed(
                id="need-001",
                projectId="proj-001",
                projectName="Alpha Commerce Platform",
                roleTitle="Frontend Lead",
                openSlots=1,
                requiredSkills=["React", "TypeScript"],
                startDate=date.fromisoformat("2026-08-01"),
                status="open",
                priority="high",
            ),
            "need-002": ProjectNeed(
                id="need-002",
                projectId="proj-003",
                projectName="Gamma Mobile App",
                roleTitle="Full-Stack Engineer",
                openSlots=2,
                requiredSkills=["React", "Node.js", "AWS"],
                startDate=date.fromisoformat("2026-08-01"),
                status="open",
                priority="high",
            ),
            "need-003": ProjectNeed(
                id="need-003",
                projectId="proj-004",
                projectName="Delta DevOps Pipeline",
                roleTitle="DevOps Engineer",
                openSlots=1,
                requiredSkills=["Docker", "Kubernetes"],
                startDate=date.fromisoformat("2026-07-20"),
                status="open",
                priority="low",
            ),
        }

        self.allocations: list[AllocationHistory] = [
            AllocationHistory(
                id="alloc-001",
                employeeId="emp-004",
                employeeName="Alice Chen",
                projectId="proj-001",
                projectName="Alpha Commerce Platform",
                role="Tech Lead",
                startDate=date.fromisoformat("2026-06-01"),
                outcome="ongoing",
            ),
            AllocationHistory(
                id="alloc-002",
                employeeId="emp-007",
                employeeName="Sam Wilson",
                projectId="proj-002",
                projectName="Beta Analytics Dashboard",
                role="Senior Engineer",
                startDate=date.fromisoformat("2026-05-15"),
                outcome="ongoing",
            ),
            AllocationHistory(
                id="alloc-003",
                employeeId="emp-001",
                employeeName="John Doe",
                projectId="proj-005",
                projectName="Epsilon Data Lake",
                role="Frontend Engineer",
                startDate=date.fromisoformat("2026-02-01"),
                endDate=date.fromisoformat("2026-06-30"),
                outcome="completed",
            ),
            AllocationHistory(
                id="alloc-004",
                employeeId="emp-003",
                employeeName="Bob Johnson",
                projectId="proj-005",
                projectName="Epsilon Data Lake",
                role="DevOps Engineer",
                startDate=date.fromisoformat("2026-03-01"),
                endDate=date.fromisoformat("2026-06-30"),
                outcome="completed",
            ),
        ]

    def issue_token(self, email: str) -> str:
        token = f"mock-jwt-{uuid4()}"
        self.tokens[token] = email
        return token

    def revoke_token(self, token: str) -> None:
        self.tokens.pop(token, None)

    def get_user_by_token(self, token: str | None) -> User | None:
        if not token:
            return None
        email = self.tokens.get(token)
        if not email:
            return None
        return self.users.get(email)

    def get_bench_department_counts(self) -> dict[str, int]:
        counts: dict[str, int] = defaultdict(int)
        for employee in self.employees.values():
            if employee.availability == "available":
                counts[employee.department] += 1
        return dict(counts)

    def create_allocation(
        self, *, employee_id: str, project_need_id: str, role: str, start_date: date, notes: str | None
    ) -> AllocationHistory:
        employee = self.employees[employee_id]
        need = self.project_needs[project_need_id]
        allocation = AllocationHistory(
            id=f"alloc-{uuid4()}",
            employeeId=employee.id,
            employeeName=employee.name,
            projectId=need.projectId,
            projectName=need.projectName,
            role=role,
            startDate=start_date,
            outcome="ongoing",
            notes=notes,
        )
        self.allocations.insert(0, allocation)

        employee.availability = "allocated"
        employee.utilizationPct = min(100, max(employee.utilizationPct, 70))
        if employee.benchSince:
            employee.benchSince = None

        if need.openSlots > 1:
            need.openSlots -= 1
        else:
            need.openSlots = 0
            need.status = "filled"

        return allocation


store = InMemoryStore()

# Capstone Bench Allocator

AI-powered resource allocation and bench management system with RAG-assisted recommendations and an analytics dashboard.

## What This Project Solves

Teams often struggle to:
- Match available engineers to project needs quickly
- Reduce bench time without manual effort
- Make allocation decisions using fragmented data

This project provides a decision-support assistant that uses relevant historical and skills data to suggest suitable allocations.

## Core Solution

The solution has two main parts:
- AI Assistant (RAG-based): answers staffing questions and recommends candidate resources
- Analytics Dashboard (SQL-based): shows utilization, bench trends, and allocation insights

## Key Features

- Skill-based resource recommendations
- Retrieval-augmented responses grounded in internal data
- Historical allocation context for better matching
- Bench and utilization analytics for managers
- Simple chat-style interaction for allocation queries

## MVP Data Inputs

- Employee data
- Project data
- Historical allocation data

## Implementation Phases

1. Data preparation
2. Build RAG pipeline
3. Retrieval and ranking
4. Recommendation logic
5. Dashboard development

## Repository Structure

- `project-starters/`: source reference PDFs for project brief and guidelines
- `docs/scope.md`: clear boundaries of what is included in MVP
- `docs/technical-design.md`: selected architecture pattern, stack, and system design
- `README.md`: project overview and approach

## Success Criteria

- Recommendations are relevant to project needs and skills
- Allocation insights are easy to interpret from the dashboard
- Demo flow clearly shows business impact: better utilization and reduced bench time

## Suggested KPIs

- Recommendation relevance score (manual reviewer rating)
- Bench reduction trend over reporting periods
- Resource utilization improvement
- Time saved in staffing decisions

## High-Level Demo Flow

1. Upload or load employee, project, and allocation data
2. Ask staffing question in chat
3. Review top recommended candidates with reasoning
4. Validate metrics in the dashboard
5. Explain business impact using before/after comparison

## Current Status

This repository currently contains project starter documents and planning artifacts.
Application code can be added next in separate folders such as `data/`, `backend/`, `rag/`, and `dashboard/`.

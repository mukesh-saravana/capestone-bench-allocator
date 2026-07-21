# Scope

## Project Goal

Build an AI-assisted bench allocation system that helps managers identify suitable engineers for open project needs and monitor utilization through a dashboard.

## In Scope (MVP)

- Ingest and prepare three datasets:
  - Employee data
  - Project data
  - Historical allocation data
- Build a RAG pipeline for staffing-related Q&A
- Retrieve and rank candidate resources based on skills and context
- Provide recommendation responses through a chat-style interface
- Build dashboard views for:
  - Bench status
  - Utilization trends
  - Allocation summaries
- Demonstrate end-to-end flow from query to recommendation to analytics

## Out of Scope (MVP)

- Fully automated final allocation without human approval
- Real-time integration with live HRMS/ERP systems
- Advanced forecasting and long-horizon capacity planning
- Multi-tenant enterprise security and fine-grained RBAC
- Production-grade MLOps, continuous retraining, and model governance

## Assumptions

- Input data is available in clean tabular format or can be cleaned during preparation
- Recommendation quality is evaluated for relevance, not perfect optimization
- The first release is a demo-ready MVP, not a full production rollout

## Primary Users

- Resource managers
- Delivery managers
- Project leads

## Acceptance Criteria (MVP)

- User can ask a staffing query and receive ranked recommendations
- Recommendations are grounded in available employee/project/history data
- Dashboard clearly shows bench and utilization metrics
- Demo can run end-to-end without manual technical intervention

## Non-Functional Expectations

- Reliable responses for common staffing scenarios
- Explainable recommendations (show why a candidate was suggested)
- Clean and simple user experience for non-technical stakeholders
- Repeatable demo setup using documented sample data

## Risks and Mitigation

- Data quality risk: Missing or inconsistent skill tags
  - Mitigation: Add data validation and normalization during ingestion
- Hallucination risk in assistant responses
  - Mitigation: Restrict answers to retrieved evidence and show source snippets
- Low stakeholder trust in AI suggestions
  - Mitigation: Provide transparent ranking factors and human approval step

## Suggested Success Metrics

- Top-N recommendation relevance rate
- Bench reduction percentage over baseline
- Utilization increase over baseline
- Time-to-shortlist per staffing request

## MVP Deliverables

- Working RAG assistant for allocation support
- Analytics dashboard with core bench/utilization metrics
- Clear demo script showing business value and workflow

## Post-MVP Expansion

- Integrate with live enterprise systems
- Add forecasting and capacity planning models
- Introduce role-based access controls and governance
- Add evaluation pipelines for continuous quality tracking
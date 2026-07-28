# RAG Overview

## What is RAG?

RAG means **Retrieval-Augmented Generation**.

It is a pattern where the app:
1. **retrieves** relevant information from trusted data,
2. then uses that context to **generate** a grounded answer.

Instead of asking the model to guess from memory, RAG gives it the most relevant project, employee, and allocation facts first.

## Why RAG is needed in this project

Our app is a staffing and bench-allocation assistant. The answers need to reflect:

- current employee skills
- utilization and bench status
- open project needs
- past allocation history

Without RAG, the assistant would only give generic responses. With RAG, it can answer using the project’s real data and stay useful as the dataset changes.

## How RAG is implemented here

We implemented a **hybrid RAG** flow in the backend:

- **Local mode**: lexical/token matching over in-memory chunks
- **Cloud mode**: OpenAI embeddings for semantic retrieval
- **Hybrid mode**: cloud when configured, otherwise local

### Data sources used

The retrieval index is built from:

- employees
- project needs
- allocation history

### Backend flow

1. The backend builds retrievable chunks from store data.
2. A query comes in through `POST /api/chat/query`.
3. RAG finds the most relevant chunks.
4. The recommendation engine ranks candidates.
5. The response returns:
   - answer text
   - recommendations
   - evidence snippets
   - citations
   - retrieval mode

## Why this approach was chosen

This design fits the current project because it:

- keeps answers grounded in live staffing data
- supports both local development and cloud production
- avoids hard dependency on a vector DB for the MVP
- makes the chat assistant easier to trust

## Operational support

We also added admin controls:

- `GET /api/rag/status`
- `POST /api/rag/reindex`

And the UI shows:

- current RAG mode
- retrieval mode
- index counts
- cloud configuration status

## In short

RAG is needed here so the assistant can give staffing recommendations based on **our actual project data**, not just generic LLM output.

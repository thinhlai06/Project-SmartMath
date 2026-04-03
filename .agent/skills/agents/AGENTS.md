# AI AGENT & CODING GUIDELINES
**Project:** Smart-MathAI (Hệ thống gia sư toán AI - MVP Project)

---

## Project Mission
To build an assistive, MVP-first educational platform for Vietnamese primary school mathematics (Grades 1-3) following the GDPT 2018 curriculum. The platform is designed to empower Teachers to create, manage, and grade worksheets efficiently, while giving Parents tools to track progress and gain pedagogical guidance for their children. AI is an assistive tool and never an autonomous actor.

## Context
Smart-MathAI is a strict Role-Based platform comprising exactly two user roles:
1. **Teacher**: Has full control over content. Can generate drafts using AI, configure difficulty, and is the *only* role that can Approve and Publish worksheets.
2. **Parent**: Has a supportive role. Joins classes via code, views published content, tracks progress, and downloads materials. Parents cannot interact with AI or generate new content.

## Architecture Overview
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, Shadcn/UI, Recharts.
- **Backend API**: Python 3.10+, FastAPI (Asynchronous), SQLAlchemy (ORM), SQLite/PostgreSQL.
- **AI Integration**: Complete isolation of Business Logic (Core MVP) and AI Logic (`app/services/ai`).
- **AI/Vector DB Tooling**: Ollama (Local open-source models), LangChain, ChromaDB.

## Non-Negotiable Rules
- **Domain Constraint**: Mathematics ONLY. No other subjects.
- **Grade Limit**: Vietnamese Primary School Grades 1-3 ONLY.
- **Language**: Output MUST be in simple Vietnamese and pedagogically correct for 6-8 year olds.
- **Safety**: Do NOT build functions that allow AI to solve homework directly for students/parents.
- **Control**: ALL AI-generated outputs (Questions, Explanations, OCR Grading) MUST begin in a `Draft` or `Pending` state and MUST be verified and approved by a Teacher. No automatic publishing.

## Coding Workflow
- Maintain the "MVP-first" mindset: ensure all core management functionalities are stable before calling AI services.
- Separation of Concerns: Routing layer only routes data; validation rules belong in Pydantic schemas; all core business and AI integration logic belong in the `services` layer.
- Ensure proper logging of AI inputs/outputs, model versions, and OCR confidence scores. NEVER log sensitive student data (PII) or unhashed image content.

## Backend Rules
- Use FastAPI for defining asynchronous RESTful API endpoints.
- Apply "Fat Services/Models, Skinny Routers".
- Define distinct SQLAlchemy models for persistent database storage and Pydantic models for data validation and request/response serializing.
- Build clean interfaces to handle AI model requests to easily swap models if necessary.

## Frontend Rules
- Prioritize clean and predictable UI/UX design suitable for educational platforms. Responsive layout.
- Strictly adhere to Tailwind CSS v4 utility classes for styling.
- Use Shadcn/UI components to maintain consistency and speed up development.
- Build distinct dashboards for the Teacher (full management) and the Parent (view and tracking).

## AI / RAG Rules
If an AI feature is required, ONLY use the following three designated models:
1. **`qwen3:1.7b`**: Used for generating Math questions and explaining solutions step-by-step (CPA Method). Output is strictly Vietnamese, Grade 1-3 level.
2. **`keepitreal/vietnamese-sbert`**: Used solely for generating Embeddings to query the ChromaDB Vector database (RAG). DO NOT use for text generation. This grounds the AI purely in textbook (SGK/SGV) context.
3. **`glm-ocr:latest`**: Used to extract handwritten text from images. The OCR logic does NOT evaluate correct/incorrect; its output is validated against expected text via rule-based logic or AI. A Confidence Threshold must be defined, and Teacher override is required.

## Allowed Changes vs Forbidden Changes
- **Allowed**: Extending teacher dashboards, optimizing the AI service layer, implementing additional RAG controls, adding OCR overrides, refactoring internal API responses.
- **Forbidden**: Granting Parents AI chat access to solve homework, implementing AI logic that auto-publishes without review, adding support for higher grades (Grade 4+), bypassing the role-based auth, changing the core language/framework.

## Definition of Done
- The feature is fully functional and tested both in isolation and in integration with the MVP.
- Any AI interactions are isolated in the `app/services/ai` layer and do not block core Business Logic.
- Teacher-approval mechanisms are strictly enforced for any generated content.
- Code is well-structured, statically typed where possible, gracefully handles errors, and adheres to the Non-Negotiable Rules.

## When Agent Is Unsure
- Look for the safer, simpler alternative.
- Ask for clarification or propose a plan via `notify_user` instead of writing speculative code.
- If unsure whether a feature belongs in Grades 1-3 math, **DO NOT implement it**.
- Leave a clear `TODO` comment detailing what needs clarification.

## Priority Order
1. Strict adherence to Domain Constraints (Math, Grades 1-3 only).
2. Enforcement of Role-Based Security and Privacy.
3. MVP Feature Stability and Teacher Control functionality.
4. AI Curriculum Grounding (Retrieval Accuracy).
5. Frontend UI/UX and Code DRY-ness.

## Philosophy
Think like an education platform engineer. Prioritize clarity over cleverness. Prefer explicit logic over magic. Respect educational boundaries. You are building *Smart-MathAI* – a controlled educational system, not a generic chatbot. AI serves to empower the Teacher’s workflow, never to replace human supervision or automatically solve homework.

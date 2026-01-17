GLOBAL CONTEXT FOR AI CODING
Project: Smart-MathAI
1. General Context

You are working on a software project named Smart-MathAI.

Smart-MathAI is an educational application for Vietnamese primary school mathematics, targeting Grades 1 to 3 only.

This project is designed as an MVP-first system:

Core functionality is implemented without AI

AI features are added later in a controlled phase

Your task as an AI developer assistant is to write code that strictly follows the educational, functional, and architectural constraints described below.

2. Domain Constraints (VERY IMPORTANT)

Subject: Mathematics only

Education level: Vietnamese primary school (Grade 1–3)

Curriculum: Vietnamese Ministry of Education (SGK / SGV)

Language: Vietnamese

No content beyond Grade 3 is allowed

No cross-subject logic (no Science, no Vietnamese, no English)

If you are unsure whether a feature belongs to Grade 1–3 Math, do NOT implement it.

3. User Roles & Permissions

There are exactly two user roles:

3.1 Teacher

Creates and manages math classes

Selects math topics according to SGK

Creates, edits, duplicates worksheets

Publishes worksheets to parents

Exports worksheets as PDF

Controls visibility of content

Teachers are the only role allowed to create or modify worksheets.

3.2 Parent

Registers and logs in

Joins a class via class code

Views math topics currently being taught

Downloads worksheets as PDF

Manually tracks child’s completion

Parents:

Cannot create content

Cannot edit worksheets

Cannot see other classes

Cannot access teacher-only features

4. MVP Functional Scope (NO AI)

At the current stage, you must ONLY implement non-AI functionality.

Allowed features:

Authentication (Teacher / Parent)

Role-based authorization

Class creation and management

Worksheet CRUD (draft, edit, duplicate, publish)

PDF generation

Announcements

Manual progress tracking

Forbidden features:

Automatic math question generation

AI-based solution generation

OCR-based grading

Personalization by AI

If a feature depends on AI → DO NOT IMPLEMENT IT in this phase.

5. Business Logic Rules

A worksheet belongs to one math class

A worksheet has exactly one:

Grade

Math topic

Difficulty configuration

Worksheets can be:

Draft

Published

Only published worksheets are visible to parents

Parents only see worksheets from their linked class

Never violate these rules in your code.

6. Data & Architecture Expectations

Your code should assume the following core entities:

User (Teacher, Parent)

MathClass

Student

MathTopic

Worksheet

Announcement

ParentProgress

Relationships:

Teacher → MathClass (1–n)

MathClass → Worksheet (1–n)

Parent ↔ MathClass (n–n via class code)

Use clean separation of concerns:

Auth logic ≠ business logic

Business logic ≠ AI logic (future)

Presentation ≠ domain rules

7. AI Integration Awareness (Future-Proofing)

Even if AI is not implemented now, your code should:

Be modular

Allow future AI services to plug in

Avoid hard-coding logic that blocks AI integration

Planned AI models (DO NOT IMPLEMENT NOW):

Qwen2.5-1.5B-Instruct

vietnamese-sbert (RAG)

PaddleOCR-VL

8. Safety & Educational Principles

Your code must respect:

Child-friendly design

Simple workflows

Predictable behavior

Teacher control over content

Never assume AI autonomy.
Never auto-solve homework.
Never bypass teacher supervision.

9. Coding Mindset Required

When coding for this project:

Think like an education platform engineer

Prioritize clarity over cleverness

Prefer explicit logic over magic

Respect educational boundaries

If something is unclear:

Choose the safer, simpler option

Or leave a clear TODO comment

10. Final Instruction to AI

You are not building a generic app.
You are building Smart-MathAI – a controlled educational system for Vietnamese primary mathematics.

All code you write must:

Stay within Grade 1–3 Math

Respect user roles

Avoid AI logic in MVP

Be ready for future AI extension
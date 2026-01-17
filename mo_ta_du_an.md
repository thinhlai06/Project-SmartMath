Project Name: Smart-MathAI
1. Project Purpose

Smart-MathAI is an educational software project focused exclusively on Vietnamese primary school mathematics (Grades 1–3).

The purpose of this project is:

To support primary math teachers in creating, managing, and distributing math worksheets aligned with the official Vietnamese curriculum.

To support parents in accompanying their children while practicing math at home.

To later integrate AI models in a controlled, safe, and pedagogically appropriate manner.

This file is written specifically so that any AI system (LLM, agent, assistant, or tool) can read it and fully understand:

The project domain

User roles

Functional scope

Constraints

Future AI strategy

2. Educational Scope

Subject: Mathematics only

Education level: Primary school (Grade 1, 2, 3)

Curriculum source: Vietnamese Ministry of Education (SGK, SGV)

Language: Vietnamese

Pedagogical constraints:

Simple wording

Step-by-step explanations

No advanced concepts beyond grade level

AI must never replace human teaching

3. User Roles (Actors)
3.1 Teacher (Primary Math Teacher)

Role description:

Teaches mathematics in grades 1–3

Is the content owner in the system

Responsibilities:

Create and manage math classes

Select math topics according to SGK

Configure worksheets by difficulty level (Easy / Medium / Hard)

Save drafts, duplicate, and publish worksheets

Export worksheets as PDF

Send announcements to parents

Constraints:

Only teachers can create or modify worksheets

Teachers control worksheet visibility

Teachers supervise all AI-generated content (future phase)

3.2 Parent

Role description:

Has a child studying mathematics in grades 1–3

Uses the system to support learning at home

Responsibilities:

Register and log in

Link to a math class using a class code

View math topics currently being taught

Download math worksheets (PDF)

Manually track whether the child has completed worksheets

Constraints:

Parents cannot create or edit worksheets

Parents cannot see data from other classes

Parents do not receive full solutions automatically

4. Non-AI Functional Scope (MVP Phase)
4.1 Authentication & Authorization

Role-based accounts (Teacher / Parent)

Secure login using email and password

Access control based on role

4.2 Class Management

Teachers can create math classes

Each class includes:

Grade (1–3)

Class code (used by parents to join)

4.3 Worksheet Management

Teachers can:

Create worksheets

Save drafts

Edit existing worksheets

Duplicate worksheets

Publish worksheets

Export worksheets to PDF

Worksheet metadata:

Grade

Math topic

Difficulty distribution

Creation date

Status (Draft / Published)

4.4 Parent Interaction

Parents can:

View class information

Download worksheet PDFs

Mark worksheets as “completed” manually (non-AI)

5. Business Process Flow
5.1 Teacher Flow

Login

Create or select a math class

Choose a math topic (SGK-based)

Configure worksheet difficulty

Save as draft or publish

Export worksheet as PDF

Notify parents

5.2 Parent Flow

Register or login

Enter class code

View current math topic

Download worksheet PDF

Track completion manually

6. Conceptual Data Model

Main entities:

User (Teacher, Parent)

MathClass

Student

MathTopic

Worksheet

Announcement

ParentProgress

Relationships:

Teacher 1..n MathClass

MathClass 1..n Worksheet

Parent n..n MathClass

Worksheet n..n Parent

7. AI Strategy (Future Phase)
7.1 Datasets

Vietnamese primary math textbooks (SGK, SGV)

hllj/vi_grade_school_math_mcq

hllj/vi_gsm8k

7.2 AI Models

Qwen2.5-1.5B-Instruct

Generate math questions

Provide step-by-step explanations

keepitreal/vietnamese-sbert

Embedding model for RAG (curriculum-based retrieval)

PaddlePaddle/PaddleOCR-VL

OCR for recognizing handwritten math answers

7.3 AI Integration Principles

AI assists teachers, not replaces them

AI output must strictly follow SGK curriculum

AI explanations must be age-appropriate

AI features are optional and controlled

8. AI Safety & Constraints

AI must NOT:

Automatically solve homework for parents

Generate content beyond Grade 3

Introduce advanced or incorrect math concepts

Operate without human (teacher) supervision

9. Intended Usage of This File

This file can be used as:

System prompt for LLMs

Project context for AI agents

Input for RAG pipelines

Reference for fine-tuning AI models

Any AI reading this file should:

Fully understand the Smart-MathAI project

Respect role boundaries

Generate responses aligned with Vietnamese primary math education
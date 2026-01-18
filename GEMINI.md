AI IMPLEMENTATION CONTEXT
Project: Smart-MathAI
1. Overall AI Context

You are integrating AI features into an existing educational system named Smart-MathAI.

All non-AI core features are already completed (authentication, class management, worksheet management, PDF export, parent interaction).

Your task is to safely and modularly integrate AI features using exactly three predefined AI models, while respecting educational constraints and role-based control.

AI in this project is assistive, not autonomous.

2. AI Integration Goals

AI is used to:

Support teachers in creating math content faster

Assist in explaining solutions in an age-appropriate way

Help grading math worksheets via images, under supervision

AI must never replace teacher authority and never directly solve homework for parents.

3. Target AI Models (STRICT)

You must use only the following models:

3.1 Qwen2.5-1.5B-Instruct

Purpose:

Generate math questions

Generate step-by-step math explanations

Usage Scope:

Grade 1–3 mathematics only

Content aligned with Vietnamese SGK

Input Context:

Grade

Math topic

Difficulty level

Question format (MCQ / short answer)

Output Constraints:

Simple Vietnamese

Clear steps

No advanced concepts

No shortcuts

IMPORTANT:

Qwen output is always a draft

Teachers must review before publishing

3.2 keepitreal/vietnamese-sbert

Purpose:

Generate embeddings for RAG (Retrieval-Augmented Generation)

Retrieve relevant SGK/SGV content

Usage Scope:

Curriculum grounding only

No free-form content generation

Pipeline Role:

Query → embedding

Vector search over SGK/SGV

Retrieved context → passed to Qwen

IMPORTANT:

This model does NOT generate text

It only supports relevance & accuracy

3.3 PaddlePaddle/PaddleOCR-VL

Purpose:

Recognize handwritten math answers from images

Usage Scope:

OCR only

No grading logic inside OCR

Pipeline Role:

Image input

OCR extraction

Structured text output

Pass to grading logic (rule-based or AI-assisted)

IMPORTANT:

OCR errors must be expected

Teacher confirmation is mandatory

4. AI Feature Modules
4.1 AI Worksheet Generation (Teacher Only)

Trigger:

Teacher clicks “Generate with AI”

Pipeline:

Retrieve SGK context using RAG (SBERT)

Inject context into Qwen prompt

Qwen generates draft questions

Teacher reviews, edits, approves

Rules:

AI output is never auto-published

Teacher has full edit control

4.2 AI Solution Explanation

Trigger:

Teacher requests solution explanation

Rules:

Step-by-step

No answer-only output

Must explain reasoning

Forbidden:

Showing full solution to parents by default

4.3 AI-assisted Grading via Image (Teacher-Controlled)

Trigger:

Teacher uploads student worksheet images

Pipeline:

PaddleOCR extracts answers

Answers normalized

Comparison with expected answers

Teacher reviews grading result

Rules:

OCR confidence threshold required

Teacher can override results

5. Role-Based AI Access Control
Role	AI Generation	AI Explanation	AI Grading
Teacher	✅ Allowed	✅ Allowed	✅ Allowed
Parent	❌ Forbidden	❌ Forbidden	❌ Forbidden

Parents may only see:

Teacher-approved worksheets

Teacher-approved feedback

6. AI Safety Rules (CRITICAL)

AI must NOT:

Solve homework directly for parents

Generate content beyond Grade 3

Provide shortcuts without explanation

Act without teacher supervision

If unsure → deny AI action.

7. Prompt Engineering Principles

All AI prompts must include:

Grade level

Math topic

Difficulty

Educational tone

Vietnamese language constraint

Example (abstract):

“You are generating math questions for Vietnamese Grade 2 students. Use simple language…”

8. System Architecture Expectations

AI logic must be:

Isolated in a dedicated AI service/module

Stateless where possible

Replaceable without touching core logic

Do NOT:

Mix AI logic into controllers

Hardcode prompts inside UI

9. Logging & Monitoring

Log:

Prompt input

Model used

Teacher approval status

OCR confidence

Never log:

Student personal data

Raw images without consent

10. Final Instruction to AI

You are implementing AI inside an educational system, not a chatbot.

Your priorities:

Accuracy over creativity

Teacher control over automation

Educational safety over convenience
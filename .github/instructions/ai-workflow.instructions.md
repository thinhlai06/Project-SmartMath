---
name: AI Workflow Rules
description: "Use when implementing OCR, RAG, or AI question generation. Keep AI output as draft, use approved models only, and isolate AI service logic."
applyTo: backend/app/services/ai/**/*.py
---

# AI Rules

- Chi dung model duoc duyet:
  - `qwen3:1.7b` cho question generation
  - `glm-ocr:latest` cho OCR
  - `vietnamese-sbert` cho RAG embeddings
- AI output luon la draft, can Teacher review
- Mock AI calls trong tests, khong goi model that
- Log toi thieu: prompt input, model, teacher approval status, ocr confidence
- Tach logic AI khoi API/router layer

# Smart-MathAI Backend

## Requirements

- Python 3.11+
- SQLite (included)

## Setup

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install and start Ollama (separate terminal)
# https://ollama.com/download
# Then pull approved text model once:
# ollama pull qwen2.5:3b
# Configure OLLAMA_CLOUD_API_KEY for OCR model gemma4:31b

# Run migrations
alembic upgrade head

# Seed data
python -m app.seed

# Run server
uvicorn app.main:app --reload --port 8000
```

## Ollama Runtime Notes

- Default Ollama API: `http://localhost:11434/api`
- Models used by backend:
	- Text generation: `qwen2.5:3b`
	- Vision OCR: `gemma4:31b` via Ollama Cloud
- Keep-alive policy is configurable through `OLLAMA_KEEP_ALIVE` (default `3m`).

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

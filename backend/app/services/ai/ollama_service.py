"""
Ollama Service - Wrapper for interacting with local Ollama API running Qwen2.5:1.5b.
"""
import requests
import subprocess
import time

OLLAMA_EXE = r"C:\Users\Admin\AppData\Local\Programs\Ollama\ollama.exe"
MODEL_NAME = "qwen2.5:1.5b"
API_BASE = "http://localhost:11434"


class OllamaService:
    @staticmethod
    def is_running() -> bool:
        """Check if Ollama server is running."""
        try:
            resp = requests.get(f"{API_BASE}/api/tags", timeout=2)
            return resp.status_code == 200
        except:
            return False

    @staticmethod
    def start_server():
        """Start Ollama server if not running."""
        if OllamaService.is_running():
            return True

        print("🚀 Starting Ollama server...")
        subprocess.Popen(
            [OLLAMA_EXE, "serve"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
        for _ in range(10):
            if OllamaService.is_running():
                print("✅ Ollama started!")
                return True
            time.sleep(1)
        return False

    @staticmethod
    def generate(prompt: str, system: str = None, temperature: float = 0.7) -> str:
        """Generate text using Ollama Qwen model."""
        if not OllamaService.is_running():
            if not OllamaService.start_server():
                raise Exception("Ollama server could not be started")

        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": temperature}
        }
        if system:
            payload["system"] = system

        try:
            resp = requests.post(f"{API_BASE}/api/generate", json=payload, timeout=120)
            resp.raise_for_status()
            return resp.json().get("response", "")
        except Exception as e:
            print(f"❌ Ollama Error: {e}")
            raise

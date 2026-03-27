import sys
sys.stdout.reconfigure(encoding='utf-8')
import json

from app.services.ai.question_generator import QuestionGenerator

def run():
    print("Testing the AI differentiation prompt...")
    generator = QuestionGenerator()
    try:
        res = generator.generate_differentiation_questions(
            topic="Phép cộng trong phạm vi 100", 
            grade=2, 
            objective="Thực hiện phép toán đố vui có lời văn",
            tiers=["foundation", "standard", "extension", "advanced"]
        )
        print("Success! Result:")
        print(json.dumps(res, indent=2, ensure_ascii=False))
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run()

if __name__ == "__main__":
    run()

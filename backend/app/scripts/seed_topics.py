"""
Seed script to populate math topics with learning standards
Run: python -m app.scripts.seed_topics
"""
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.math_topic import MathTopic

TOPICS = [
    # Grade 1
    {
        "topic_name": "Phép cộng trong phạm vi 20",
        "category": "Số học",
        "grade": 1,
        "learning_standards": [
            "Thực hiện được phép cộng không nhớ trong phạm vi 20",
            "Vận dụng phép cộng để giải quyết vấn đề thực tế đơn giản"
        ]
    },
    {
        "topic_name": "Phép trừ trong phạm vi 20",
        "category": "Số học",
        "grade": 1,
        "learning_standards": [
            "Thực hiện được phép trừ không nhớ trong phạm vi 20",
            "Vận dụng phép trừ để giải quyết vấn đề thực tế đơn giản"
        ]
    },
    {
        "topic_name": "Hình học cơ bản",
        "category": "Hình học",
        "grade": 1,
        "learning_standards": [
            "Nhận biết được hình vuông, hình tròn, hình tam giác",
            "Phân biệt được các hình cơ bản trong thực tế"
        ]
    },
    # Grade 2
    {
        "topic_name": "Bảng nhân 2, 5",
        "category": "Số học",
        "grade": 2,
        "learning_standards": [
            "Nhận biết ý nghĩa phép nhân qua hình ảnh trực quan",
            "Thuộc bảng nhân 2 và bảng nhân 5",
            "Vận dụng giải bài toán có lời văn bằng 1 phép tính nhân"
        ]
    },
    {
        "topic_name": "Phép cộng có nhớ trong phạm vi 100",
        "category": "Số học",
        "grade": 2,
        "learning_standards": [
            "Thực hiện được phép cộng có nhớ trong phạm vi 100",
            "Giải quyết được bài toán có lời văn liên quan đến phép cộng"
        ]
    },
    {
        "topic_name": "Đo độ dài (cm, m)",
        "category": "Đo lường",
        "grade": 2,
        "learning_standards": [
            "Biết sử dụng thước để đo độ dài",
            "Nhận biết đơn vị cm và m",
            "Thực hiện đổi đơn vị đơn giản"
        ]
    },
    # Grade 3
    {
        "topic_name": "Diện tích hình chữ nhật",
        "category": "Hình học",
        "grade": 3,
        "learning_standards": [
            "Nhận biết khái niệm diện tích",
            "Biết cách tính diện tích hình chữ nhật khi biết chiều dài và chiều rộng",
            "Giải bài toán thực tế liên quan đến diện tích"
        ]
    },
    {
        "topic_name": "Phép chia có dư",
        "category": "Số học",
        "grade": 3,
        "learning_standards": [
            "Hiểu khái niệm phép chia có dư",
            "Thực hiện được phép chia có dư trong phạm vi 1000",
            "Kiểm tra được kết quả phép chia"
        ]
    },
    {
        "topic_name": "Bài toán nhiều bước",
        "category": "Giải toán",
        "grade": 3,
        "learning_standards": [
            "Phân tích được bài toán thành các bước",
            "Giải quyết được bài toán có 2-3 bước tính",
            "Trình bày được lời giải rõ ràng"
        ]
    }
]


def seed_topics():
    """Seed topics with learning standards into database."""
    db: Session = SessionLocal()
    try:
        # Check if we already have topics
        existing = db.query(MathTopic).count()
        if existing > 0:
            print(f"Database already has {existing} topics. Updating with learning standards...")
            
            # Update existing or add new
            for topic_data in TOPICS:
                existing_topic = db.query(MathTopic).filter(
                    MathTopic.topic_name == topic_data["topic_name"],
                    MathTopic.grade == topic_data["grade"]
                ).first()
                
                if existing_topic:
                    existing_topic.learning_standards = topic_data["learning_standards"]
                else:
                    db.add(MathTopic(**topic_data))
            
            db.commit()
            print("Topics updated successfully!")
        else:
            # Add all topics
            for topic_data in TOPICS:
                db.add(MathTopic(**topic_data))
            db.commit()
            print(f"Added {len(TOPICS)} topics with learning standards!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_topics()

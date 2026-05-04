"""
Seed script to populate initial data.

Run with: python -m app.seed
"""
from app.database import SessionLocal, engine, Base
from app.models.math_topic import MathTopic
from app.models.user import User, UserRole
from app.services.auth_service import get_password_hash


# Math topics following Vietnamese curriculum (GDPT 2018)
SEED_TOPICS = [
    # Grade 1
    {"topic_name": "Các số đến 10", "category": "Số học", "grade": 1},
    {"topic_name": "Phép cộng trong phạm vi 10", "category": "Số học", "grade": 1},
    {"topic_name": "Phép trừ trong phạm vi 10", "category": "Số học", "grade": 1},
    {"topic_name": "Các số đến 100", "category": "Số học", "grade": 1},
    {"topic_name": "Phép cộng trong phạm vi 100", "category": "Số học", "grade": 1},
    {"topic_name": "Phép trừ trong phạm vi 100", "category": "Số học", "grade": 1},
    {"topic_name": "Hình vuông, hình tròn, hình tam giác", "category": "Hình học", "grade": 1},
    {"topic_name": "Đo độ dài (cm)", "category": "Đo lường", "grade": 1},
    
    # Grade 2
    {"topic_name": "Các số đến 1000", "category": "Số học", "grade": 2},
    {"topic_name": "Phép cộng có nhớ trong phạm vi 100", "category": "Số học", "grade": 2},
    {"topic_name": "Phép trừ có nhớ trong phạm vi 100", "category": "Số học", "grade": 2},
    {"topic_name": "Bảng nhân 2, 3, 4, 5", "category": "Số học", "grade": 2},
    {"topic_name": "Bảng chia 2, 3, 4, 5", "category": "Số học", "grade": 2},
    {"topic_name": "Đo độ dài (dm, m, km)", "category": "Đo lường", "grade": 2},
    {"topic_name": "Đo khối lượng (kg)", "category": "Đo lường", "grade": 2},
    {"topic_name": "Xem đồng hồ", "category": "Đo lường", "grade": 2},
    {"topic_name": "Hình chữ nhật, hình tứ giác", "category": "Hình học", "grade": 2},
    
    # Grade 3
    {"topic_name": "Các số đến 10000", "category": "Số học", "grade": 3},
    {"topic_name": "Các số đến 100000", "category": "Số học", "grade": 3},
    {"topic_name": "Phép nhân trong phạm vi 1000", "category": "Số học", "grade": 3},
    {"topic_name": "Phép chia trong phạm vi 1000", "category": "Số học", "grade": 3},
    {"topic_name": "Phép chia có dư", "category": "Số học", "grade": 3},
    {"topic_name": "Bảng nhân 6, 7, 8, 9", "category": "Số học", "grade": 3},
    {"topic_name": "Bảng chia 6, 7, 8, 9", "category": "Số học", "grade": 3},
    {"topic_name": "Phân số đơn giản", "category": "Phân số", "grade": 3},
    {"topic_name": "Bài toán có nhiều bước", "category": "Tư duy", "grade": 3},
    {"topic_name": "Đổi đơn vị đo độ dài", "category": "Đo lường", "grade": 3},
    {"topic_name": "Đổi đơn vị đo khối lượng", "category": "Đo lường", "grade": 3},
    {"topic_name": "Chu vi hình chữ nhật, hình vuông", "category": "Hình học", "grade": 3},
    {"topic_name": "Diện tích hình chữ nhật, hình vuông", "category": "Hình học", "grade": 3},
    {"topic_name": "Góc vuông, góc không vuông", "category": "Hình học", "grade": 3},
]


def seed_topics(db):
    """Seed math topics."""
    existing = db.query(MathTopic).count()
    if existing > 0:
        print(f"  → Math topics already seeded ({existing} topics)")
        return
    
    for topic_data in SEED_TOPICS:
        topic = MathTopic(**topic_data)
        db.add(topic)
    
    db.commit()
    print(f"  → Seeded {len(SEED_TOPICS)} math topics")


def seed_demo_users(db):
    """Seed demo users for testing."""
    # Check if demo users exist
    if db.query(User).filter(User.email == "teacher@demo.com").first():
        print("  → Demo users already exist")
        return
    
    # Create demo teacher
    teacher = User(
        email="teacher@demo.com",
        password_hash=get_password_hash("123456"),
        full_name="Cô Lan (Demo)",
        role=UserRole.TEACHER
    )
    db.add(teacher)
    
    db.commit()
    print("  → Created demo users:")
    print("    - teacher@demo.com / 123456")


def main():
    """Run all seed functions."""
    print("\n🌱 Seeding database...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("  → Tables created")
    
    # Seed data
    db = SessionLocal()
    try:
        seed_topics(db)
        seed_demo_users(db)
    finally:
        db.close()
    
    print("\n✅ Seeding complete!\n")


if __name__ == "__main__":
    main()

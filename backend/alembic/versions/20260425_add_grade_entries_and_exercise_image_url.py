"""add grade_entries table and worksheet_exercises image_url

Revision ID: 20260425_add_grade_entries_and_exercise_image_url
Revises: 20260422_add_student_progress_updated_at
Create Date: 2026-04-25
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260425_add_grade_entries_and_exercise_image_url"
down_revision = "20260422_add_student_progress_updated_at"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    table_names = set(inspector.get_table_names())

    if "grade_entries" not in table_names:
        op.create_table(
            "grade_entries",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("student_id", sa.Integer(), sa.ForeignKey("students.id", ondelete="CASCADE"), nullable=False),
            sa.Column("worksheet_id", sa.Integer(), sa.ForeignKey("worksheets.id", ondelete="CASCADE"), nullable=False),
            sa.Column("score", sa.Float(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=True),
            sa.UniqueConstraint("student_id", "worksheet_id", name="uq_grade_student_worksheet"),
        )
        op.create_index("ix_grade_entries_id", "grade_entries", ["id"], unique=False)

    if "worksheet_exercises" in table_names:
        worksheet_exercise_cols = {column["name"] for column in inspector.get_columns("worksheet_exercises")}
        if "image_url" not in worksheet_exercise_cols:
            op.add_column("worksheet_exercises", sa.Column("image_url", sa.String(length=500), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    table_names = set(inspector.get_table_names())

    if "worksheet_exercises" in table_names:
        worksheet_exercise_cols = {column["name"] for column in inspector.get_columns("worksheet_exercises")}
        if "image_url" in worksheet_exercise_cols:
            op.drop_column("worksheet_exercises", "image_url")

    if "grade_entries" in table_names:
        op.drop_index("ix_grade_entries_id", table_name="grade_entries")
        op.drop_table("grade_entries")

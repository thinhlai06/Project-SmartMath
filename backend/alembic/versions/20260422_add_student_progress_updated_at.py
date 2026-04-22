"""add updated_at column to student_progress

Revision ID: 20260422_add_student_progress_updated_at
Revises: 20260405_add_cpa_bundles
Create Date: 2026-04-22
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260422_add_student_progress_updated_at"
down_revision = "20260405_add_cpa_bundles"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "student_progress" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("student_progress")}
    if "updated_at" not in columns:
        op.add_column("student_progress", sa.Column("updated_at", sa.DateTime(), nullable=True))
        op.execute("UPDATE student_progress SET updated_at = created_at WHERE updated_at IS NULL")


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "student_progress" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("student_progress")}
    if "updated_at" in columns:
        op.drop_column("student_progress", "updated_at")

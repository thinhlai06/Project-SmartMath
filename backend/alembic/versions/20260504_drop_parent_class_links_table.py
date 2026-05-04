"""drop parent_class_links table (parent role removed)

Revision ID: 20260504_drop_parent_class_links_table
Revises: 20260425_add_grade_entries_and_exercise_image_url
Create Date: 2026-05-04
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260504_drop_parent_class_links_table"
down_revision = "20260425_add_grade_entries_and_exercise_image_url"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_table("parent_class_links")


def downgrade() -> None:
    op.create_table(
        "parent_class_links",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("parent_id", sa.Integer(), nullable=False),
        sa.Column("class_id", sa.Integer(), nullable=False),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("joined_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["class_id"], ["math_classes.id"]),
        sa.ForeignKeyConstraint(["parent_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["student_id"], ["students.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_parent_class_links_id"), "parent_class_links", ["id"], unique=False)

"""remove CPA feature artifacts

Revision ID: 20260505_remove_cpa_feature_artifacts
Revises: 20260504_drop_parent_class_links_table
Create Date: 2026-05-05
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260505_remove_cpa_feature_artifacts"
down_revision = "20260504_drop_parent_class_links_table"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    table_names = set(inspector.get_table_names())

    if "worksheets" in table_names:
        op.execute(
            sa.text(
                """
                UPDATE worksheets
                SET worksheet_type = 'differentiation'
                WHERE worksheet_type IN ('cpa', 'CPA')
                """
            )
        )

    if "worksheet_exercises" in table_names:
        columns = {column["name"] for column in inspector.get_columns("worksheet_exercises")}
        if "exercise_type" in columns:
            with op.batch_alter_table("worksheet_exercises") as batch_op:
                batch_op.drop_column("exercise_type")

    if "cpa_bundles" in table_names:
        op.drop_table("cpa_bundles")


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    table_names = set(inspector.get_table_names())

    if "worksheet_exercises" in table_names:
        columns = {column["name"] for column in inspector.get_columns("worksheet_exercises")}
        if "exercise_type" not in columns:
            with op.batch_alter_table("worksheet_exercises") as batch_op:
                batch_op.add_column(sa.Column("exercise_type", sa.String(length=50), nullable=True))

    if "cpa_bundles" not in table_names:
        op.create_table(
            "cpa_bundles",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("worksheet_id", sa.Integer(), sa.ForeignKey("worksheets.id"), nullable=False),
            sa.Column("math_core_json", sa.Text(), nullable=False),
            sa.Column("concrete_spec_json", sa.Text(), nullable=False),
            sa.Column("pictorial_spec_json", sa.Text(), nullable=False),
            sa.Column("abstract_spec_json", sa.Text(), nullable=False),
            sa.Column("validation_status", sa.String(length=20), nullable=False, server_default="pending"),
            sa.Column("validator_messages_json", sa.Text(), nullable=True),
            sa.Column("teacher_approved", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        )
        op.create_index("ix_cpa_bundles_id", "cpa_bundles", ["id"], unique=False)
        op.create_index("ix_cpa_bundles_worksheet_id", "cpa_bundles", ["worksheet_id"], unique=False)

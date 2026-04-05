"""add cpa_bundles table

Revision ID: 20260405_add_cpa_bundles
Revises: 
Create Date: 2026-04-05
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260405_add_cpa_bundles"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
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


def downgrade() -> None:
    op.drop_index("ix_cpa_bundles_worksheet_id", table_name="cpa_bundles")
    op.drop_index("ix_cpa_bundles_id", table_name="cpa_bundles")
    op.drop_table("cpa_bundles")
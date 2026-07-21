"""portfolios & likes
Revision ID: 0004_portfolio
Revises: 0003_assignment
"""
from alembic import op
import sqlalchemy as sa
revision="0004_portfolio"; down_revision="0003_assignment"; branch_labels=None; depends_on=None
media_type=sa.Enum("image","video","pdf","link",name="mediatype")
portfolio_cat=sa.Enum("digital_marketing","content_creator","product_creator","other",name="portfoliocategory")
def _ts(): return (sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
                   sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
def upgrade():
    op.create_table("portfolios", sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("student_id", sa.Uuid(), sa.ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(200), nullable=False), sa.Column("description", sa.Text()),
        sa.Column("media_type", media_type, server_default="link", nullable=False), sa.Column("media_url", sa.String(500), nullable=False),
        sa.Column("category", portfolio_cat, server_default="other", nullable=False), sa.Column("is_for_sale", sa.Boolean(), server_default=sa.false()),
        sa.Column("price", sa.Float()), sa.Column("is_published", sa.Boolean(), server_default=sa.true()),
        sa.Column("likes_count", sa.Integer(), server_default="0"), sa.Column("views_count", sa.Integer(), server_default="0"), *_ts())
    op.create_index("ix_portfolios_student_id","portfolios",["student_id"]); op.create_index("ix_portfolios_category","portfolios",["category"])
    op.create_table("portfolio_likes", sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("portfolio_id", sa.Uuid(), sa.ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False), *_ts(),
        sa.UniqueConstraint("portfolio_id","user_id", name="uq_like_once"))
    op.create_index("ix_portfolio_likes_portfolio_id","portfolio_likes",["portfolio_id"])
def downgrade():
    op.drop_table("portfolio_likes"); op.drop_table("portfolios")
    for e in (portfolio_cat, media_type): e.drop(op.get_bind(), checkfirst=True)

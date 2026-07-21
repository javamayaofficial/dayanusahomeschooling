"""pgvector + knowledge_base + chat

Revision ID: 0005_knowledge_base
Revises: 0004_portfolio

Di PostgreSQL: aktifkan ekstensi vector, kolom embedding VECTOR(768), index ivfflat
(cosine). Di sqlite (untuk uji rantai migrasi): embedding disimpan sebagai TEXT.
"""
from alembic import op
import sqlalchemy as sa

revision = "0005_knowledge_base"
down_revision = "0004_portfolio"
branch_labels = None
depends_on = None

chat_role = sa.Enum("user", "assistant", name="chatrole")


def _ts():
    return (
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def upgrade() -> None:
    bind = op.get_bind()
    is_pg = bind.dialect.name == "postgresql"

    # --- knowledge_base ---
    if is_pg:
        op.execute("CREATE EXTENSION IF NOT EXISTS vector")
        from pgvector.sqlalchemy import Vector
        from sqlalchemy.dialects.postgresql import JSONB
        embedding_col = sa.Column("embedding", Vector(768))
        meta_col = sa.Column("metadata", JSONB())
    else:
        embedding_col = sa.Column("embedding", sa.Text())
        meta_col = sa.Column("metadata", sa.JSON())

    op.create_table(
        "knowledge_base",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("content", sa.Text(), nullable=False),
        embedding_col,
        meta_col,
        *_ts(),
    )

    if is_pg:
        # Index ivfflat untuk pencarian cosine (butuh data untuk efektif; lists=100)
        op.execute(
            "CREATE INDEX IF NOT EXISTS ix_knowledge_embedding "
            "ON knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
        )

    # --- chat ---
    op.create_table(
        "chat_sessions",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("student_id", sa.Uuid(), sa.ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(200), server_default="Percakapan Baru"),
        *_ts(),
    )
    op.create_index("ix_chat_sessions_student_id", "chat_sessions", ["student_id"])

    op.create_table(
        "chat_messages",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("session_id", sa.Uuid(), sa.ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", chat_role, nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        *_ts(),
    )
    op.create_index("ix_chat_messages_session_id", "chat_messages", ["session_id"])


def downgrade() -> None:
    op.drop_table("chat_messages")
    op.drop_table("chat_sessions")
    op.drop_table("knowledge_base")
    chat_role.drop(op.get_bind(), checkfirst=True)
    if op.get_bind().dialect.name == "postgresql":
        op.execute("DROP EXTENSION IF EXISTS vector")

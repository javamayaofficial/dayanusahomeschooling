"""init users & student_profiles
Revision ID: 0001_init
Revises:
"""
from alembic import op
import sqlalchemy as sa
revision="0001_init"; down_revision=None; branch_labels=None; depends_on=None
user_role=sa.Enum("siswa","orang_tua","tutor","admin_pkbm","admin_lsp","admin_yayasan",name="userrole")
paket_level=sa.Enum("paket_a","paket_b","paket_c",name="paketlevel")
learning_track=sa.Enum("pkbm_plus_softskill","softskill_only",name="learningtrack")
student_status=sa.Enum("active","graduated","dropped",name="studentstatus")
def upgrade():
    op.create_table("users",
        sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False), sa.Column("full_name", sa.String(150), nullable=False),
        sa.Column("role", user_role, nullable=False), sa.Column("phone", sa.String(20)), sa.Column("address", sa.Text()),
        sa.Column("birth_date", sa.Date()), sa.Column("profile_picture", sa.String(500)),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true()), sa.Column("is_verified", sa.Boolean(), server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_index("ix_users_email","users",["email"],unique=True); op.create_index("ix_users_role","users",["role"])
    op.create_table("student_profiles",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("parent_id", sa.Uuid(), sa.ForeignKey("users.id")), sa.Column("paket", paket_level),
        sa.Column("track", learning_track, server_default="pkbm_plus_softskill", nullable=False),
        sa.Column("nis", sa.String(30), unique=True), sa.Column("enrollment_date", sa.Date()),
        sa.Column("status", student_status, server_default="active", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
def downgrade():
    op.drop_table("student_profiles"); op.drop_index("ix_users_role", table_name="users")
    op.drop_index("ix_users_email", table_name="users"); op.drop_table("users")
    for e in (student_status, learning_track, paket_level, user_role): e.drop(op.get_bind(), checkfirst=True)

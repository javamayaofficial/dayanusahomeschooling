"""academic
Revision ID: 0002_academic
Revises: 0001_init
"""
from alembic import op
import sqlalchemy as sa
revision="0002_academic"; down_revision="0001_init"; branch_labels=None; depends_on=None
paket_level=sa.Enum("paket_a","paket_b","paket_c",name="paketlevel", create_type=False)
content_type=sa.Enum("text","video","pdf","link",name="contenttype", create_type=False)
softskill_cat=sa.Enum("digital_marketing","content_creator","product_creator",name="softskillcategory", create_type=False)
skill_level=sa.Enum("beginner","intermediate","advanced",name="skilllevel", create_type=False)
content_kind=sa.Enum("module_lesson","skill_lesson",name="contentkind", create_type=False)
progress_status=sa.Enum("not_started","in_progress","completed",name="progressstatus", create_type=False)
def _ts(): return (sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
                   sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
def upgrade():
    bind = op.get_bind()
    for enum_type in (content_type, softskill_cat, skill_level, content_kind, progress_status):
        enum_type.create(bind, checkfirst=True)
    op.create_table("modules", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("paket", paket_level, nullable=False),
        sa.Column("subject", sa.String(100), nullable=False), sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text()), sa.Column("cover_image_url", sa.String(500)),
        sa.Column("order_index", sa.Integer(), server_default="0"), sa.Column("is_published", sa.Boolean(), server_default=sa.false()), *_ts())
    op.create_index("ix_modules_paket","modules",["paket"])
    op.create_table("lessons", sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("module_id", sa.Uuid(), sa.ForeignKey("modules.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(200), nullable=False), sa.Column("content_type", content_type, server_default="text", nullable=False),
        sa.Column("content_text", sa.Text()), sa.Column("content_url", sa.String(500)), sa.Column("duration_minutes", sa.Integer()),
        sa.Column("order_index", sa.Integer(), server_default="0"), sa.Column("is_downloadable", sa.Boolean(), server_default=sa.true()), *_ts())
    op.create_index("ix_lessons_module_id","lessons",["module_id"])
    op.create_table("soft_skill_classes", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("title", sa.String(200), nullable=False),
        sa.Column("category", softskill_cat, nullable=False), sa.Column("description", sa.Text()), sa.Column("skkni_code", sa.String(100)),
        sa.Column("level", skill_level, server_default="beginner", nullable=False), sa.Column("is_bnsp_certified", sa.Boolean(), server_default=sa.false()),
        sa.Column("cover_image_url", sa.String(500)), sa.Column("is_published", sa.Boolean(), server_default=sa.false()), *_ts())
    op.create_index("ix_soft_skill_classes_category","soft_skill_classes",["category"])
    op.create_table("skill_lessons", sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("class_id", sa.Uuid(), sa.ForeignKey("soft_skill_classes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(200), nullable=False), sa.Column("content_type", content_type, server_default="video", nullable=False),
        sa.Column("content_text", sa.Text()), sa.Column("content_url", sa.String(500)), sa.Column("duration_minutes", sa.Integer()),
        sa.Column("order_index", sa.Integer(), server_default="0"), sa.Column("is_downloadable", sa.Boolean(), server_default=sa.true()), *_ts())
    op.create_index("ix_skill_lessons_class_id","skill_lessons",["class_id"])
    op.create_table("student_progress", sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("student_id", sa.Uuid(), sa.ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("content_kind", content_kind, nullable=False), sa.Column("content_id", sa.Uuid(), nullable=False),
        sa.Column("status", progress_status, server_default="not_started", nullable=False), sa.Column("score", sa.Float()),
        sa.Column("completed_at", sa.DateTime(timezone=True)), *_ts(),
        sa.UniqueConstraint("student_id","content_kind","content_id", name="uq_progress_target"))
    op.create_index("ix_student_progress_student_id","student_progress",["student_id"])
def downgrade():
    op.drop_table("student_progress"); op.drop_table("skill_lessons"); op.drop_table("soft_skill_classes")
    op.drop_table("lessons"); op.drop_table("modules")
    for e in (progress_status, content_kind, skill_level, softskill_cat, content_type): e.drop(op.get_bind(), checkfirst=True)

"""assignments & submissions
Revision ID: 0003_assignment
Revises: 0002_academic
"""
from alembic import op
import sqlalchemy as sa
revision="0003_assignment"; down_revision="0002_academic"; branch_labels=None; depends_on=None
submission_status=sa.Enum("submitted","graded","returned",name="submissionstatus")
def _ts(): return (sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
                   sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
def upgrade():
    op.create_table("assignments", sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("lesson_id", sa.Uuid(), sa.ForeignKey("skill_lessons.id", ondelete="SET NULL")),
        sa.Column("tutor_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(200), nullable=False), sa.Column("description", sa.Text()),
        sa.Column("due_date", sa.DateTime(timezone=True)), sa.Column("max_score", sa.Integer(), server_default="100"),
        sa.Column("is_published", sa.Boolean(), server_default=sa.true()), *_ts())
    op.create_index("ix_assignments_tutor_id","assignments",["tutor_id"])
    op.create_table("submissions", sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("assignment_id", sa.Uuid(), sa.ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("student_id", sa.Uuid(), sa.ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("content_text", sa.Text()), sa.Column("file_url", sa.String(500)),
        sa.Column("status", submission_status, server_default="submitted", nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True)), sa.Column("grade", sa.Float()),
        sa.Column("feedback", sa.Text()), sa.Column("graded_at", sa.DateTime(timezone=True)), *_ts(),
        sa.UniqueConstraint("assignment_id","student_id", name="uq_submission_student"))
    op.create_index("ix_submissions_assignment_id","submissions",["assignment_id"])
    op.create_index("ix_submissions_student_id","submissions",["student_id"])
def downgrade():
    op.drop_table("submissions"); op.drop_table("assignments"); submission_status.drop(op.get_bind(), checkfirst=True)

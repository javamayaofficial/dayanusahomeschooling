import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.enums import SubmissionStatus
class AssignmentCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200); description: str|None=None
    lesson_id: uuid.UUID|None=None; due_date: datetime|None=None; max_score: int = 100; is_published: bool = True
class AssignmentUpdate(BaseModel):
    title: str|None=None; description: str|None=None; due_date: datetime|None=None; max_score: int|None=None; is_published: bool|None=None
class AssignmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID; tutor_id: uuid.UUID; lesson_id: uuid.UUID|None=None; title: str; description: str|None=None
    due_date: datetime|None=None; max_score: int; is_published: bool; created_at: datetime
class SubmissionCreate(BaseModel):
    content_text: str|None=None; file_url: str|None=None
class SubmissionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID; assignment_id: uuid.UUID; student_id: uuid.UUID; content_text: str|None=None
    file_url: str|None=None; status: SubmissionStatus; submitted_at: datetime|None=None
    grade: float|None=None; feedback: str|None=None; graded_at: datetime|None=None
class AssignmentWithMySubmission(AssignmentOut):
    my_submission: "SubmissionOut | None" = None
class GradeRequest(BaseModel):
    submission_id: uuid.UUID; grade: float = Field(ge=0); feedback: str|None=None
AssignmentWithMySubmission.model_rebuild()

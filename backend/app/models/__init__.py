from app.models.base import Base
from app.models.user import User, StudentProfile
from app.models.academic import Module, Lesson
from app.models.softskill import SoftSkillClass, SkillLesson
from app.models.progress import StudentProgress
from app.models.assignment import Assignment, Submission
from app.models.portfolio import Portfolio, PortfolioLike
from app.models.chat import ChatSession, ChatMessage
from app.models.knowledge_base import KnowledgeBase
__all__ = ["Base","User","StudentProfile","Module","Lesson","SoftSkillClass","SkillLesson",
           "StudentProgress","Assignment","Submission","Portfolio","PortfolioLike",
           "ChatSession","ChatMessage","KnowledgeBase"]

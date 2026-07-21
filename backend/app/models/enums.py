import enum
class UserRole(str, enum.Enum):
    SISWA="siswa"; ORANG_TUA="orang_tua"; TUTOR="tutor"; ADMIN_PKBM="admin_pkbm"; ADMIN_LSP="admin_lsp"; ADMIN_YAYASAN="admin_yayasan"
class PaketLevel(str, enum.Enum):
    PAKET_A="paket_a"; PAKET_B="paket_b"; PAKET_C="paket_c"
class LearningTrack(str, enum.Enum):
    PKBM_PLUS_SOFTSKILL="pkbm_plus_softskill"; SOFTSKILL_ONLY="softskill_only"
class StudentStatus(str, enum.Enum):
    ACTIVE="active"; GRADUATED="graduated"; DROPPED="dropped"
class ContentType(str, enum.Enum):
    TEXT="text"; VIDEO="video"; PDF="pdf"; LINK="link"
class SoftSkillCategory(str, enum.Enum):
    DIGITAL_MARKETING="digital_marketing"; CONTENT_CREATOR="content_creator"; PRODUCT_CREATOR="product_creator"
class SkillLevel(str, enum.Enum):
    BEGINNER="beginner"; INTERMEDIATE="intermediate"; ADVANCED="advanced"
class ContentKind(str, enum.Enum):
    MODULE_LESSON="module_lesson"; SKILL_LESSON="skill_lesson"
class ProgressStatus(str, enum.Enum):
    NOT_STARTED="not_started"; IN_PROGRESS="in_progress"; COMPLETED="completed"
class SubmissionStatus(str, enum.Enum):
    SUBMITTED="submitted"; GRADED="graded"; RETURNED="returned"
class MediaType(str, enum.Enum):
    IMAGE="image"; VIDEO="video"; PDF="pdf"; LINK="link"
class PortfolioCategory(str, enum.Enum):
    DIGITAL_MARKETING="digital_marketing"; CONTENT_CREATOR="content_creator"; PRODUCT_CREATOR="product_creator"; OTHER="other"
class ChatRole(str, enum.Enum):
    USER="user"; ASSISTANT="assistant"
SELF_REGISTER_ROLES={UserRole.SISWA,UserRole.ORANG_TUA,UserRole.TUTOR}
ADMIN_ROLES={UserRole.ADMIN_PKBM,UserRole.ADMIN_YAYASAN}

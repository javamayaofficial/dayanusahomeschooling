export type UserRole = "siswa"|"orang_tua"|"tutor"|"admin_pkbm"|"admin_lsp"|"admin_yayasan";
export type PaketLevel = "paket_a"|"paket_b"|"paket_c";
export type ContentType = "text"|"video"|"pdf"|"link";
export type MediaType = "image"|"video"|"pdf"|"link";
export type PortfolioCategory = "digital_marketing"|"content_creator"|"product_creator"|"other";
export type SubmissionStatus = "submitted"|"graded"|"returned";
export type ChatRole = "user"|"assistant";

export interface User { id:string; email:string; full_name:string; role:UserRole; phone?:string|null; is_active:boolean; is_verified:boolean; created_at:string; }
export interface TokenPair { access_token:string; refresh_token:string; token_type:string; }
export interface AuthResponse { user:User; tokens:TokenPair; }
export interface RegisterPayload { email:string; password:string; full_name:string; role:UserRole; phone?:string; paket?:PaketLevel; }

export interface Lesson { id:string; title:string; content_type:ContentType; content_text?:string|null; content_url?:string|null; duration_minutes?:number|null; order_index:number; is_downloadable:boolean; }
export interface Module { id:string; paket:PaketLevel; subject:string; title:string; description?:string|null; order_index:number; is_published:boolean; created_at:string; }
export interface ModuleDetail extends Module { lessons:Lesson[]; }
export interface SkillClass { id:string; title:string; category:string; description?:string|null; skkni_code?:string|null; level:string; is_bnsp_certified:boolean; is_published:boolean; created_at:string; }
export interface SkillClassDetail extends SkillClass { lessons:Lesson[]; }
export interface ProgressSummary { total:number; completed:number; percent:number; }
export interface DashboardSummary { academic:ProgressSummary; soft_skill:ProgressSummary; modules_available:number; classes_available:number; portfolio_count:number; }

export interface Submission { id:string; assignment_id:string; student_id:string; content_text?:string|null; file_url?:string|null; status:SubmissionStatus; submitted_at?:string|null; grade?:number|null; feedback?:string|null; graded_at?:string|null; }
export interface Assignment { id:string; tutor_id:string; lesson_id?:string|null; title:string; description?:string|null; due_date?:string|null; max_score:number; is_published:boolean; created_at:string; my_submission?:Submission|null; }
export interface SubmissionPayload { content_text?:string; file_url?:string; }

export interface Portfolio { id:string; student_id:string; title:string; description?:string|null; media_type:MediaType; media_url:string; category:PortfolioCategory; is_for_sale:boolean; price?:number|null; is_published:boolean; likes_count:number; views_count:number; created_at:string; }
export interface PortfolioPage { items:Portfolio[]; total:number; limit:number; offset:number; }
export interface PortfolioPayload { title:string; description?:string; media_type:MediaType; media_url:string; category:PortfolioCategory; is_for_sale:boolean; price?:number|null; is_published:boolean; }
export interface LikeResult { liked:boolean; likes_count:number; }

// --- Guru AI ---
export interface ChatSession { id:string; title:string; created_at:string; updated_at:string; last_message?:string|null; }
export interface ChatMessage { id:string; session_id:string; role:ChatRole; content:string; created_at:string; }
export interface Suggestions { suggestions:string[]; }

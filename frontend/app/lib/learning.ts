import { apiFetch } from "./api";
import { getAccessToken } from "./auth";
import type { DashboardSummary, Module, ModuleDetail, ProgressItem, SkillClass, SkillClassDetail } from "@/types";
const tok = () => getAccessToken() ?? undefined;
export const getModules = (paket?:string) => apiFetch<Module[]>(`/modules${paket?`?paket=${paket}`:""}`,{token:tok()});
export const getModule = (id:string) => apiFetch<ModuleDetail>(`/modules/${id}`,{token:tok()});
export const getSoftSkills = () => apiFetch<SkillClass[]>(`/soft-skills`,{token:tok()});
export const getSoftSkill = (id:string) => apiFetch<SkillClassDetail>(`/soft-skills/${id}`,{token:tok()});
export const getDashboard = () => apiFetch<DashboardSummary>(`/dashboard/summary`,{token:tok()});
export const getMyProgress = () => apiFetch<ProgressItem[]>(`/progress/me`,{token:tok()});
export const markProgress = (content_kind:"module_lesson"|"skill_lesson", content_id:string) =>
  apiFetch(`/progress`,{method:"POST",token:tok(),body:JSON.stringify({content_kind,content_id,status:"completed"})});

import { apiFetch } from "./api";
import { getAccessToken } from "./auth";
import type { Assignment, Submission, SubmissionPayload } from "@/types";
const tok = () => getAccessToken() ?? undefined;
export const getAssignments = () => apiFetch<Assignment[]>(`/assignments`,{token:tok()});
export const getAssignment = (id:string) => apiFetch<Assignment>(`/assignments/${id}`,{token:tok()});
export const submitAssignment = (id:string, payload:SubmissionPayload) =>
  apiFetch<Submission>(`/assignments/${id}/submit`,{method:"POST",token:tok(),body:JSON.stringify(payload)});
export type Tab = "pending"|"submitted"|"graded";
export function tabOf(a:Assignment):Tab { if(!a.my_submission) return "pending"; return a.my_submission.status==="graded"?"graded":"submitted"; }
export function isOverdue(a:Assignment):boolean { return !!a.due_date && !a.my_submission && new Date(a.due_date).getTime() < Date.now(); }

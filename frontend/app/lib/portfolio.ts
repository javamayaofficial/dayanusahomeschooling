import { apiFetch } from "./api";
import { getAccessToken } from "./auth";
import type { LikeResult, Portfolio, PortfolioPage, PortfolioPayload } from "@/types";
const tok = () => getAccessToken() ?? undefined;
export const getPublicPortfolios = (opts:{category?:string; limit?:number; offset?:number}={}) => {
  const p = new URLSearchParams();
  if (opts.category) p.set("category", opts.category);
  p.set("limit", String(opts.limit ?? 10)); p.set("offset", String(opts.offset ?? 0));
  return apiFetch<PortfolioPage>(`/portfolios?${p.toString()}`);
};
export const getPortfolio = (id:string) => apiFetch<Portfolio>(`/portfolios/${id}`);
export const getMyPortfolios = () => apiFetch<Portfolio[]>(`/portfolios/me`,{token:tok()});
export const createPortfolio = (payload:PortfolioPayload) => apiFetch<Portfolio>(`/portfolios`,{method:"POST",token:tok(),body:JSON.stringify(payload)});
export const updatePortfolio = (id:string, payload:Partial<PortfolioPayload>) => apiFetch<Portfolio>(`/portfolios/${id}`,{method:"PUT",token:tok(),body:JSON.stringify(payload)});
export const deletePortfolio = (id:string) => apiFetch<void>(`/portfolios/${id}`,{method:"DELETE",token:tok()});
export const likePortfolio = (id:string) => apiFetch<LikeResult>(`/portfolios/${id}/like`,{method:"POST",token:tok()});

import type { CraStatus, DashboardDataResponse } from "@shared/types";

const BASE = "";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const api = {
  getDashboard: () => request<DashboardDataResponse>("/api/dashboard"),

  setManualStatus: (cra: string, status: CraStatus) =>
    request<{ ok: boolean }>(`/api/manual-status/${encodeURIComponent(cra)}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  removeManualStatus: (cra: string) =>
    request<{ ok: boolean }>(`/api/manual-status/${encodeURIComponent(cra)}`, {
      method: "DELETE",
    }),

  deleteCra: (cra: string) =>
    request<{ ok: boolean }>("/api/deleted-cras", {
      method: "POST",
      body: JSON.stringify({ cra_name: cra }),
    }),

  restoreCra: (cra: string) =>
    request<{ ok: boolean }>(`/api/deleted-cras/${encodeURIComponent(cra)}`, {
      method: "DELETE",
    }),

  updateGarantias: (cra: string, data: { valor_minimo?: string; valor_coberto?: string }) =>
    request<{ ok: boolean }>(`/api/garantias-editaveis/${encodeURIComponent(cra)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

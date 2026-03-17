import type { AllCraData, AllLimitesConcentracao, CraStatus, ManualStatusMap } from "@shared/types";

interface StatusResult {
  status: CraStatus;
  reason: string;
}

export function calculateCraStatus(
  craName: string,
  data: AllCraData | null,
  limitesConcentracao: AllLimitesConcentracao,
  manualStatus: ManualStatusMap,
  encerradosCras: string[],
): StatusResult {
  if (encerradosCras.includes(craName)) {
    return { status: "encerrado", reason: "" };
  }

  if (manualStatus[craName]) {
    return { status: manualStatus[craName], reason: "Status manual" };
  }

  const craData = data?.[craName];
  if (!craData) return { status: "verde", reason: "" };

  const limites = limitesConcentracao[craName];
  if (!limites) return { status: "verde", reason: "" };

  const vencidosPeriodo = craData.vencidos_por_periodo || {};
  const vencidos90Plus = Object.entries(vencidosPeriodo).reduce(
    (sum, [periodo, dados]) => {
      if (parseInt(periodo) > 90) return sum + (dados.quantidade || 0);
      return sum;
    },
    0,
  );

  if (vencidos90Plus > 0) return { status: "vermelho", reason: "Vencidos >90d" };

  let proximoLimite = false;
  let warningReason = "";

  const checks: Array<{ label: string; value: number | undefined; limit: number | string | null | undefined }> = [
    { label: "Sacado Especial", value: craData.sacados?.especial?.valor, limit: limites.sacado_especial },
    { label: "Sacado Não Especial", value: craData.sacados?.nao_especial?.valor, limit: limites.sacado_nao_especial },
    { label: "Soma Sacados Esp.", value: craData.sacados?.especial?.valor, limit: limites.soma_sacados_especiais },
    { label: "Novos Sacados", value: craData.novos_sacados?.valor, limit: limites.novos_sacados },
    { label: "Partes Relacionadas", value: craData.partes_relacionadas?.valor, limit: limites.partes_relacionadas },
    { label: "Índice Substituição", value: craData.substituidos_total?.valor, limit: limites.indice_substituicao },
  ];

  for (const { label, value, limit } of checks) {
    if (!limit || !value) continue;
    const numericLimit = typeof limit === "string" ? parseFloat(limit.replace(/\./g, "").replace(",", ".")) : limit;
    if (isNaN(numericLimit) || numericLimit === 0) continue;

    const percentual = (value / numericLimit) * 100;
    if (percentual > 100) return { status: "vermelho", reason: `Limite: ${label}` };
    if (percentual > 80 && !proximoLimite) {
      proximoLimite = true;
      warningReason = `Próx: ${label}`;
    }
  }

  if (proximoLimite) return { status: "amarelo", reason: warningReason };
  return { status: "verde", reason: "" };
}

export function getStatusColorClasses(status: CraStatus): string {
  switch (status) {
    case "verde":
      return "bg-green-100 border-green-300 text-green-700";
    case "amarelo":
      return "bg-yellow-100 border-yellow-300 text-yellow-700";
    case "vermelho":
      return "bg-red-100 border-red-300 text-red-700";
    case "encerrado":
      return "bg-gray-100 border-gray-300 text-gray-700";
  }
}

export function getStatusDotColor(status: CraStatus): string {
  switch (status) {
    case "verde":
      return "bg-green-500";
    case "amarelo":
      return "bg-yellow-500";
    case "vermelho":
      return "bg-red-500";
    case "encerrado":
      return "bg-gray-500";
  }
}

export function getStatusBadgeClasses(status: CraStatus): string {
  switch (status) {
    case "verde":
      return "bg-green-100 text-green-800";
    case "amarelo":
      return "bg-yellow-100 text-yellow-800";
    case "vermelho":
      return "bg-red-100 text-red-800";
    case "encerrado":
      return "bg-gray-100 text-gray-800";
  }
}

export const STATUS_FILTER_MAP: Record<CraStatus, string> = {
  verde: "green",
  amarelo: "yellow",
  vermelho: "red",
  encerrado: "gray",
};

export function getStatusLabel(status: CraStatus): string {
  if (status === "encerrado") return "Encerrado";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

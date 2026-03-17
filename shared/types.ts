// ============================================================
// Tipos compartilhados entre frontend e backend
// ============================================================

export interface VencidosVincendos {
  vencidos: { quantidade: number; valor: number };
  vincendos: { quantidade: number; valor: number };
}

export interface SacadoInfo {
  quantidade: number;
  valor: number;
  sacados_unicos: number;
  maior_valor: number;
}

export interface CraData {
  nome: string;
  total_titulos: number;
  valor_total: number;
  vencidos_vincendos: VencidosVincendos;
  vencidos_por_periodo: Record<string, { quantidade: number; valor: number }>;
  sacados: {
    especial: SacadoInfo;
    nao_especial: SacadoInfo;
  };
  novos_sacados: { quantidade: number; valor: number; sacados_unicos: number };
  substituidos_total: { quantidade: number; valor: number };
  partes_relacionadas: { quantidade: number; valor: number; sacados_unicos: number };
}

export interface EmissionData {
  planilha_name: string;
  volume: number | null;
  data_vencimento: string | null;
  data_emissao: string | null;
  garantia: string | null;
  lastro: string | null;
  taxa_lastro: string | null;
}

export interface PaymentDates {
  proximo_pagamento_juros: string | null;
  proximo_pagamento_amortizacao: string | null;
}

export interface GarantiasData {
  valor_minimo: number;
  valor_coberto: number;
  percentual_cobertura: number;
}

export interface LimitesConcentracao {
  sacado_especial: number | null;
  sacado_nao_especial: number | null;
  soma_sacados_especiais: number | string | null;
  novos_sacados: number | null;
  partes_relacionadas: number | null;
  indice_substituicao: number | null;
}

export interface LimitsPreenchidos {
  limite_conc_individual_sacado_especial?: number;
  limite_conc_individual_sacado_nao_especial?: number;
  limite_soma_sacados_especiais?: number;
  limite_novos_sacados?: number;
  limite_partes_relacionadas?: number;
  limite_indice_substituicao?: number;
}

export interface TopDevedor {
  sacado: string;
  valor_total: number;
  titulos_vencidos: number;
  valor_vencidos: number;
  quantidade_total: number;
}

export interface EncerradosData {
  encerrados: string[];
  total_encerrados: number;
  total_ativos: number;
  total_esperado: number;
}

export type CraStatus = "verde" | "amarelo" | "vermelho" | "encerrado";

export interface ManualStatusMap {
  [craName: string]: CraStatus;
}

export interface ImageMappingMap {
  [craName: string]: string;
}

export type AllCraData = Record<string, CraData>;
export type AllEmissionData = Record<string, EmissionData>;
export type AllPaymentDates = Record<string, PaymentDates>;
export type AllGarantiasData = Record<string, GarantiasData>;
export type AllLimitesConcentracao = Record<string, LimitesConcentracao>;
export type AllLimitsPreenchidos = Record<string, LimitsPreenchidos>;
export type AllTopDevedores = Record<string, TopDevedor[]>;
export type ScatterDataMap = Record<string, TopDevedor[]>;

export interface GarantiasEditaveis {
  [craName: string]: {
    valor_minimo?: string;
    valor_coberto?: string;
  };
}

// API response types
export interface DashboardDataResponse {
  cras: AllCraData;
  emissions: AllEmissionData;
  paymentDates: AllPaymentDates;
  garantias: AllGarantiasData;
  limites: AllLimitesConcentracao;
  limitsPreenchidos: AllLimitsPreenchidos;
  imageMapping: ImageMappingMap;
  encerrados: EncerradosData;
  topDevedores: AllTopDevedores;
  scatterData: ScatterDataMap;
  manualStatus: ManualStatusMap;
  garantiasEditaveis: GarantiasEditaveis;
  deletedCras: string[];
}

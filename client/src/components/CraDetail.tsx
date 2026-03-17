import { AlertCircle, ArrowUpRight, Calendar, CheckCircle2, DollarSign, TrendingUp, Users } from "lucide-react";
import { LimitCard } from "./LimitCard";
import { CraEmissionInfo } from "./CraEmissionInfo";
import { CraGarantias } from "./CraGarantias";
import { CraDetailTabs } from "./CraDetailTabs";
import type {
  CraData,
  EmissionData,
  GarantiasData,
  GarantiasEditaveis,
  ImageMappingMap,
  LimitsPreenchidos,
  PaymentDates,
} from "@shared/types";

interface CraDetailProps {
  selectedCra: string;
  currentData: CraData;
  emission: EmissionData | undefined;
  payment: PaymentDates | undefined;
  limits: LimitsPreenchidos | undefined;
  garantias: GarantiasData | undefined;
  garantiasEditaveis: GarantiasEditaveis;
  imageMapping: ImageMappingMap;
  onSaveGarantia: (cra: string, campo: "valor_minimo" | "valor_coberto", valor: string) => void;
}

export function CraDetail({
  selectedCra,
  currentData,
  emission,
  payment,
  limits,
  garantias,
  garantiasEditaveis,
  imageMapping,
  onSaveGarantia,
}: CraDetailProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{selectedCra}</h1>
          <p className="text-muted-foreground mt-1">Análise detalhada da carteira e performance financeira</p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <Calendar className="inline-block mr-2 h-4 w-4" />
          {new Date().toLocaleDateString("pt-BR")}
        </div>
      </div>

      <CraEmissionInfo emission={emission} payment={payment} />

      <div className="grid gap-4 md:grid-cols-3">
        <LimitCard
          title="Valor Total em Carteira"
          value={currentData.valor_total}
          icon={<DollarSign className="h-4 w-4 text-blue-600" />}
          borderColor="border-l-blue-600"
          format="currency"
          subtitle={`${currentData.total_titulos} títulos totais`}
        />
        <LimitCard
          title="Títulos Vencidos"
          value={currentData.vencidos_vincendos.vencidos.valor}
          icon={<AlertCircle className="h-4 w-4 text-red-600" />}
          borderColor="border-l-red-600"
          format="currency"
          subtitle={`${currentData.vencidos_vincendos.vencidos.quantidade} títulos vencidos`}
        />
        <LimitCard
          title="Novos Sacados"
          value={currentData.novos_sacados.valor}
          limit={limits?.limite_novos_sacados}
          icon={<Users className="h-4 w-4 text-green-600" />}
          borderColor="border-l-green-600"
          format="currency"
          subtitle={`${currentData.novos_sacados.quantidade} títulos (${currentData.novos_sacados.sacados_unicos} únicos)`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <LimitCard
          title="Partes Relacionadas"
          value={currentData.partes_relacionadas.valor}
          limit={limits?.limite_partes_relacionadas}
          icon={<ArrowUpRight className="h-4 w-4 text-yellow-600" />}
          borderColor="border-l-yellow-600"
          format="currency"
          subtitle={`${currentData.partes_relacionadas.quantidade} títulos`}
        />
        <LimitCard
          title="Soma Sacados Especiais"
          value={currentData.sacados.especial.valor}
          limit={limits?.limite_soma_sacados_especiais}
          icon={<TrendingUp className="h-4 w-4 text-blue-600" />}
          borderColor="border-l-blue-600"
          format="currency"
          subtitle={`${currentData.sacados.especial.quantidade} títulos`}
        />
        <LimitCard
          title="Conc. Individual - Sacado Especial"
          value={currentData.sacados.especial.maior_valor}
          limit={limits?.limite_conc_individual_sacado_especial}
          icon={<CheckCircle2 className="h-4 w-4 text-purple-600" />}
          borderColor="border-l-purple-600"
          format="currency"
          subtitle="Maior valor individual"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <LimitCard
          title="Conc. Individual - Sacado Não Especial"
          value={currentData.sacados.nao_especial.maior_valor}
          limit={limits?.limite_conc_individual_sacado_nao_especial}
          icon={<TrendingUp className="h-4 w-4 text-blue-600" />}
          borderColor="border-l-blue-600"
          format="currency"
          subtitle="Maior valor individual"
        />
      </div>

      <CraDetailTabs selectedCra={selectedCra} currentData={currentData} imageMapping={imageMapping} />

      <CraGarantias
        selectedCra={selectedCra}
        emission={emission}
        garantias={garantias}
        garantiasEditaveis={garantiasEditaveis}
        onSave={onSaveGarantia}
      />
    </>
  );
}

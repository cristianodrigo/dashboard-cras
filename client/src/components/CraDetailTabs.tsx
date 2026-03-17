import { useRef } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  RadialBarChart,
  RadialBar,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PDFExport } from "./PDFExport";
import { formatCurrency, formatCurrencyShort } from "@/lib/formatters";
import type { CraData, ImageMappingMap } from "@shared/types";

interface CraDetailTabsProps {
  selectedCra: string;
  currentData: CraData;
  imageMapping: ImageMappingMap;
}

const COLORS_VENCIMENTO = ["#f59e0b", "#f97316", "#ef4444", "#b91c1c"];
const COLORS_PIE = ["#ef4444", "#22c55e"];
const COLORS_SACADOS = ["#6366f1", "#06b6d4"];

function PctLabel({ value, total, label }: { value: number; total: number; label: string }) {
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
  return (
    <div className="text-center">
      <p className="text-3xl font-bold tracking-tight">{pct}%</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{formatCurrencyShort(value)}</p>
    </div>
  );
}

function StatMini({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background/95 backdrop-blur border border-border rounded-lg shadow-lg p-3 text-sm">
      {label && <p className="font-medium mb-1.5 text-foreground">{label}</p>}
      {payload.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-muted-foreground">{item.name}:</span>
          <span className="font-semibold">{formatCurrency(item.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function CraDetailTabs({ selectedCra, currentData, imageMapping }: CraDetailTabsProps) {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const detalhesRef = useRef<HTMLDivElement>(null);

  const imageName = imageMapping[selectedCra];
  const imageUrl = imageName ? `/images/graficos/${imageName}` : null;

  const vencimentoBarData = Object.entries(currentData.vencidos_por_periodo).map(([periodo, dados]) => ({
    periodo: periodo.replace("dias", "d").replace("acima_de_", ">"),
    quantidade: dados.quantidade,
    valor: dados.valor,
  }));

  const totalVencido = currentData.vencidos_vincendos.vencidos.valor;
  const totalVincendo = currentData.vencidos_vincendos.vincendos.valor;
  const totalCarteira = currentData.valor_total;
  const pctVencido = totalCarteira > 0 ? (totalVencido / totalCarteira) * 100 : 0;

  const healthData = [
    { name: "Saúde", value: Math.max(0, 100 - pctVencido), fill: pctVencido > 20 ? "#ef4444" : pctVencido > 10 ? "#f59e0b" : "#22c55e" },
  ];

  const composicaoData = [
    { name: "Vincendos", valor: totalVincendo, fill: "#22c55e" },
    { name: "Vencidos", valor: totalVencido, fill: "#ef4444" },
  ];

  const sacadoEspecialPct = totalCarteira > 0 ? (currentData.sacados.especial.valor / totalCarteira) * 100 : 0;
  const sacadoNaoEspecialPct = totalCarteira > 0 ? (currentData.sacados.nao_especial.valor / totalCarteira) * 100 : 0;

  const concentracaoData = [
    {
      name: "Especiais",
      valor: currentData.sacados.especial.valor,
      titulos: currentData.sacados.especial.quantidade,
      sacados: currentData.sacados.especial.sacados_unicos,
      pct: sacadoEspecialPct,
    },
    {
      name: "Não Especiais",
      valor: currentData.sacados.nao_especial.valor,
      titulos: currentData.sacados.nao_especial.quantidade,
      sacados: currentData.sacados.nao_especial.sacados_unicos,
      pct: sacadoNaoEspecialPct,
    },
  ];

  const vencimentoAreaData = vencimentoBarData.map((d, i) => ({
    ...d,
    acumulado: vencimentoBarData.slice(0, i + 1).reduce((s, v) => s + v.valor, 0),
  }));

  return (
    <Tabs defaultValue="dashboard" className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <TabsList className="bg-secondary/50 border border-border p-1">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Dashboard Visual
          </TabsTrigger>
          <TabsTrigger value="detalhes" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Detalhamento
          </TabsTrigger>
        </TabsList>
      </div>

      {/* ─── ABA DASHBOARD ────────────────────────────────── */}
      <TabsContent value="dashboard" className="space-y-4" ref={dashboardRef}>
        <div className="flex justify-end">
          <PDFExport craName={selectedCra} contentRef={dashboardRef} type="dashboard" />
        </div>

        {imageUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Gráfico da Carteira</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <img src={imageUrl} alt={`Gráfico ${selectedCra}`} className="max-w-full h-auto rounded-lg" />
            </CardContent>
          </Card>
        )}

        {/* Linha 1: Saúde + Composição + Vencimentos */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Indicador de saúde */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Saúde da Carteira</CardTitle>
              <CardDescription>% de inadimplência sobre o total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={180}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="100%"
                    barSize={14}
                    data={healthData}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "hsl(var(--secondary))" }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="-mt-20 text-center mb-4">
                  <p className="text-3xl font-bold">{pctVencido.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">vencido</p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full pt-2 border-t">
                  <StatMini label="Valor Total" value={formatCurrencyShort(totalCarteira)} color="bg-blue-500" />
                  <StatMini label="Vencido" value={formatCurrencyShort(totalVencido)} color="bg-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Composição Vencidos vs Vincendos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Vencidos vs Vincendos</CardTitle>
              <CardDescription>Composição por valor da carteira</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Vencidos", value: totalVencido },
                      { name: "Vincendos", value: totalVincendo },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    <Cell fill="#ef4444" />
                    <Cell fill="#22c55e" />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-center">
                  <p className="text-xs text-red-600 mb-0.5">Vencidos</p>
                  <p className="text-sm font-bold text-red-700">{formatCurrencyShort(totalVencido)}</p>
                  <p className="text-xs text-red-500">{currentData.vencidos_vincendos.vencidos.quantidade} títulos</p>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-2.5 text-center">
                  <p className="text-xs text-green-600 mb-0.5">Vincendos</p>
                  <p className="text-sm font-bold text-green-700">{formatCurrencyShort(totalVincendo)}</p>
                  <p className="text-xs text-green-500">{currentData.vencidos_vincendos.vincendos.quantidade} títulos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vencimentos por Período */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Aging dos Vencidos</CardTitle>
              <CardDescription>Distribuição por faixa de atraso</CardDescription>
            </CardHeader>
            <CardContent>
              {vencimentoBarData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={vencimentoBarData} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="periodo" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="valor" name="Valor" radius={[6, 6, 0, 0]}>
                        {vencimentoBarData.map((_, i) => (
                          <Cell key={i} fill={COLORS_VENCIMENTO[i % COLORS_VENCIMENTO.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {vencimentoBarData.map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2 h-2 rounded-full" style={{ background: COLORS_VENCIMENTO[i % COLORS_VENCIMENTO.length] }} />
                        <span className="text-muted-foreground">{d.periodo}:</span>
                        <span className="font-medium">{d.quantidade} tít.</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                  Sem dados de vencimento por período
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Linha 2: Perfil de Sacados + Concentração */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Perfil de Sacados */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Perfil de Sacados</CardTitle>
              <CardDescription>Distribuição entre especiais e não especiais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="45%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Especiais", value: currentData.sacados.especial.valor },
                        { name: "Não Especiais", value: currentData.sacados.nao_especial.valor },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {COLORS_SACADOS.map((c, i) => (
                        <Cell key={i} fill={c} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex-1 space-y-4">
                  {concentracaoData.map((item, i) => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS_SACADOS[i] }} />
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold">{item.pct.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${item.pct}%`, background: COLORS_SACADOS[i] }} />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{formatCurrencyShort(item.valor)}</span>
                        <span>{item.titulos} tít. / {item.sacados} sacados</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evolução Acumulada */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Vencidos Acumulados por Faixa</CardTitle>
              <CardDescription>Curva acumulada de valores vencidos</CardDescription>
            </CardHeader>
            <CardContent>
              {vencimentoAreaData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={vencimentoAreaData}>
                    <defs>
                      <linearGradient id="gradVencido" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="periodo" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v: number) => `${(v / 1e6).toFixed(1)}M`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="acumulado" name="Acumulado" stroke="#ef4444" fill="url(#gradVencido)" strokeWidth={2.5} dot={{ r: 4, fill: "#ef4444" }} />
                    <Bar dataKey="valor" name="Valor" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} opacity={0.7} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                  Sem dados de vencimento
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Linha 3: Resumo numérico */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <PctLabel value={currentData.novos_sacados.valor} total={totalCarteira} label="Novos Sacados" />
          <PctLabel value={currentData.partes_relacionadas.valor} total={totalCarteira} label="Partes Relacionadas" />
          <PctLabel value={currentData.substituidos_total.valor} total={totalCarteira} label="Substituídos" />
          <PctLabel value={currentData.sacados.especial.maior_valor} total={totalCarteira} label="Maior Sacado Especial" />
        </div>
      </TabsContent>

      {/* ─── ABA DETALHAMENTO ─────────────────────────────── */}
      <TabsContent value="detalhes" className="space-y-4" ref={detalhesRef}>
        <div className="flex justify-end">
          <PDFExport craName={selectedCra} contentRef={detalhesRef} type="detalhes" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Análise de Vencimento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Análise de Vencimento por Faixa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(currentData.vencidos_por_periodo).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Sem dados de vencimento</p>
                ) : (
                  Object.entries(currentData.vencidos_por_periodo).map(([periodo, dados], idx) => {
                    const pct = totalVencido > 0 ? (dados.valor / totalVencido) * 100 : 0;
                    return (
                      <div key={periodo} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg border border-border/40">
                        <div className="w-1.5 h-12 rounded-full" style={{ background: COLORS_VENCIMENTO[idx % COLORS_VENCIMENTO.length] }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <p className="font-medium text-sm">{periodo}</p>
                            <p className="text-sm font-bold">{formatCurrency(dados.valor)}</p>
                          </div>
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, background: COLORS_VENCIMENTO[idx % COLORS_VENCIMENTO.length] }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>{dados.quantidade} títulos</span>
                            <span>{pct.toFixed(1)}% do vencido</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Títulos Vencidos vs Vincendos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Composição por Quantidade</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Vencidos", value: currentData.vencidos_vincendos.vencidos.quantidade },
                      { name: "Vincendos", value: currentData.vencidos_vincendos.vincendos.quantidade },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {COLORS_PIE.map((c, i) => (
                      <Cell key={i} fill={c} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value} títulos`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <p className="text-xs font-medium text-red-800">Vencidos</p>
                  </div>
                  <p className="text-lg font-bold text-red-600">{currentData.vencidos_vincendos.vencidos.quantidade}</p>
                  <p className="text-xs text-red-500">{formatCurrencyShort(totalVencido)}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <p className="text-xs font-medium text-green-800">Vincendos</p>
                  </div>
                  <p className="text-lg font-bold text-green-600">{currentData.vencidos_vincendos.vincendos.quantidade}</p>
                  <p className="text-xs text-green-500">{formatCurrencyShort(totalVincendo)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Perfil de Sacados detalhado */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Perfil Detalhado de Sacados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {concentracaoData.map((item, i) => (
                  <div key={item.name} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS_SACADOS[i] }} />
                      <p className="font-semibold">{item.name}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-secondary/30 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Valor</p>
                        <p className="text-sm font-bold">{formatCurrencyShort(item.valor)}</p>
                      </div>
                      <div className="p-3 bg-secondary/30 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Títulos</p>
                        <p className="text-sm font-bold">{item.titulos}</p>
                      </div>
                      <div className="p-3 bg-secondary/30 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Sacados</p>
                        <p className="text-sm font-bold">{item.sacados}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">% da carteira</span>
                        <span className="font-medium">{item.pct.toFixed(1)}%</span>
                      </div>
                      <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${item.pct}%`, background: COLORS_SACADOS[i] }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}

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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PDFExport } from "./PDFExport";
import { formatCurrency } from "@/lib/formatters";
import type { CraData, ImageMappingMap } from "@shared/types";

interface CraDetailTabsProps {
  selectedCra: string;
  currentData: CraData;
  imageMapping: ImageMappingMap;
}

export function CraDetailTabs({ selectedCra, currentData, imageMapping }: CraDetailTabsProps) {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const detalhesRef = useRef<HTMLDivElement>(null);

  const imageName = imageMapping[selectedCra];
  const imageUrl = imageName ? `/images/graficos/${imageName}` : null;

  const vencimentoBarData = Object.entries(currentData.vencidos_por_periodo).map(([periodo, dados]) => ({
    periodo,
    quantidade: dados.quantidade,
    valor: dados.valor,
  }));

  return (
    <Tabs defaultValue="dashboard" className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList className="bg-secondary/50 border border-border p-1">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Dashboard Visual
          </TabsTrigger>
          <TabsTrigger value="detalhes" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Detalhamento de Dados
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="dashboard" className="space-y-4" ref={dashboardRef}>
        <div className="flex justify-end mb-4">
          <PDFExport craName={selectedCra} contentRef={dashboardRef} type="dashboard" />
        </div>

        {imageUrl ? (
          <Card>
            <CardHeader>
              <CardTitle>Gráfico da Carteira</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <img src={imageUrl} alt={`Gráfico ${selectedCra}`} className="max-w-full h-auto rounded-lg" />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Composição Vencidos vs Vincendos</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Vencidos", value: currentData.vencidos_vincendos.vencidos.valor },
                        { name: "Vincendos", value: currentData.vencidos_vincendos.vincendos.valor },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      <Cell fill="#ef4444" />
                      <Cell fill="#22c55e" />
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {vencimentoBarData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Vencimentos por Período</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vencimentoBarData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v: number) => `${(v / 1e6).toFixed(1)}M`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="valor" name="Valor" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Perfil de Sacados (Valor)</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Especiais", value: currentData.sacados.especial.valor },
                        { name: "Não Especiais", value: currentData.sacados.nao_especial.valor },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => value > 0 ? `${name}: ${formatCurrency(value)}` : ""}
                      outerRadius={100}
                      dataKey="value"
                    >
                      <Cell fill="#6366f1" />
                      <Cell fill="#06b6d4" />
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>

      <TabsContent value="detalhes" className="space-y-4" ref={detalhesRef}>
        <div className="flex justify-end mb-4">
          <PDFExport craName={selectedCra} contentRef={detalhesRef} type="detalhes" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Vencimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(currentData.vencidos_por_periodo).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Sem dados de vencimento por período</p>
                ) : (
                  Object.entries(currentData.vencidos_por_periodo).map(([periodo, dados]) => (
                    <div key={periodo} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/50">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-10 rounded-full ${
                            periodo.includes("0-30")
                              ? "bg-chart-4"
                              : periodo.includes("31-90")
                                ? "bg-orange-500"
                                : periodo.includes("91-120")
                                  ? "bg-chart-2"
                                  : "bg-red-700"
                          }`}
                        />
                        <div>
                          <p className="font-medium text-sm">{periodo}</p>
                          <p className="text-xs text-muted-foreground">{dados.quantidade} títulos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatCurrency(dados.valor)}</p>
                        <p className="text-xs text-muted-foreground">
                          {((dados.valor / (currentData.vencidos_vincendos.vencidos.valor || 1)) * 100).toFixed(1)}% do vencido
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Títulos Vencidos vs Vincendos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Vencidos", value: currentData.vencidos_vincendos.vencidos.quantidade },
                        { name: "Vincendos", value: currentData.vencidos_vincendos.vincendos.quantidade },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      <Cell fill="#ef4444" />
                      <Cell fill="#22c55e" />
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value} títulos`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid gap-4 md:grid-cols-2 mt-6">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <p className="text-sm font-medium text-red-900">Títulos Vencidos</p>
                  </div>
                  <p className="text-lg font-bold text-red-600">{currentData.vencidos_vincendos.vencidos.quantidade} títulos</p>
                  <p className="text-sm text-red-600 mt-1">{formatCurrency(currentData.vencidos_vincendos.vencidos.valor)}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <p className="text-sm font-medium text-green-900">Títulos Vincendos</p>
                  </div>
                  <p className="text-lg font-bold text-green-600">{currentData.vencidos_vincendos.vincendos.quantidade} títulos</p>
                  <p className="text-sm text-green-600 mt-1">{formatCurrency(currentData.vencidos_vincendos.vincendos.valor)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Perfil de Sacados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sacados Especiais</span>
                    <span className="font-medium">{formatCurrency(currentData.sacados.especial.valor)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(currentData.sacados.especial.valor / currentData.valor_total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {currentData.sacados.especial.quantidade} títulos &bull; {currentData.sacados.especial.sacados_unicos} sacados únicos
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sacados Não Especiais</span>
                    <span className="font-medium">{formatCurrency(currentData.sacados.nao_especial.valor)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-chart-3"
                      style={{ width: `${(currentData.sacados.nao_especial.valor / currentData.valor_total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {currentData.sacados.nao_especial.quantidade} títulos &bull; {currentData.sacados.nao_especial.sacados_unicos} sacados únicos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}

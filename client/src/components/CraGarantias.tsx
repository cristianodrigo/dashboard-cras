import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import type { EmissionData, GarantiasData, GarantiasEditaveis } from "@shared/types";

interface CraGarantiasProps {
  selectedCra: string;
  emission: EmissionData | undefined;
  garantias: GarantiasData | undefined;
  garantiasEditaveis: GarantiasEditaveis;
  onSave: (cra: string, campo: "valor_minimo" | "valor_coberto", valor: string) => void;
}

export function CraGarantias({ selectedCra, emission, garantias, garantiasEditaveis, onSave }: CraGarantiasProps) {
  const [editing, setEditing] = useState<Set<string>>(new Set());

  const toggleEditing = (key: string) => {
    setEditing((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const editaveis = garantiasEditaveis[selectedCra] || {};

  const renderEditableField = (label: string, campo: "valor_minimo" | "valor_coberto", originalValue: number) => {
    const editKey = `${selectedCra}_${campo}`;
    const isEditing = editing.has(editKey);
    const savedValue = editaveis[campo];

    return (
      <div className="p-4 bg-secondary/10 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground mb-2">{label}</p>
        {isEditing ? (
          <div className="flex gap-2">
            <input
              type="text"
              defaultValue={savedValue || ""}
              onChange={(e) => onSave(selectedCra, campo, e.target.value)}
              placeholder="Ex: 1000000"
              className="flex-1 px-2 py-1 border border-border rounded text-sm"
            />
            <button
              onClick={() => toggleEditing(editKey)}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Salvar
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">
              {savedValue
                ? formatCurrency(parseFloat(savedValue))
                : originalValue > 0
                  ? formatCurrency(originalValue)
                  : "Não informado"}
            </p>
            <button
              onClick={() => toggleEditing(editKey)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Editar
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="bg-secondary/20 border-b border-border">
          <CardTitle>Garantias da Operação</CardTitle>
          <CardDescription>Informações sobre as garantias que respaldam a emissão</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="p-4 bg-secondary/10 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">Descrição da Garantia</p>
              <p className="text-sm font-medium leading-relaxed">
                {emission?.garantia || "Informação não disponível"}
              </p>
            </div>

            {garantias && (
              <>
                {renderEditableField("Valor Mínimo de Garantia", "valor_minimo", garantias.valor_minimo)}
                {renderEditableField("Valor de Garantia Coberta", "valor_coberto", garantias.valor_coberto)}

                {garantias.valor_minimo > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-muted-foreground mb-2">% de Cobertura</p>
                    <p className="text-lg font-bold text-blue-600">
                      {((garantias.valor_coberto / garantias.valor_minimo) * 100).toFixed(2)}%
                    </p>
                    <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{
                          width: `${Math.min((garantias.valor_coberto / garantias.valor_minimo) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="bg-secondary/20 border-b border-border">
          <CardTitle>Lastros da Securitização</CardTitle>
          <CardDescription>Composição dos ativos que respaldam a emissão</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="p-4 bg-secondary/10 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">Tipo de Lastro</p>
              <p className="text-sm font-medium">{emission?.lastro || "Informação não disponível"}</p>
            </div>
            <div className="p-4 bg-secondary/10 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">Taxa do Lastro</p>
              <p className="text-sm font-medium">{emission?.taxa_lastro || "Informação não disponível"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

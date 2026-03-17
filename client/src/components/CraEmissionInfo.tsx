import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import type { EmissionData, PaymentDates } from "@shared/types";

interface CraEmissionInfoProps {
  emission: EmissionData | undefined;
  payment: PaymentDates | undefined;
}

export function CraEmissionInfo({ emission, payment }: CraEmissionInfoProps) {
  return (
    <Card className="overflow-hidden border-border shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Informações da Emissão</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Volume da Emissão</p>
            <p className="text-lg font-semibold text-blue-600">
              {emission?.volume ? formatCurrency(emission.volume) : "-"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Próx. Pagamento de Juros</p>
            <p className="text-lg font-semibold text-blue-600">
              {payment?.proximo_pagamento_juros || "-"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Próx. Amortização</p>
            <p className="text-lg font-semibold text-blue-600">
              {payment?.proximo_pagamento_amortizacao || emission?.data_vencimento || "-"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Data de Vencimento</p>
            <p className="text-lg font-semibold text-blue-600">
              {emission?.data_vencimento || "-"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

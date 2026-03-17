import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LimitCardProps {
  title: string;
  value: number;
  limit?: number;
  icon: React.ReactNode;
  borderColor: string;
  format?: "currency" | "number";
  subtitle?: string;
}

export function LimitCard({ title, value, limit, icon, borderColor, format = "currency", subtitle }: LimitCardProps) {
  const formatValue = (val: number) => {
    if (format === "currency") {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0
      }).format(val);
    }
    return val.toLocaleString('pt-BR');
  };

  const isExceeded = limit !== undefined && value > limit;
  const isWarning = limit !== undefined && value > (limit * 0.8);

  return (
    <Card className={`border-l-4 shadow-sm hover:shadow-md transition-shadow ${borderColor}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {icon}
          {isExceeded ? (
            <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
          ) : isWarning ? (
            <Info className="h-4 w-4 text-chart-4" />
          ) : limit ? (
            <CheckCircle2 className="h-4 w-4 text-chart-1" />
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{formatValue(value)}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {limit !== undefined && (
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Limite:</span>
              <span className={`font-semibold ${isExceeded ? 'text-destructive' : isWarning ? 'text-chart-4' : 'text-chart-1'}`}>
                {formatValue(limit)}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  isExceeded ? 'bg-destructive' : isWarning ? 'bg-chart-4' : 'bg-chart-1'
                }`}
                style={{ width: `${Math.min((value / limit) * 100, 100)}%` }}
              ></div>
            </div>
            {isExceeded && (
              <p className="text-xs text-destructive font-semibold">
                ⚠️ Limite ultrapassado em {formatValue(value - limit)}
              </p>
            )}
            {isWarning && !isExceeded && (
              <p className="text-xs text-chart-4 font-semibold">
                ⚠️ Atenção: {((value / limit) * 100).toFixed(0)}% do limite
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

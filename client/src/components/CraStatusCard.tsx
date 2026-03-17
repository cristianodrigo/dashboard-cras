import type { CraData, CraStatus } from "@shared/types";
import { formatCurrency } from "@/lib/formatters";
import { getStatusBadgeClasses, getStatusDotColor, getStatusLabel } from "@/lib/status";

interface CraStatusCardProps {
  craName: string;
  craData: CraData | undefined;
  status: CraStatus;
  statusReason: string;
  onSelect: (cra: string) => void;
  onStatusChange: (cra: string, status: CraStatus) => void;
}

export function CraStatusCard({ craName, craData, status, statusReason, onSelect, onStatusChange }: CraStatusCardProps) {
  return (
    <div
      onClick={() => onSelect(craName)}
      className="p-4 rounded-lg border border-border cursor-pointer hover:shadow-md transition-shadow bg-card"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-sm line-clamp-2">{craName}</h3>
        </div>
        <div className={`flex-shrink-0 ml-2 w-4 h-4 rounded-full ${getStatusDotColor(status)}`} />
      </div>

      <div className="space-y-2 text-xs">
        {status === "encerrado" || !craData ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground font-medium">Sem títulos em carteira</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Total:</span>
              <span className="font-medium">{formatCurrency(craData.valor_total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vencidos:</span>
              <span className="font-medium text-red-600">{craData.vencidos_vincendos.vencidos.quantidade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vincendos:</span>
              <span className="font-medium text-green-600">{craData.vencidos_vincendos.vincendos.quantidade}</span>
            </div>
          </>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusBadgeClasses(status)}`}>
              {getStatusLabel(status)}
            </span>
            {status !== "encerrado" && (
              <select
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onStatusChange(craName, e.target.value as CraStatus)}
                value={status}
                className="text-xs px-2 py-1 rounded border border-border bg-background cursor-pointer"
              >
                <option value="verde">Verde</option>
                <option value="amarelo">Amarelo</option>
                <option value="vermelho">Vermelho</option>
              </select>
            )}
          </div>
          {statusReason && status !== "encerrado" && (
            <div className="text-xs text-muted-foreground italic">{statusReason}</div>
          )}
        </div>
      </div>
    </div>
  );
}

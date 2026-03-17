import { Calendar } from "lucide-react";
import { useState } from "react";
import { CraStatusCard } from "./CraStatusCard";
import { CsvUploader } from "./CsvUploader";
import { calculateCraStatus, STATUS_FILTER_MAP } from "@/lib/status";
import type {
  AllCraData,
  AllLimitesConcentracao,
  CraStatus,
  ManualStatusMap,
} from "@shared/types";

interface CraOverviewProps {
  data: AllCraData;
  uniqueCras: string[];
  limites: AllLimitesConcentracao;
  manualStatus: ManualStatusMap;
  encerradosCras: string[];
  onSelectCra: (cra: string) => void;
  onStatusChange: (cra: string, status: CraStatus) => void;
  onDataUpdate: (data: AllCraData) => void;
}

export function CraOverview({
  data,
  uniqueCras,
  limites,
  manualStatus,
  encerradosCras,
  onSelectCra,
  onStatusChange,
  onDataUpdate,
}: CraOverviewProps) {
  const [statusFilter, setStatusFilter] = useState("todos");

  const filterButtons = [
    { key: "todos", label: "Todos", active: "bg-primary text-primary-foreground shadow-md", inactive: "bg-secondary text-secondary-foreground hover:bg-secondary/80" },
    { key: "green", label: "Verde", active: "bg-green-600 text-white shadow-md", inactive: "bg-green-100 text-green-800 hover:bg-green-200" },
    { key: "yellow", label: "Amarelo", active: "bg-yellow-600 text-white shadow-md", inactive: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
    { key: "red", label: "Vermelho", active: "bg-red-600 text-white shadow-md", inactive: "bg-red-100 text-red-800 hover:bg-red-200" },
    { key: "gray", label: "Encerrado", active: "bg-gray-600 text-white shadow-md", inactive: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-muted-foreground mt-1">
            Status de todos os CRAs com indicadores de risco
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <Calendar className="inline-block mr-2 h-4 w-4" />
          {new Date().toLocaleDateString("pt-BR")}
        </div>
      </div>

      <CsvUploader onDataUpdate={onDataUpdate} onSelectCra={onSelectCra} />

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filterButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => setStatusFilter(btn.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              statusFilter === btn.key ? btn.active : btn.inactive
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {uniqueCras.map((craName) => {
          const { status, reason } = calculateCraStatus(
            craName,
            data,
            limites,
            manualStatus,
            encerradosCras,
          );
          const filterColor = STATUS_FILTER_MAP[status];

          if (statusFilter !== "todos" && filterColor !== statusFilter) return null;

          return (
            <CraStatusCard
              key={craName}
              craName={craName}
              craData={data[craName]}
              status={status}
              statusReason={reason}
              onSelect={onSelectCra}
              onStatusChange={onStatusChange}
            />
          );
        })}
      </div>
    </>
  );
}

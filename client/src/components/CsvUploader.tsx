import type { AllCraData, CraData } from "@shared/types";

interface CsvUploaderProps {
  onDataUpdate: (data: AllCraData) => void;
  onSelectCra: (cra: string) => void;
}

function parseCsvLine(csv: string): AllCraData {
  const lines = csv.split("\n");
  const newData: AllCraData = {};

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = lines[i].split(";");
    const craName = values[0]?.trim();

    if (!craName || craName === "Nome do CRA") continue;

    if (!newData[craName]) {
      newData[craName] = {
        nome: craName,
        total_titulos: 0,
        valor_total: 0,
        vencidos_vincendos: {
          vencidos: { quantidade: 0, valor: 0 },
          vincendos: { quantidade: 0, valor: 0 },
        },
        vencidos_por_periodo: {},
        sacados: {
          especial: { quantidade: 0, valor: 0, sacados_unicos: 0, maior_valor: 0 },
          nao_especial: { quantidade: 0, valor: 0, sacados_unicos: 0, maior_valor: 0 },
        },
        novos_sacados: { quantidade: 0, valor: 0, sacados_unicos: 0 },
        substituidos_total: { quantidade: 0, valor: 0 },
        partes_relacionadas: { quantidade: 0, valor: 0, sacados_unicos: 0 },
      } satisfies CraData;
    }

    const valorFace = parseFloat(values[9]?.replace(",", ".") || "0");
    const status = values[18]?.trim().toUpperCase();
    const parteRelacionada = values[32]?.trim().toUpperCase() === "SIM";
    const especial = values[33]?.trim().toUpperCase() === "SIM";

    const cra = newData[craName];
    cra.total_titulos += 1;
    cra.valor_total += valorFace;

    if (["LIQUIDADO", "VENCIDO"].includes(status)) {
      cra.vencidos_vincendos.vencidos.quantidade += 1;
      cra.vencidos_vincendos.vencidos.valor += valorFace;
    } else {
      cra.vencidos_vincendos.vincendos.quantidade += 1;
      cra.vencidos_vincendos.vincendos.valor += valorFace;
    }

    if (parteRelacionada) {
      cra.partes_relacionadas.quantidade += 1;
      cra.partes_relacionadas.valor += valorFace;
    }

    if (especial) {
      cra.sacados.especial.quantidade += 1;
      cra.sacados.especial.valor += valorFace;
    } else {
      cra.sacados.nao_especial.quantidade += 1;
      cra.sacados.nao_especial.valor += valorFace;
    }
  }

  return newData;
}

export function CsvUploader({ onDataUpdate, onSelectCra }: CsvUploaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const newData = parseCsvLine(csv);
      onDataUpdate(newData);
      const newCras = Object.keys(newData);
      if (newCras.length > 0) onSelectCra(newCras[0]);
      alert(`Dados atualizados com sucesso! ${newCras.length} CRAs carregados.`);
    };
    reader.readAsText(file);

    e.target.value = "";
  };

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-blue-900 mb-1">Atualizar Dados da Carteira</h3>
          <p className="text-sm text-blue-700">
            Faça upload de um arquivo CSV para atualizar os dados dos CRAs
          </p>
        </div>
        <label className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium cursor-pointer hover:bg-blue-700 transition-all">
          <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          Escolher Arquivo
        </label>
      </div>
    </div>
  );
}

import { DashboardLayout } from "@/components/DashboardLayout";
import { CraDetail } from "@/components/CraDetail";
import { CraOverview } from "@/components/CraOverview";
import { useDashboard } from "@/hooks/useDashboard";
import { useState } from "react";

export default function Home() {
  const dashboard = useDashboard();
  const [selectedCra, setSelectedCra] = useState<string>("Visão Geral");

  if (dashboard.loading) {
    return (
      <DashboardLayout cras={[]} onSelectCra={() => {}} selectedCra="">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboard.data || dashboard.error) {
    return (
      <DashboardLayout cras={[]} onSelectCra={() => {}} selectedCra="">
        <div className="text-center py-12">
          <p className="text-muted-foreground">{dashboard.error || "Erro ao carregar dados"}</p>
        </div>
      </DashboardLayout>
    );
  }

  const currentData = dashboard.data[selectedCra];

  const handleSelectCra = (cra: string) => {
    setSelectedCra(cra);
  };

  const handleDeleteCra = async (craName: string) => {
    await dashboard.deleteCra(craName);
    if (selectedCra === craName) setSelectedCra("Visão Geral");
  };

  return (
    <DashboardLayout
      cras={dashboard.uniqueCras}
      onSelectCra={handleSelectCra}
      selectedCra={selectedCra}
      onDeleteCra={handleDeleteCra}
    >
      <div className="space-y-6">
        {selectedCra !== "Visão Geral" && currentData ? (
          <CraDetail
            selectedCra={selectedCra}
            currentData={currentData}
            emission={dashboard.emissions[selectedCra]}
            payment={dashboard.paymentDates[selectedCra]}
            limits={dashboard.limitsPreenchidos[selectedCra]}
            garantias={dashboard.garantias[selectedCra]}
            garantiasEditaveis={dashboard.garantiasEditaveis}
            imageMapping={dashboard.imageMapping}
            onSaveGarantia={dashboard.saveGarantia}
          />
        ) : (
          <CraOverview
            data={dashboard.data}
            uniqueCras={dashboard.uniqueCras}
            limites={dashboard.limites}
            manualStatus={dashboard.manualStatus}
            encerradosCras={dashboard.encerradosCras}
            onSelectCra={handleSelectCra}
            onStatusChange={dashboard.updateManualStatus}
            onDataUpdate={dashboard.setData}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

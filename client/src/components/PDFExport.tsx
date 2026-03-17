import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import html2pdf from "html2pdf.js";

interface PDFExportProps {
  craName: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
  type: "dashboard" | "detalhes";
}

export function PDFExport({ craName, contentRef, type }: PDFExportProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!contentRef.current) return;

    setLoading(true);
    try {
      const element = contentRef.current;
      const filename = `${craName.replace(/[^a-z0-9]/gi, "_")}_${type}_${new Date().toISOString().split("T")[0]}.pdf`;

      await html2pdf()
        .set({
          margin: 10,
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
        })
        .from(element)
        .save();
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={loading} size="sm" className="gap-2" variant="outline">
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Exportar PDF
        </>
      )}
    </Button>
  );
}

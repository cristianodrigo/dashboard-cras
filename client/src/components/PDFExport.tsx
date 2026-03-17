import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";

interface PDFExportProps {
  craName: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
  type: "dashboard" | "detalhes";
}

function collectStyles(): string {
  const parts: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        parts.push(rule.cssText);
      }
    } catch {
      if (sheet.href) {
        parts.push(`@import url("${sheet.href}");`);
      }
    }
  }
  return parts.join("\n");
}

export function PDFExport({ craName, contentRef, type }: PDFExportProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = useCallback(async () => {
    const element = contentRef.current;
    if (!element) return;

    setLoading(true);
    try {
      const filename = `${craName.replace(/[^a-z0-9]/gi, "_")}_${type}_${new Date().toISOString().split("T")[0]}`;

      const clone = element.cloneNode(true) as HTMLElement;
      clone.querySelectorAll("button").forEach((btn) => btn.remove());

      const styles = collectStyles();

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Permita pop-ups para exportar o PDF.");
        return;
      }

      printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${filename}</title>
  <style>${styles}</style>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #1a1a2e;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      padding: 24px;
      max-width: 1100px;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  ${clone.outerHTML}
</body>
</html>`);

      printWindow.document.close();

      await new Promise<void>((resolve) => {
        printWindow.onload = () => resolve();
        setTimeout(resolve, 2000);
      });

      await new Promise((r) => setTimeout(r, 500));

      printWindow.focus();
      printWindow.print();
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
    } finally {
      setLoading(false);
    }
  }, [contentRef, craName, type]);

  return (
    <Button onClick={handleExport} disabled={loading} size="sm" className="gap-2" variant="outline">
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Gerando PDF...
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

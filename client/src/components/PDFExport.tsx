import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";

interface PDFExportProps {
  craName: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
  type: "dashboard" | "detalhes";
}

const OKLCH_RE = /oklch\([^)]+\)/gi;

function oklchToRgb(oklch: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return oklch;
  ctx.fillStyle = oklch;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return a < 255 ? `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})` : `rgb(${r}, ${g}, ${b})`;
}

function replaceOklchInValue(value: string): string {
  return value.replace(OKLCH_RE, (match) => oklchToRgb(match));
}

function resolveOklchVars(el: HTMLElement) {
  const computed = getComputedStyle(el);
  const colorProps = [
    "color",
    "background-color",
    "background",
    "border-color",
    "border-top-color",
    "border-right-color",
    "border-bottom-color",
    "border-left-color",
    "outline-color",
    "box-shadow",
    "text-decoration-color",
    "fill",
    "stroke",
    "stop-color",
  ];

  for (const prop of colorProps) {
    const val = computed.getPropertyValue(prop);
    if (val && OKLCH_RE.test(val)) {
      el.style.setProperty(prop, replaceOklchInValue(val), "important");
    }
  }

  const inlineStyle = el.getAttribute("style") || "";
  if (OKLCH_RE.test(inlineStyle)) {
    el.setAttribute("style", replaceOklchInValue(inlineStyle));
  }
}

function resolveOklchCssVarsOnRoot(el: HTMLElement) {
  const computed = getComputedStyle(document.documentElement);
  const rootStyle = document.documentElement.style;
  const cssText = Array.from(document.styleSheets)
    .flatMap((s) => {
      try {
        return Array.from(s.cssRules);
      } catch {
        return [];
      }
    })
    .map((r) => r.cssText)
    .join("\n");

  const varMatches = cssText.match(/--[\w-]+/g);
  if (!varMatches) return;

  const uniqueVars = [...new Set(varMatches)];
  for (const v of uniqueVars) {
    const val = computed.getPropertyValue(v).trim();
    if (val && OKLCH_RE.test(val)) {
      el.style.setProperty(v, replaceOklchInValue(val));
    }
  }

  void rootStyle;
}

export function PDFExport({ craName, contentRef, type }: PDFExportProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = useCallback(async () => {
    const element = contentRef.current;
    if (!element) return;

    setLoading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const filename = `${craName.replace(/[^a-z0-9]/gi, "_")}_${type}_${new Date().toISOString().split("T")[0]}.pdf`;

      const clone = element.cloneNode(true) as HTMLElement;

      clone.style.width = "1100px";
      clone.style.padding = "24px";
      clone.style.background = "#ffffff";
      clone.style.color = "#1a1a2e";

      clone.querySelectorAll("button").forEach((btn) => btn.remove());

      clone.querySelectorAll(".recharts-responsive-container").forEach((container) => {
        const svg = container.querySelector("svg");
        if (svg) {
          const box =
            svg.getAttribute("viewBox") ||
            `0 0 ${svg.getAttribute("width") || 500} ${svg.getAttribute("height") || 320}`;
          svg.setAttribute("viewBox", box);
          svg.setAttribute("width", "100%");
          svg.setAttribute("height", "320");
          svg.style.maxWidth = "100%";
        }
      });

      const wrapper = document.createElement("div");
      wrapper.style.position = "absolute";
      wrapper.style.left = "-9999px";
      wrapper.style.top = "0";
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      resolveOklchCssVarsOnRoot(clone);
      clone.querySelectorAll("*").forEach((child) => resolveOklchVars(child as HTMLElement));
      resolveOklchVars(clone);

      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true,
            backgroundColor: "#ffffff",
            windowWidth: 1100,
          },
          jsPDF: { orientation: "landscape", unit: "mm", format: "a4" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .from(clone)
        .save();

      document.body.removeChild(wrapper);
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

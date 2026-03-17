import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { BarChart3, LayoutDashboard, Menu, PieChart, Search } from "lucide-react";
import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  cras: string[];
  onSelectCra: (cra: string) => void;
  selectedCra: string;
  onDeleteCra?: (cra: string) => void;
}

export function DashboardLayout({ children, cras, onSelectCra, selectedCra, onDeleteCra }: DashboardLayoutProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredCras = cras.filter((cra) =>
    cra.toLowerCase().includes(search.toLowerCase())
  );

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo-gci.png" alt="Grupo Ceres Investimentos" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="font-bold text-sm leading-tight">Grupo Ceres</h1>
            <span className="text-xs text-muted-foreground font-medium">Investimento</span>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar CRA..."
            className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 py-4">
        <div className="px-4 space-y-1">
          <Button
            variant={selectedCra === "Visão Geral" ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start font-medium",
              selectedCra === "Visão Geral" && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
            )}
            onClick={() => {
              onSelectCra("Visão Geral");
              setIsOpen(false);
            }}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Visão Geral
          </Button>
          
          <div className="pt-4 pb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Carteiras ({filteredCras.length})
          </div>
          
          {filteredCras.map((cra) => (
            <div key={cra} className="flex items-center gap-1 group">
              <Button
                variant={selectedCra === cra ? "secondary" : "ghost"}
                className={cn(
                  "flex-1 justify-start text-sm h-auto py-2 whitespace-normal text-left",
                  selectedCra === cra && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                )}
                onClick={() => {
                  onSelectCra(cra);
                  setIsOpen(false);
                }}
              >
                <PieChart className="mr-2 h-4 w-4 shrink-0" />
                <span className="line-clamp-2">{cra}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-auto py-2 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDeleteCra && confirm(`Tem certeza que deseja excluir permanentemente "${cra}"?`)) {
                    onDeleteCra(cra);
                  }
                }}
                title="Excluir CRA permanentemente"
              >
                ×
              </Button>
            </div>
          ))}
          
          {filteredCras.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhum CRA encontrado
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/20">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            CI
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">Ceres Investimentos</p>
            <p className="text-xs text-muted-foreground truncate">Dashboard Analítico</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 fixed inset-y-0 left-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0 transition-all duration-300 ease-in-out">
        <header className="lg:hidden flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold">Ceres Investimentos</span>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

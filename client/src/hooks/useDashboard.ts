import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { sortCrasNumerically } from "@/lib/formatters";
import type {
  AllCraData,
  AllEmissionData,
  AllGarantiasData,
  AllLimitesConcentracao,
  AllLimitsPreenchidos,
  AllPaymentDates,
  AllTopDevedores,
  CraStatus,
  GarantiasEditaveis,
  ImageMappingMap,
  ManualStatusMap,
  ScatterDataMap,
} from "@shared/types";

export interface DashboardState {
  data: AllCraData | null;
  emissions: AllEmissionData;
  paymentDates: AllPaymentDates;
  garantias: AllGarantiasData;
  limites: AllLimitesConcentracao;
  limitsPreenchidos: AllLimitsPreenchidos;
  imageMapping: ImageMappingMap;
  encerradosCras: string[];
  topDevedores: AllTopDevedores;
  scatterData: ScatterDataMap;
  manualStatus: ManualStatusMap;
  garantiasEditaveis: GarantiasEditaveis;
  deletedCras: Set<string>;
  loading: boolean;
  error: string | null;
  uniqueCras: string[];
}

export interface DashboardActions {
  updateManualStatus: (craName: string, status: CraStatus) => Promise<void>;
  deleteCra: (craName: string) => Promise<void>;
  saveGarantia: (cra: string, campo: "valor_minimo" | "valor_coberto", valor: string) => Promise<void>;
  setData: (data: AllCraData) => void;
}

export function useDashboard(): DashboardState & DashboardActions {
  const [data, setData] = useState<AllCraData | null>(null);
  const [emissions, setEmissions] = useState<AllEmissionData>({});
  const [paymentDates, setPaymentDates] = useState<AllPaymentDates>({});
  const [garantias, setGarantias] = useState<AllGarantiasData>({});
  const [limites, setLimites] = useState<AllLimitesConcentracao>({});
  const [limitsPreenchidos, setLimitsPreenchidos] = useState<AllLimitsPreenchidos>({});
  const [imageMapping, setImageMapping] = useState<ImageMappingMap>({});
  const [encerradosCras, setEncerradosCras] = useState<string[]>([]);
  const [topDevedores, setTopDevedores] = useState<AllTopDevedores>({});
  const [scatterData, setScatterData] = useState<ScatterDataMap>({});
  const [manualStatus, setManualStatus] = useState<ManualStatusMap>({});
  const [garantiasEditaveis, setGarantiasEditaveis] = useState<GarantiasEditaveis>({});
  const [deletedCras, setDeletedCras] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getDashboard()
      .then((res) => {
        setData(res.cras);
        setEmissions(res.emissions);
        setPaymentDates(res.paymentDates);
        setGarantias(res.garantias);
        setLimites(res.limites);
        setLimitsPreenchidos(res.limitsPreenchidos);
        setImageMapping(res.imageMapping);
        setEncerradosCras(res.encerrados.encerrados || []);
        setTopDevedores(res.topDevedores);
        setScatterData(res.scatterData);
        setManualStatus(res.manualStatus);
        setGarantiasEditaveis(res.garantiasEditaveis);
        setDeletedCras(new Set(res.deletedCras));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar dados:", err);
        setError("Erro ao carregar dados do servidor.");
        setLoading(false);
      });
  }, []);

  const allCras = data ? Object.keys(data) : [];
  const allCrasWithEncerrados = [...allCras, ...encerradosCras];
  const filtered = allCrasWithEncerrados.filter((cra) => !deletedCras.has(cra));
  const uniqueCras = Array.from(new Set(sortCrasNumerically(filtered)));

  const updateManualStatus = useCallback(
    async (craName: string, status: CraStatus) => {
      setManualStatus((prev) => ({ ...prev, [craName]: status }));
      try {
        await api.setManualStatus(craName, status);
      } catch (err) {
        console.error("Erro ao atualizar status:", err);
      }
    },
    [],
  );

  const deleteCra = useCallback(async (craName: string) => {
    setDeletedCras((prev) => {
      const next = new Set(prev);
      next.add(craName);
      return next;
    });
    try {
      await api.deleteCra(craName);
    } catch (err) {
      console.error("Erro ao deletar CRA:", err);
    }
  }, []);

  const saveGarantia = useCallback(
    async (cra: string, campo: "valor_minimo" | "valor_coberto", valor: string) => {
      setGarantiasEditaveis((prev) => ({
        ...prev,
        [cra]: { ...prev[cra], [campo]: valor },
      }));
      try {
        await api.updateGarantias(cra, { [campo]: valor });
      } catch (err) {
        console.error("Erro ao salvar garantia:", err);
      }
    },
    [],
  );

  return {
    data,
    emissions,
    paymentDates,
    garantias,
    limites,
    limitsPreenchidos,
    imageMapping,
    encerradosCras,
    topDevedores,
    scatterData,
    manualStatus,
    garantiasEditaveis,
    deletedCras,
    loading,
    error,
    uniqueCras,
    updateManualStatus,
    deleteCra,
    saveGarantia,
    setData,
  };
}

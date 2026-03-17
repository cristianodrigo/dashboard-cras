import { Router, json } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db from "./db.js";
import type {
  AllCraData,
  AllEmissionData,
  AllGarantiasData,
  AllLimitesConcentracao,
  AllLimitsPreenchidos,
  AllPaymentDates,
  AllTopDevedores,
  DashboardDataResponse,
  EncerradosData,
  GarantiasEditaveis,
  ImageMappingMap,
  ManualStatusMap,
  ScatterDataMap,
} from "../shared/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
router.use(json());

function jsonDir(): string {
  const env = process.env.JSON_DATA_DIR;
  if (env) return env;

  const prodPath = path.resolve(__dirname, "public", "data");
  if (fs.existsSync(prodPath)) return path.resolve(__dirname, "public");

  return path.resolve(__dirname, "..", "client", "public");
}

function readJson<T>(relativePath: string, fallback: T): T {
  try {
    const base = jsonDir();
    const filePath = path.resolve(base, relativePath);
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

// ─── GET /api/dashboard ────────────────────────────────────────
router.get("/api/dashboard", (_req, res) => {
  const cras = readJson<AllCraData>("data/resultados_cras.json", {});
  const emissions = readJson<AllEmissionData>("data/emission_data.json", {});
  const paymentDates = readJson<AllPaymentDates>("data/payment_dates.json", {});
  const garantias = readJson<AllGarantiasData>("data/garantias_cras.json", {});
  const limites = readJson<AllLimitesConcentracao>("data/limites_concentracao.json", {});
  const limitsPreenchidos = readJson<AllLimitsPreenchidos>("limites_preenchidos.json", {});
  const imageMapping = readJson<ImageMappingMap>("cra_image_mapping.json", {});
  const encerrados = readJson<EncerradosData>("data/cras_encerrados.json", { encerrados: [], total_encerrados: 0, total_ativos: 0, total_esperado: 0 });
  const topDevedores = readJson<AllTopDevedores>("data/top_devedores.json", {});
  const scatterData = readJson<ScatterDataMap>("data/scatter_data.json", {});

  const manualStatusRows = db.prepare("SELECT cra_name, status FROM manual_status").all() as { cra_name: string; status: string }[];
  const manualStatus: ManualStatusMap = {};
  for (const row of manualStatusRows) {
    manualStatus[row.cra_name] = row.status as ManualStatusMap[string];
  }

  const deletedRows = db.prepare("SELECT cra_name FROM deleted_cras").all() as { cra_name: string }[];
  const deletedCras = deletedRows.map((r) => r.cra_name);

  const garantiasRows = db.prepare("SELECT cra_name, valor_minimo, valor_coberto FROM garantias_editaveis").all() as { cra_name: string; valor_minimo: string | null; valor_coberto: string | null }[];
  const garantiasEditaveis: GarantiasEditaveis = {};
  for (const row of garantiasRows) {
    garantiasEditaveis[row.cra_name] = {};
    if (row.valor_minimo) garantiasEditaveis[row.cra_name].valor_minimo = row.valor_minimo;
    if (row.valor_coberto) garantiasEditaveis[row.cra_name].valor_coberto = row.valor_coberto;
  }

  const response: DashboardDataResponse = {
    cras,
    emissions,
    paymentDates,
    garantias,
    limites,
    limitsPreenchidos,
    imageMapping,
    encerrados,
    topDevedores,
    scatterData,
    manualStatus,
    garantiasEditaveis,
    deletedCras,
  };

  res.json(response);
});

// ─── PUT /api/manual-status/:cra ──────────────────────────────
router.put("/api/manual-status/:cra", (req, res) => {
  const craName = req.params.cra;
  const { status } = req.body as { status: string };

  if (!["verde", "amarelo", "vermelho"].includes(status)) {
    return res.status(400).json({ error: "Status inválido" });
  }

  db.prepare(
    `INSERT INTO manual_status (cra_name, status, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(cra_name) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at`
  ).run(craName, status);

  res.json({ ok: true });
});

// ─── DELETE /api/manual-status/:cra ───────────────────────────
router.delete("/api/manual-status/:cra", (req, res) => {
  db.prepare("DELETE FROM manual_status WHERE cra_name = ?").run(req.params.cra);
  res.json({ ok: true });
});

// ─── POST /api/deleted-cras ───────────────────────────────────
router.post("/api/deleted-cras", (req, res) => {
  const { cra_name } = req.body as { cra_name: string };
  if (!cra_name) return res.status(400).json({ error: "cra_name obrigatório" });

  db.prepare(
    `INSERT OR IGNORE INTO deleted_cras (cra_name, deleted_at) VALUES (?, datetime('now'))`
  ).run(cra_name);

  res.json({ ok: true });
});

// ─── DELETE /api/deleted-cras/:cra ────────────────────────────
router.delete("/api/deleted-cras/:cra", (req, res) => {
  db.prepare("DELETE FROM deleted_cras WHERE cra_name = ?").run(req.params.cra);
  res.json({ ok: true });
});

// ─── PUT /api/garantias-editaveis/:cra ────────────────────────
router.put("/api/garantias-editaveis/:cra", (req, res) => {
  const craName = req.params.cra;
  const { valor_minimo, valor_coberto } = req.body as { valor_minimo?: string; valor_coberto?: string };

  db.prepare(
    `INSERT INTO garantias_editaveis (cra_name, valor_minimo, valor_coberto, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(cra_name) DO UPDATE SET
       valor_minimo = COALESCE(excluded.valor_minimo, garantias_editaveis.valor_minimo),
       valor_coberto = COALESCE(excluded.valor_coberto, garantias_editaveis.valor_coberto),
       updated_at = excluded.updated_at`
  ).run(craName, valor_minimo ?? null, valor_coberto ?? null);

  res.json({ ok: true });
});

export default router;

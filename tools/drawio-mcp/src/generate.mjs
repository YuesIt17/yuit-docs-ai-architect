import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
} from "node:fs";
import { dirname, join, resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { renderDiagram, parseManifestSpec } from "./render-spec.mjs";

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPO_ROOT = resolve(PKG_ROOT, "../..");

/** Convention: {hwId}/diagrams/_dev/specs/manifest.json (legacy: drawio/specs) */
export function getHwSpecsDir(hwId) {
  const devSpecs = join(REPO_ROOT, hwId, "diagrams", "_dev", "specs");
  if (existsSync(join(devSpecs, "manifest.json"))) {
    return devSpecs;
  }
  return join(REPO_ROOT, hwId, "diagrams", "drawio", "specs");
}

export function getRepoRoot() {
  return REPO_ROOT;
}

export function resolvePath(path, base = REPO_ROOT) {
  return isAbsolute(path) ? path : resolve(base, path);
}

export function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function writeDrawio(outputPath, xml) {
  const abs = resolvePath(outputPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, xml, "utf8");
  return abs;
}

export function loadDiagramSpec(specPath) {
  const abs = resolvePath(specPath);
  return readJson(abs);
}

export function loadManifest(hwId) {
  const manifestPath = join(getHwSpecsDir(hwId), "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error(`Manifest not found for ${hwId}: ${manifestPath}`);
  }
  return parseManifestSpec(readJson(manifestPath));
}

export function listAvailableHwIds() {
  if (!existsSync(REPO_ROOT)) {
    return [];
  }
  return readdirSync(REPO_ROOT).filter((name) => {
    if (!name.startsWith("hw-")) {
      return false;
    }
    return existsSync(join(getHwSpecsDir(name), "manifest.json"));
  });
}

export function generateFromSpec({ spec, specPath, outputPath }) {
  const diagramSpec = spec ?? loadDiagramSpec(specPath);
  const { xml, title } = renderDiagram(diagramSpec);
  const written = writeDrawio(outputPath, xml);
  return { outputPath: written, title };
}

export function generateFromManifest({ hwId, outputDir }) {
  const manifest = loadManifest(hwId);
  const specsDir = getHwSpecsDir(hwId);
  const baseOut = outputDir
    ? resolvePath(outputDir)
    : resolvePath(manifest.defaultOutputDir ?? join(hwId, "diagrams", "drawio"));

  const frozen = new Set(manifest.frozen ?? []);
  const results = [];
  const skipped = [];
  for (const item of manifest.diagrams) {
    if (frozen.has(item.output)) {
      skipped.push(item.output);
      continue;
    }
    const specPath = join(specsDir, item.spec);
    const diagramSpec = readJson(specPath);
    const { xml, title } = renderDiagram(diagramSpec);
    const out = join(baseOut, item.output);
    const written = writeDrawio(out, xml);
    results.push({ outputPath: written, title, spec: item.spec });
  }

  return { hwId, specsDir, outputDir: baseOut, diagrams: results, skipped };
}

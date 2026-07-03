import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve, isAbsolute, basename } from "node:path";
import { getRepoRoot, loadDiagramSpec } from "./generate.mjs";

const EXPORT_URL = "https://convert.diagrams.net/node/export";

const FILL = {
  person: "#08427B",
  system: "#438DD5",
  container: "#438DD5",
  component: "#85BBF0",
  external: "#999999",
  db: "#438DD5",
  boundary: "none",
  note: "#fff2cc",
};

const TEXT = {
  person: "#333333",
  system: "#ffffff",
  container: "#ffffff",
  component: "#000000",
  external: "#ffffff",
  db: "#ffffff",
  boundary: "#333333",
  note: "#333333",
};

function resolvePath(path, base = getRepoRoot()) {
  return isAbsolute(path) ? path : resolve(base, path);
}

function absPos(nodes, nodeId, cache = new Map()) {
  if (cache.has(nodeId)) {
    return cache.get(nodeId);
  }
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) {
    return { x: 0, y: 0 };
  }
  if (!node.parent) {
    const pos = { x: node.x, y: node.y };
    cache.set(nodeId, pos);
    return pos;
  }
  const parent = absPos(nodes, node.parent, cache);
  const pos = { x: parent.x + node.x, y: parent.y + node.y };
  cache.set(nodeId, pos);
  return pos;
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatLabel(label) {
  return escapeXml(label).replace(/\n/g, "<br/>");
}

function anchor(node, pos, ax = 0.5, ay = 0.5) {
  return { x: pos.x + node.w * ax, y: pos.y + node.h * ay };
}

function edgeWaypoint(nodes, edge, point, cache) {
  if (edge.parent) {
    const parent = absPos(nodes, edge.parent, cache);
    return { x: parent.x + point.x, y: parent.y + point.y };
  }
  return point;
}

function buildEdgePoints(nodes, from, to, edge, cache) {
  const fromPos = absPos(nodes, from.id, cache);
  const toPos = absPos(nodes, to.id, cache);
  const start = anchor(from, fromPos, edge.exitX ?? 0.5, edge.exitY ?? 0.5);
  const end = anchor(to, toPos, edge.entryX ?? 0.5, edge.entryY ?? 0.5);
  const mids = (edge.waypoints ?? []).map((point) => edgeWaypoint(nodes, edge, point, cache));
  return [start, ...mids, end];
}

function pointsToPath(points) {
  if (points.length === 0) {
    return "";
  }
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }
  return path;
}

function labelPosition(points, offset = {}) {
  const idx = Math.max(0, Math.floor((points.length - 1) / 2));
  const a = points[idx];
  const b = points[idx + 1] ?? a;
  return {
    x: (a.x + b.x) / 2 + (offset.x ?? 0),
    y: (a.y + b.y) / 2 + (offset.y ?? 0),
  };
}

/** Simple SVG preview from C4 JSON spec (fallback when cloud export is empty). */
export function renderSpecSvg(spec) {
  const nodes = spec.nodes ?? [];
  const pageWidth = spec.pageWidth ?? 1400;
  const pageHeight = spec.pageHeight ?? 900;
  const posCache = new Map();
  const parts = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="${pageHeight}" font-family="Segoe UI, Arial, sans-serif">`,
    `<defs><marker id="arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#666"/></marker></defs>`,
    `<rect width="100%" height="100%" fill="#ffffff"/>`,
    `<text x="${pageWidth / 2}" y="28" fill="#333" font-size="16" font-weight="bold" text-anchor="middle">${escapeXml(spec.title)}</text>`,
  ];

  const edgeParts = [];
  const labelParts = [];
  for (const edge of spec.edges ?? []) {
    const from = nodes.find((n) => n.id === edge.from);
    const to = nodes.find((n) => n.id === edge.to);
    if (!from || !to) {
      continue;
    }
    const points = buildEdgePoints(nodes, from, to, edge, posCache);
    const path = pointsToPath(points);
    const dash = edge.dashed ? ' stroke-dasharray="6 4"' : "";
    edgeParts.push(
      `<path d="${path}" fill="none" stroke="#666" stroke-width="1.5"${dash} marker-end="url(#arrow)"/>`,
    );
    if (edge.label) {
      const label = labelPosition(points, edge.labelOffset ?? {});
      const labelWidth = Math.max(48, edge.label.length * 6);
      labelParts.push(
        `<rect x="${label.x - labelWidth / 2}" y="${label.y - 11}" width="${labelWidth}" height="14" fill="#ffffff" stroke="none"/>`,
      );
      labelParts.push(
        `<text x="${label.x}" y="${label.y}" fill="#333" font-size="10" text-anchor="middle">${escapeXml(edge.label)}</text>`,
      );
    }
  }
  parts.push(...edgeParts);

  for (const node of nodes) {
    const { x, y } = absPos(nodes, node.id, posCache);
    const fill = FILL[node.style] ?? "#438DD5";
    const color = TEXT[node.style] ?? "#ffffff";
    const stroke = node.style === "boundary" ? "#666666" : "#3C7FC0";

    if (node.style === "person") {
      parts.push(`<circle cx="${x + node.w / 2}" cy="${y + 28}" r="22" fill="${fill}"/>`);
      parts.push(
        `<text x="${x + node.w / 2}" y="${y + node.h - 8}" fill="#333" font-size="12" text-anchor="middle">${formatLabel(node.label)}</text>`,
      );
      continue;
    }

    if (node.style === "boundary") {
      parts.push(
        `<rect x="${x}" y="${y}" width="${node.w}" height="${node.h}" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-dasharray="8 8"/>`,
      );
      parts.push(
        `<text x="${x + 8}" y="${y + 18}" fill="${color}" font-size="13" font-weight="bold">${formatLabel(node.label)}</text>`,
      );
      continue;
    }

    parts.push(
      `<rect x="${x}" y="${y}" width="${node.w}" height="${node.h}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`,
    );
    const lines = node.label.split("\n");
    const lineHeight = 16;
    const startY = y + node.h / 2 - ((lines.length - 1) * lineHeight) / 2 + 5;
    lines.forEach((line, i) => {
      parts.push(
        `<text x="${x + node.w / 2}" y="${startY + i * lineHeight}" fill="${color}" font-size="12" text-anchor="middle">${escapeXml(line)}</text>`,
      );
    });
  }

  parts.push(...labelParts);
  parts.push("</svg>");
  return parts.join("\n");
}

async function tryCloudExport(xml, format) {
  const form = new FormData();
  form.append("format", format);
  form.append("xml", new Blob([xml], { type: "application/xml" }), "diagram.drawio");
  const response = await fetch(EXPORT_URL, { method: "POST", body: form });
  if (!response.ok) {
    return null;
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer.length > 0 ? buffer : null;
}

async function exportViaSpecSvg(specPath, outputPath, format) {
  const spec = loadDiagramSpec(specPath);
  const svg = renderSpecSvg(spec);
  if (format !== "png") {
    writeFileSync(outputPath, svg, "utf8");
    return { bytes: Buffer.byteLength(svg), method: "spec-svg" };
  }
  const sharp = (await import("sharp")).default;
  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  writeFileSync(outputPath, buffer);
  return { bytes: buffer.length, method: "spec-svg+sharp" };
}

/**
 * Export .drawio to PNG. Tries diagrams.net API; falls back to JSON spec → SVG → PNG.
 */
export async function exportDrawioPng({
  drawioPath,
  outputPath,
  specPath,
  format = "png",
}) {
  const absDrawio = resolvePath(drawioPath);
  const absOutput =
    outputPath != null
      ? resolvePath(outputPath)
      : absDrawio.replace(/\.drawio$/i, `.${format}`);

  mkdirSync(dirname(absOutput), { recursive: true });

  const xml = readFileSync(absDrawio, "utf8");
  let buffer = await tryCloudExport(xml, format);
  let method = "cloud";

  if (!buffer) {
    const guessedSpec =
      specPath ??
      absDrawio
        .replace(/[\\/]diagrams[\\/]/, "/diagrams/_dev/specs/")
        .replace(/\.drawio$/i, ".json");
    if (!guessedSpec.endsWith(".json")) {
      throw new Error(
        `Cloud export returned empty body. Provide specPath for local fallback (e.g. hw-3/diagrams/_dev/specs/${basename(absDrawio, ".drawio")}.json)`,
      );
    }
    const fallback = await exportViaSpecSvg(
      resolvePath(guessedSpec),
      absOutput,
      format,
    );
    return {
      drawioPath: absDrawio,
      outputPath: absOutput,
      format,
      bytes: fallback.bytes,
      method: fallback.method,
      specPath: resolvePath(guessedSpec),
    };
  }

  writeFileSync(absOutput, buffer);
  return {
    drawioPath: absDrawio,
    outputPath: absOutput,
    format,
    bytes: buffer.length,
    method,
  };
}

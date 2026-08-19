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

function resolveParticipantIndex(participants, ref) {
  if (typeof ref === "number") {
    return ref;
  }
  const idx = participants.findIndex((p) => p.id === ref);
  if (idx < 0) {
    throw new Error(`Unknown sequence participant: ${ref}`);
  }
  return idx;
}

/** SVG preview for Sequence JSON spec (fallback when cloud export is empty). */
export function renderSequenceSvg(spec) {
  const sequence = spec.sequence;
  if (!sequence) {
    throw new Error("Spec has no sequence block");
  }

  const {
    colWidth = 130,
    boxWidth = 108,
    startX = 50,
    headerY = 30,
    headerH = 44,
    msgY0 = 130,
    msgStep = 48,
    lifelineHeight = 780,
    participants,
    messages,
    notes = [],
  } = sequence;

  const center = (col) => startX + col * colWidth + boxWidth / 2;
  const lifelineTop = headerY + headerH + 8;

  let stepCount = 0;
  for (const message of messages) {
    stepCount += 1;
    for (const note of notes) {
      if (note.afterMessage === stepCount - 1) {
        stepCount += 1;
      }
    }
  }

  const pageWidth = spec.pageWidth ?? startX + participants.length * colWidth + 80;
  const pageHeight = spec.pageHeight ?? msgY0 + (stepCount + 1) * msgStep + 80;

  const parts = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="${pageHeight}" font-family="Segoe UI, Arial, sans-serif">`,
    `<defs>`,
    `<marker id="arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#333"/></marker>`,
    `<marker id="arrow-open" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polyline points="0 0, 10 3.5, 0 7" fill="none" stroke="#333" stroke-width="1.5"/></marker>`,
    `</defs>`,
    `<rect width="100%" height="100%" fill="#ffffff"/>`,
    `<text x="${pageWidth / 2}" y="28" fill="#333" font-size="16" font-weight="bold" text-anchor="middle">${escapeXml(spec.title)}</text>`,
  ];

  for (let i = 0; i < participants.length; i += 1) {
    const participant = participants[i];
    const x = startX + i * colWidth;
    const type = participant.type ?? (i === 0 ? "person" : "lifeline");
    const cx = center(i);

    if (type === "person") {
      const y = headerY - 8;
      parts.push(`<circle cx="${cx}" cy="${y + 28}" r="22" fill="#08427B"/>`);
      parts.push(
        `<text x="${cx}" y="${y + 68}" fill="#333" font-size="11" text-anchor="middle">${formatLabel(participant.label)}</text>`,
      );
    } else {
      const y = headerY;
      parts.push(
        `<rect x="${x}" y="${y}" width="${boxWidth}" height="${headerH}" rx="2" fill="#dae8fc" stroke="#6c8ebf" stroke-width="1.5"/>`,
      );
      participant.label.split("\n").forEach((line, li) => {
        parts.push(
          `<text x="${cx}" y="${y + 18 + li * 14}" fill="#333" font-size="11" font-weight="bold" text-anchor="middle">${escapeXml(line)}</text>`,
        );
      });
    }

    parts.push(
      `<line x1="${cx}" y1="${lifelineTop}" x2="${cx}" y2="${lifelineTop + lifelineHeight}" stroke="#6c8ebf" stroke-width="1" stroke-dasharray="4 4"/>`,
    );
  }

  let step = 0;
  for (const message of messages) {
    const from = resolveParticipantIndex(participants, message.from);
    const to = resolveParticipantIndex(participants, message.to);
    const y = msgY0 + step * msgStep;
    const x1 = center(from);
    const x2 = center(to);
    const isReturn = message.return ?? false;
    const dash = isReturn ? ' stroke-dasharray="8 8"' : "";
    const marker = isReturn ? "url(#arrow-open)" : "url(#arrow)";

    parts.push(
      `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#333" stroke-width="1.5"${dash} marker-end="${marker}"/>`,
    );

    const labelX = (x1 + x2) / 2;
    const labelWidth = Math.max(48, message.label.length * 6);
    parts.push(
      `<rect x="${labelX - labelWidth / 2}" y="${y - 18}" width="${labelWidth}" height="14" fill="#ffffff"/>`,
    );
    parts.push(
      `<text x="${labelX}" y="${y - 6}" fill="#333" font-size="10" text-anchor="middle">${escapeXml(message.label)}</text>`,
    );

    step += 1;
    for (const note of notes) {
      if (note.afterMessage === step - 1) {
        const nw = note.w ?? 200;
        const nh = note.h ?? 50;
        const nx = center(from) + 10;
        const ny = msgY0 + step * msgStep - 12;
        parts.push(
          `<polygon points="${nx},${ny} ${nx + nw},${ny} ${nx + nw},${ny + nh} ${nx + 12},${ny + nh} ${nx},${ny + nh - 12}" fill="#fff2cc" stroke="#d6b656"/>`,
        );
        note.label.split("\n").forEach((line, li) => {
          parts.push(
            `<text x="${nx + 8}" y="${ny + 16 + li * 14}" fill="#333" font-size="10">${escapeXml(line)}</text>`,
          );
        });
        step += 1;
      }
    }
  }

  parts.push("</svg>");
  return parts.join("\n");
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
  // convert.diagrams.net expects application/x-www-form-urlencoded.
  // multipart FormData+Blob returns 400/403 and must not be used.
  const body = new URLSearchParams({
    format,
    xml,
    bg: "#ffffff",
    embedXml: "0",
  });
  const response = await fetch(EXPORT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: "https://app.diagrams.net/",
    },
    body,
  });
  if (!response.ok) {
    return null;
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const looksPng = buffer.length > 8 && buffer[0] === 0x89 && buffer[1] === 0x50;
  const looksSvg =
    buffer.length > 20 &&
    (buffer.subarray(0, 5).toString() === "<?xml" ||
      buffer.subarray(0, 4).toString() === "<svg");
  if (!looksPng && !looksSvg && format === "png") {
    // Some responses return base64 text — decode if it looks like PNG base64
    const text = buffer.toString("utf8").trim();
    if (/^[A-Za-z0-9+/=\r\n]+$/.test(text) && text.length > 100) {
      const decoded = Buffer.from(text, "base64");
      if (decoded[0] === 0x89 && decoded[1] === 0x50) {
        return decoded;
      }
    }
    return null;
  }
  return buffer.length > 0 ? buffer : null;
}

async function exportViaSpecSvg(specPath, outputPath, format) {
  const spec = loadDiagramSpec(specPath);
  const svg = spec.sequence ? renderSequenceSvg(spec) : renderSpecSvg(spec);
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

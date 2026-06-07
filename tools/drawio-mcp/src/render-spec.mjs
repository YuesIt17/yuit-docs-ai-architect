import { z } from "zod";
import { DrawioBuilder, STYLES } from "./drawio-builder.mjs";

const NodeStyle = z.enum([
  "person",
  "system",
  "container",
  "component",
  "external",
  "db",
  "boundary",
  "note",
  "lifeline",
]);

const NodeSpec = z.object({
  id: z.string(),
  label: z.string(),
  style: NodeStyle,
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  parent: z.string().optional(),
});

const PointSpec = z.object({ x: z.number(), y: z.number() });

const EdgeSpec = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
  dashed: z.boolean().optional(),
  parent: z.string().optional(),
  exitX: z.number().optional(),
  exitY: z.number().optional(),
  entryX: z.number().optional(),
  entryY: z.number().optional(),
  waypoints: z.array(PointSpec).optional(),
  labelOffset: PointSpec.optional(),
});

const SequenceParticipant = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["person", "lifeline"]).optional(),
});

const SequenceMessage = z.object({
  from: z.union([z.number(), z.string()]),
  to: z.union([z.number(), z.string()]),
  label: z.string(),
  return: z.boolean().optional(),
});

const SequenceNote = z.object({
  afterMessage: z.number(),
  label: z.string(),
  w: z.number().optional(),
  h: z.number().optional(),
});

const SequenceSpec = z.object({
  colWidth: z.number().optional(),
  boxWidth: z.number().optional(),
  startX: z.number().optional(),
  headerY: z.number().optional(),
  headerH: z.number().optional(),
  msgY0: z.number().optional(),
  msgStep: z.number().optional(),
  lifelineHeight: z.number().optional(),
  participants: z.array(SequenceParticipant),
  messages: z.array(SequenceMessage),
  notes: z.array(SequenceNote).optional(),
});

export const DiagramSpec = z.object({
  title: z.string(),
  pageWidth: z.number().optional(),
  pageHeight: z.number().optional(),
  agent: z.string().optional(),
  nodes: z.array(NodeSpec).optional(),
  edges: z.array(EdgeSpec).optional(),
  sequence: SequenceSpec.optional(),
});

export const ManifestSpec = z.object({
  hwId: z.string(),
  description: z.string().optional(),
  defaultOutputDir: z.string().optional(),
  frozen: z.array(z.string()).optional(),
  diagrams: z.array(
    z.object({
      spec: z.string(),
      output: z.string(),
    }),
  ),
});

export function parseDiagramSpec(input) {
  return DiagramSpec.parse(typeof input === "string" ? JSON.parse(input) : input);
}

export function parseManifestSpec(input) {
  return ManifestSpec.parse(typeof input === "string" ? JSON.parse(input) : input);
}

function resolveStyle(name) {
  const style = STYLES[name];
  if (!style) {
    throw new Error(`Unknown node style: ${name}`);
  }
  return style;
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

function renderSequence(builder, sequence) {
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

  for (let i = 0; i < participants.length; i++) {
    const participant = participants[i];
    const x = startX + i * colWidth;
    const type = participant.type ?? (i === 0 ? "person" : "lifeline");
    const style = type === "person" ? STYLES.person : STYLES.lifeline;
    const h = type === "person" ? 60 : headerH;
    const y = type === "person" ? headerY - 8 : headerY;
    builder.box(participant.label, x, y, boxWidth, h, style);
    builder.lifeline(center(i), lifelineTop, lifelineHeight);
  }

  let step = 0;
  for (const message of messages) {
    const from = resolveParticipantIndex(participants, message.from);
    const to = resolveParticipantIndex(participants, message.to);
    builder.message(
      center(from),
      center(to),
      msgY0 + step * msgStep,
      message.label,
      message.return ?? false,
    );
    step += 1;

    for (const note of notes) {
      if (note.afterMessage === step - 1) {
        builder.box(
          note.label,
          center(from) + 10,
          msgY0 + step * msgStep - 12,
          note.w ?? 200,
          note.h ?? 50,
          STYLES.note,
        );
        step += 1;
      }
    }
  }

  return {
    pageWidth: startX + participants.length * colWidth + 80,
    pageHeight: msgY0 + (step + 1) * msgStep + 80,
  };
}

export function renderDiagram(specInput) {
  const spec = parseDiagramSpec(specInput);
  const builder = new DrawioBuilder(spec.title, spec.agent ?? "drawio-mcp");
  const nodeIds = new Map();

  let pageWidth = spec.pageWidth ?? 1400;
  let pageHeight = spec.pageHeight ?? 900;

  if (spec.sequence) {
    const dims = renderSequence(builder, spec.sequence);
    pageWidth = spec.pageWidth ?? dims.pageWidth;
    pageHeight = spec.pageHeight ?? dims.pageHeight;
  } else {
    for (const node of spec.nodes ?? []) {
      const parent = node.parent ? nodeIds.get(node.parent) ?? "1" : "1";
      const cid = builder.box(
        node.label,
        node.x,
        node.y,
        node.w,
        node.h,
        resolveStyle(node.style),
        parent,
      );
      nodeIds.set(node.id, cid);
    }

    for (const edge of spec.edges ?? []) {
      const source = nodeIds.get(edge.from);
      const target = nodeIds.get(edge.to);
      if (!source || !target) {
        throw new Error(`Edge references unknown node: ${edge.from} -> ${edge.to}`);
      }
      const parent = edge.parent ? nodeIds.get(edge.parent) ?? "1" : "1";
      builder.edge(source, target, edge.label ?? "", {
        parent,
        dashed: edge.dashed ?? false,
        exitX: edge.exitX,
        exitY: edge.exitY,
        entryX: edge.entryX,
        entryY: edge.entryY,
        waypoints: edge.waypoints,
        labelOffset: edge.labelOffset,
      });
    }
  }

  return {
    xml: builder.build(pageWidth, pageHeight),
    title: spec.title,
    pageWidth,
    pageHeight,
  };
}

export const SPEC_SCHEMA_HELP = {
  description:
    "JSON spec for generate_drawio. Use nodes+edges for C4 diagrams or sequence for Sequence diagrams.",
  nodeStyles: Object.keys(STYLES).filter((k) => k !== "edge"),
  layoutHints:
    "Overlap fix: move nodes (x/y/w/h) and add edge exitX/exitY, entryX/entryY, waypoints [{x,y}], labelOffset {x,y}. Regenerate with npm run generate:hw-2 or MCP generate_drawio.",
  edgeRouting: {
    exitX: "0–1, anchor on source (1 = right edge)",
    exitY: "0–1, anchor on source",
    entryX: "0–1, anchor on target (0 = left edge)",
    entryY: "0–1, anchor on target",
    waypoints: "array of {x,y} elbow points between nodes",
    labelOffset: "{x,y} nudge for edge label",
  },
  exampleC4: {
    title: "C1 Context",
    nodes: [
      {
        id: "shopper",
        label: "Покупатель\\nСайт / приложение",
        style: "person",
        x: 80,
        y: 280,
        w: 100,
        h: 140,
      },
      {
        id: "system",
        label: "Моя система",
        style: "system",
        x: 320,
        y: 240,
        w: 220,
        h: 100,
      },
    ],
    edges: [{ from: "shopper", to: "system", label: "HTTPS" }],
  },
  exampleSequence: {
    title: "Sequence example",
    sequence: {
      participants: [
        { id: "user", label: "User", type: "person" },
        { id: "api", label: "API", type: "lifeline" },
      ],
      messages: [
        { from: 0, to: 1, label: "request" },
        { from: 1, to: 0, label: "response", return: true },
      ],
    },
  },
};

#!/usr/bin/env node
/**
 * Generate Draw.io (.drawio) diagrams from RetailPartnerX hw-2 Mermaid specs.
 * Usage: node generate_drawio.mjs
 */

import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = dirname(fileURLToPath(import.meta.url));

const STYLE_PERSON =
  "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;" +
  "html=1;outlineConnect=0;fillColor=#08427B;fontColor=#ffffff;";
const STYLE_SYSTEM =
  "rounded=1;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#3C7FC0;" +
  "fontColor=#ffffff;align=center;";
const STYLE_CONTAINER =
  "rounded=1;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#3C7FC0;" +
  "fontColor=#ffffff;align=center;";
const STYLE_COMPONENT =
  "rounded=1;whiteSpace=wrap;html=1;fillColor=#85BBF0;strokeColor=#3C7FC0;" +
  "fontColor=#000000;align=center;";
const STYLE_EXTERNAL =
  "rounded=1;whiteSpace=wrap;html=1;fillColor=#999999;strokeColor=#666666;" +
  "fontColor=#ffffff;align=center;";
const STYLE_DB =
  "shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;" +
  "size=12;fillColor=#438DD5;strokeColor=#3C7FC0;fontColor=#ffffff;";
const STYLE_BOUNDARY =
  "rounded=0;whiteSpace=wrap;html=1;dashed=1;dashPattern=8 8;fillColor=none;" +
  "strokeColor=#666666;align=left;verticalAlign=top;fontStyle=1;fontColor=#333333;";
const STYLE_EDGE =
  "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;" +
  "html=1;strokeColor=#666666;fontColor=#333333;";
const STYLE_LIFELINE =
  "rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" +
  "align=center;fontStyle=1;";
const STYLE_NOTE =
  "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;" +
  "fillColor=#fff2cc;strokeColor=#d6b656;size=14;align=left;";

function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

class DrawioBuilder {
  constructor(title) {
    this.title = title;
    this._cells = [];
    this._nextId = 2;
  }

  _id() {
    const id = String(this._nextId);
    this._nextId += 1;
    return id;
  }

  box(label, x, y, w, h, style, parent = "1") {
    const cid = this._id();
    const val = escapeXml(label).replace(/&#10;/g, "<br>");
    this._cells.push(
      `        <mxCell id="${cid}" value="${val}" style="${style}" ` +
        `vertex="1" parent="${parent}">\n` +
        `          <mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/>\n` +
        `        </mxCell>`,
    );
    return cid;
  }

  edge(source, target, label = "", parent = "1", dashed = false) {
    const eid = this._id();
    const style = STYLE_EDGE + (dashed ? "dashed=1;" : "");
    const val = label ? escapeXml(label) : "";
    this._cells.push(
      `        <mxCell id="${eid}" value="${val}" style="${style}" edge="1" ` +
        `parent="${parent}" source="${source}" target="${target}">\n` +
        `          <mxGeometry relative="1" as="geometry"/>\n` +
        `        </mxCell>`,
    );
  }

  /** Horizontal sequence message between lifeline centers (no vertex-to-vertex routing). */
  message(x1, x2, y, label, isReturn = false) {
    const eid = this._id();
    const style = isReturn
      ? "endArrow=open;html=1;dashed=1;dashPattern=8 8;strokeColor=#333333;" +
        "fontColor=#333333;fontSize=11;verticalAlign=bottom;labelBackgroundColor=#ffffff;"
      : "endArrow=block;html=1;strokeColor=#333333;" +
        "fontColor=#333333;fontSize=11;verticalAlign=bottom;labelBackgroundColor=#ffffff;";
    const val = escapeXml(label);
    this._cells.push(
      `        <mxCell id="${eid}" value="${val}" style="${style}" edge="1" parent="1">\n` +
        `          <mxGeometry relative="1" as="geometry">\n` +
        `            <mxPoint x="${x1}" y="${y}" as="sourcePoint"/>\n` +
        `            <mxPoint x="${x2}" y="${y}" as="targetPoint"/>\n` +
        `          </mxGeometry>\n` +
        `        </mxCell>`,
    );
  }

  lifeline(centerX, topY, height) {
    return this.box(
      "",
      centerX - 1,
      topY,
      2,
      height,
      "fillColor=none;strokeColor=#6c8ebf;dashed=1;dashPattern=1 4;html=1;",
    );
  }

  build(pageW = 1400, pageH = 900) {
    const diagramId = randomUUID();
    const cells = this._cells.join("\n");
    return `<mxfile host="app.diagrams.net" agent="hw-2-generator-js" version="22.1.0">
  <diagram name="${escapeXml(this.title)}" id="${diagramId}">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1"
      connect="1" arrows="1" fold="1" page="1" pageScale="1"
      pageWidth="${pageW}" pageHeight="${pageH}" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
${cells}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;
  }
}

function write(name, content) {
  const path = join(OUT_DIR, name);
  writeFileSync(path, content, "utf8");
  console.log(`Wrote ${path}`);
}

function genC1() {
  const b = new DrawioBuilder("C1 Context");
  const shopper = b.box(
    "Покупатель&#10;Сайт / приложение",
    80,
    280,
    100,
    140,
    STYLE_PERSON,
  );
  const recsys = b.box(
    "Система персональных&#10;рекомендаций&#10;Ранжирование SKU",
    320,
    240,
    220,
    100,
    STYLE_SYSTEM,
  );
  const pim = b.box("PIM&#10;Каталог, SKU", 640, 120, 160, 70, STYLE_EXTERNAL);
  const cdp = b.box("CDP / CRM&#10;Профиль, события", 640, 240, 160, 70, STYLE_EXTERNAL);
  const loyalty = b.box("Программа лояльности", 640, 360, 160, 70, STYLE_EXTERNAL);
  b.edge(shopper, recsys, "Просматривает рекомендации [HTTPS]");
  b.edge(recsys, pim, "Каталог и остатки [API]");
  b.edge(recsys, cdp, "События и профиль [API/stream]");
  b.edge(recsys, loyalty, "Идентификация [API]");
  write("c1-context.drawio", b.build());
}

function genC2() {
  const b = new DrawioBuilder("C2 Containers");
  const shopper = b.box("Покупатель", 40, 300, 90, 120, STYLE_PERSON);
  const boundary = b.box(
    "RetailPartnerX E-commerce",
    180,
    80,
    720,
    480,
    STYLE_BOUNDARY,
  );
  const fe = b.box(
    "Frontend&#10;Web, iOS, Android",
    220,
    160,
    150,
    80,
    STYLE_CONTAINER,
    boundary,
  );
  const be = b.box(
    "Backend&#10;BFF, корзина",
    420,
    160,
    150,
    80,
    STYLE_CONTAINER,
    boundary,
  );
  const ai = b.box(
    "AI Service&#10;Рекомендации",
    620,
    160,
    150,
    80,
    STYLE_CONTAINER,
    boundary,
  );
  const sql = b.box("SQL DB&#10;PostgreSQL", 420, 360, 140, 90, STYLE_DB, boundary);
  const vec = b.box(
    "Vector DB&#10;опционально / RAG future",
    620,
    360,
    160,
    90,
    STYLE_DB,
    boundary,
  );
  const pim = b.box("PIM&#10;Каталог", 960, 200, 140, 70, STYLE_EXTERNAL);
  b.edge(shopper, fe, "HTTPS");
  b.edge(fe, be, "REST");
  b.edge(be, ai, "get_recommendation");
  b.edge(be, sql, "SQL");
  b.edge(ai, sql, "SQL");
  b.edge(ai, vec, "опционально");
  b.edge(be, pim, "REST");
  write("c2-containers.drawio", b.build(1500, 700));
}

function genC3Recsys() {
  const b = new DrawioBuilder("C3 AI Service recsys");
  const boundary = b.box("AI Service", 120, 60, 900, 420, STYLE_BOUNDARY);
  const ctrl = b.box(
    "Recommendation Controller&#10;REST API",
    160,
    140,
    170,
    70,
    STYLE_COMPONENT,
    boundary,
  );
  const router = b.box("Scenario Router", 380, 140, 150, 70, STYLE_COMPONENT, boundary);
  const loader = b.box("Candidate Loader", 580, 140, 150, 70, STYLE_COMPONENT, boundary);
  const ranker = b.box("Ranker", 780, 140, 120, 70, STYLE_COMPONENT, boundary);
  const builder = b.box("Response Builder", 480, 300, 150, 70, STYLE_COMPONENT, boundary);
  const sql = b.box("SQL DB", 160, 360, 120, 80, STYLE_DB);
  const cache = b.box("Redis Cache", 760, 360, 120, 80, STYLE_DB);
  b.edge(ctrl, router, "Маршрутизация", boundary);
  b.edge(router, loader, "Кандидаты", boundary);
  b.edge(loader, ranker, "Кандидаты", boundary);
  b.edge(ranker, builder, "Scores", boundary);
  b.edge(builder, ctrl, "JSON response", boundary);
  b.edge(loader, cache, "Read");
  b.edge(loader, sql, "Read");
  write("c3-ai-service-recsys.drawio", b.build(1200, 550));
}

function genC3Rag() {
  const b = new DrawioBuilder("C3 AI Service RAG future");
  const boundary = b.box("AI Service — RAG future Prod", 100, 50, 880, 400, STYLE_BOUNDARY);
  const ctrl = b.box("Controller", 140, 130, 140, 65, STYLE_COMPONENT, boundary);
  const rag = b.box("RAG Manager", 320, 130, 140, 65, STYLE_COMPONENT, boundary);
  const prompts = b.box(
    "Prompt Template Factory",
    500,
    130,
    180,
    65,
    STYLE_COMPONENT,
    boundary,
  );
  const llm = b.box("LLM Client", 720, 130, 140, 65, STYLE_COMPONENT, boundary);
  const vec = b.box("Vector DB", 300, 320, 130, 80, STYLE_DB);
  const sql = b.box("SQL DB", 520, 320, 130, 80, STYLE_DB);
  b.edge(ctrl, rag, "Контекст", boundary);
  b.edge(rag, vec, "Similarity search");
  b.edge(rag, prompts, "Контекст", boundary);
  b.edge(prompts, llm, "Prompt", boundary);
  b.edge(llm, ctrl, "Ответ", boundary);
  b.edge(ctrl, sql, "Логирование");
  write("c3-ai-service-rag-future.drawio", b.build(1150, 520));
}

function genSequence() {
  const b = new DrawioBuilder("Sequence get recommendation");

  // Participants (column index → name). Matches mermaid/sequence-get-recommendation.md
  const names = [
    "Покупатель",
    "Frontend",
    "Backend",
    "Rec.&#10;Controller",
    "Scenario&#10;Router",
    "Candidate&#10;Loader",
    "Ranker",
    "Response&#10;Builder",
    "SQL DB",
    "Redis",
  ];

  const COL_W = 130;
  const BOX_W = 108;
  const START_X = 50;
  const HEADER_Y = 30;
  const HEADER_H = 44;
  const LIFELINE_TOP = HEADER_Y + HEADER_H + 8;
  const MSG_Y0 = 130;
  const MSG_STEP = 48;

  const center = (col) => START_X + col * COL_W + BOX_W / 2;

  // Participant headers + vertical lifelines
  for (let i = 0; i < names.length; i++) {
    const x = START_X + i * COL_W;
    const style = i === 0 ? STYLE_PERSON : STYLE_LIFELINE;
    const h = i === 0 ? 60 : HEADER_H;
    const y = i === 0 ? HEADER_Y - 8 : HEADER_Y;
    b.box(names[i], x, y, BOX_W, h, style);
    b.lifeline(center(i), LIFELINE_TOP, 780);
  }

  let step = 0;
  const msg = (from, to, label, ret = false) => {
    b.message(center(from), center(to), MSG_Y0 + step * MSG_STEP, label, ret);
    step += 1;
  };

  msg(0, 1, "Открывает карточку SKU-123");
  msg(1, 2, "GET /products/SKU-123");
  msg(2, 3, "POST /get_recommendation");

  b.box(
    "user_id, context=product_page&#10;product_id, limit=10",
    center(2) + 10,
    MSG_Y0 + step * MSG_STEP - 12,
    200,
    50,
    STYLE_NOTE,
  );
  step += 1;

  msg(3, 4, "resolve(context)");
  msg(4, 5, "loadCandidates(user, product)");
  msg(5, 9, "GET precomputed SKU-123");
  msg(9, 5, "candidates[]", true);
  msg(5, 8, "SELECT history, co-purchase");
  msg(8, 5, "rows", true);
  msg(5, 6, "rank(candidates, user)");
  msg(6, 7, "scored list");
  msg(7, 3, "recommendations[]", true);
  msg(3, 2, "200 OK", true);
  msg(2, 1, "product + recommendations", true);
  msg(1, 0, "С этим покупают", true);

  const pageW = START_X + names.length * COL_W + 80;
  const pageH = MSG_Y0 + (step + 1) * MSG_STEP + 80;
  write("sequence-get-recommendation.drawio", b.build(pageW, pageH));
}

function main() {
  genC1();
  genC2();
  genC3Recsys();
  genC3Rag();
  genSequence();
  console.log("Done.");
}

main();

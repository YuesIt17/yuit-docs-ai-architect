import { randomUUID } from "node:crypto";

export const STYLES = {
  person:
    "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;" +
    "html=1;outlineConnect=0;fillColor=#08427B;fontColor=#ffffff;",
  system:
    "rounded=1;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#3C7FC0;" +
    "fontColor=#ffffff;align=center;",
  container:
    "rounded=1;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#3C7FC0;" +
    "fontColor=#ffffff;align=center;",
  component:
    "rounded=1;whiteSpace=wrap;html=1;fillColor=#85BBF0;strokeColor=#3C7FC0;" +
    "fontColor=#000000;align=center;",
  external:
    "rounded=1;whiteSpace=wrap;html=1;fillColor=#999999;strokeColor=#666666;" +
    "fontColor=#ffffff;align=center;",
  db:
    "shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;" +
    "size=12;fillColor=#438DD5;strokeColor=#3C7FC0;fontColor=#ffffff;",
  boundary:
    "rounded=0;whiteSpace=wrap;html=1;dashed=1;dashPattern=8 8;fillColor=none;" +
    "strokeColor=#666666;align=left;verticalAlign=top;fontStyle=1;fontColor=#333333;",
  edge:
    "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;" +
    "html=1;strokeColor=#666666;fontColor=#333333;labelBackgroundColor=#ffffff;",
  lifeline:
    "rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" +
    "align=center;fontStyle=1;",
  note:
    "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;" +
    "fillColor=#fff2cc;strokeColor=#d6b656;size=14;align=left;",
};

export function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Draw.io line breaks in value attributes must be &#10;, not raw <br> tags. */
export function formatDrawioLabel(label) {
  return escapeXml(String(label).replace(/\n/g, "&#10;"));
}

export class DrawioBuilder {
  constructor(title, agent = "drawio-mcp") {
    this.title = title;
    this.agent = agent;
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
    const val = formatDrawioLabel(label);
    this._cells.push(
      `        <mxCell id="${cid}" value="${val}" style="${style}" ` +
        `vertex="1" parent="${parent}">\n` +
        `          <mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/>\n` +
        `        </mxCell>`,
    );
    return cid;
  }

  edge(source, target, label = "", options = {}) {
    const {
      parent = "1",
      dashed = false,
      exitX,
      exitY,
      entryX,
      entryY,
      waypoints = [],
      labelOffset,
    } = options;

    const eid = this._id();
    let style = STYLES.edge + (dashed ? "dashed=1;" : "");
    if (exitX !== undefined) {
      style += `exitX=${exitX};exitY=${exitY ?? 0.5};exitDx=0;exitDy=0;`;
    }
    if (entryX !== undefined) {
      style += `entryX=${entryX};entryY=${entryY ?? 0.5};entryDx=0;entryDy=0;`;
    }

    const val = label ? formatDrawioLabel(label) : "";
    let geometry = "          <mxGeometry relative=\"1\" as=\"geometry\"/>";
    if (waypoints.length > 0 || labelOffset) {
      const points = waypoints
        .map((p) => `            <mxPoint x="${p.x}" y="${p.y}"/>`)
        .join("\n");
      const pointsBlock =
        waypoints.length > 0
          ? `\n            <Array as="points">\n${points}\n            </Array>`
          : "";
      const offsetBlock = labelOffset
        ? `\n            <mxPoint x="${labelOffset.x ?? 0}" y="${labelOffset.y ?? 0}" as="offset"/>`
        : "";
      geometry =
        `          <mxGeometry relative="1" as="geometry">${pointsBlock}${offsetBlock}\n` +
        `          </mxGeometry>`;
    }

    this._cells.push(
      `        <mxCell id="${eid}" value="${val}" style="${style}" edge="1" ` +
        `parent="${parent}" source="${source}" target="${target}">\n` +
        `${geometry}\n` +
        `        </mxCell>`,
    );
  }

  message(x1, x2, y, label, isReturn = false) {
    const eid = this._id();
    const style = isReturn
      ? "endArrow=open;html=1;dashed=1;dashPattern=8 8;strokeColor=#333333;" +
        "fontColor=#333333;fontSize=11;verticalAlign=bottom;labelBackgroundColor=#ffffff;"
      : "endArrow=block;html=1;strokeColor=#333333;" +
        "fontColor=#333333;fontSize=11;verticalAlign=bottom;labelBackgroundColor=#ffffff;";
    const val = formatDrawioLabel(label);
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
    return `<mxfile host="app.diagrams.net" agent="${escapeXml(this.agent)}" version="22.1.0">
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

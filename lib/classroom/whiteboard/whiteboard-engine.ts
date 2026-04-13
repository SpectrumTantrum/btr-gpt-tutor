import type { WhiteboardStroke } from "@/lib/core/types";

export interface SVGPath {
  readonly id: string;
  readonly d: string;
  readonly stroke: string;
  readonly strokeWidth: number;
  readonly fill: string;
}

export class WhiteboardEngine {
  private strokes: readonly WhiteboardStroke[];

  constructor() {
    this.strokes = [];
  }

  addStroke(stroke: WhiteboardStroke): void {
    this.strokes = [...this.strokes, stroke];
  }

  removeStroke(id: string): void {
    this.strokes = this.strokes.filter((s) => s.id !== id);
  }

  clear(): void {
    this.strokes = [];
  }

  getStrokes(): readonly WhiteboardStroke[] {
    return this.strokes;
  }

  toSVGPaths(): SVGPath[] {
    return this.strokes
      .filter((s) => s.tool === "pen")
      .map((s) => ({
        id: s.id,
        d: buildPathData(s.points),
        stroke: s.color,
        strokeWidth: s.width,
        fill: "none",
      }));
  }
}

function buildPathData(
  points: readonly { x: number; y: number }[]
): string {
  if (points.length === 0) return "";

  const [first, ...rest] = points;
  const move = `M ${first.x} ${first.y}`;

  if (rest.length === 0) return move;

  const lines = rest.map((p) => `L ${p.x} ${p.y}`).join(" ");
  return `${move} ${lines}`;
}

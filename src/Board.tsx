import React, { useState } from "react";
import { select } from "d3";
import { Machine } from "xstate";

enum Condition {
  Alive,
  Dead,
}

const getFill = (c: Condition) => (c === Condition.Alive ? "black" : "white");

export const Board: React.FC<{ containerRect: DOMRect }> = ({
  containerRect,
}) => {
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const boardRef = React.useRef<SVGSVGElement>(null);
  const boardWidth = containerRect.width;
  const boardHeight = containerRect.height;
  const columns = Math.floor((boardWidth / boardHeight) * 20);
  const rows = Math.floor((boardWidth / boardHeight) * 20);

  const cellWidth = boardWidth / columns;
  const cellHeight = boardHeight / rows;
  const gameState = React.useMemo(() => {
    return Array(columns * rows)
      .fill(null)
      .map(() => (Math.random() >= 0.5 ? Condition.Dead : Condition.Alive));
  }, [columns, rows]);

  const exceedsTop = (idx: number) => idx - columns < 0;
  const exceedsRight = (idx: number) => (idx + 1) % columns === 0;
  const exceedsBottom = (idx: number) => idx + columns > columns * rows - 1;
  const exceedsLeft = (idx: number) => (idx % columns) - 1 < 0;
  const toBottom = (idx: number) => columns * rows - columns + idx;
  const toLeft = (idx: number) => idx - (columns - 1);
  const toRight = (idx: number) => idx + (columns - 1);
  const toTop = (idx: number) => idx % columns;
  const t = (idx: number) => (exceedsTop(idx) ? toBottom(idx) : idx - columns);
  const r = (idx: number) => (exceedsRight(idx) ? toLeft(idx) : idx + 1);
  const b = (idx: number) => (exceedsBottom(idx) ? toTop(idx) : idx + columns);
  const l = (idx: number) => (exceedsLeft(idx) ? toRight(idx) : idx - 1);
  const tl = (idx: number) => l(t(idx));
  const tr = (idx: number) => r(t(idx));
  const bl = (idx: number) => l(b(idx));
  const br = (idx: number) => r(b(idx));

  const getXOffset = React.useCallback(
    (_, i: number) => (i % columns) * cellWidth,
    [cellWidth, columns]
  );

  const getYOffset = React.useCallback(
    (_, i: number) => Math.floor(i / rows) * cellHeight,
    [cellHeight, rows]
  );

  React.useEffect(() => {
    if (boardRef.current) {
      const board = select(boardRef.current)
        .attr("width", containerRect.width)
        .attr("height", containerRect.height);

      board
        .selectAll("rect")
        .data(gameState)
        .join(
          (enter) =>
            enter
              .append("rect")
              .attr("width", cellWidth)
              .attr("height", cellHeight)
              .attr("fill", getFill)
              .attr("x", getXOffset)
              .attr("y", getYOffset)
              .on("click", (_, idx) => setActiveCell(idx)),
          (update) =>
            update
              .attr("width", cellWidth)
              .attr("height", cellHeight)
              .attr("fill", getFill)
              .attr("x", getXOffset)
              .attr("y", getYOffset),
          (exit) => {
            exit.remove();
          }
        );
    }
  }, [
    cellHeight,
    cellWidth,
    containerRect.height,
    containerRect.width,
    gameState,
    getXOffset,
    getYOffset,
  ]);

  return <svg ref={boardRef} />;
};

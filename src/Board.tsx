import React, { useState } from "react";
import d3, { select, range, scaleLinear } from "d3";
import Fraction from "fraction.js";
import { Machine } from "xstate";
import { useDebounce } from "./hooks";

enum Condition {
  Alive,
  Dead,
}

export const Board: React.FC<{ containerRect: DOMRect }> = ({
  containerRect,
}) => {
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const boardRef = React.useRef<SVGSVGElement>(null);
  const boardWidth = containerRect.width;
  const boardHeight = containerRect.height;
  const columns = Math.floor((boardWidth / boardHeight) * 10);
  const rows = Math.floor((boardWidth / boardHeight) * 10);

  const cellWidth = boardWidth / columns;
  const cellHeight = boardHeight / rows;
  const gameState = React.useMemo(() => {
    return Array(columns * rows)
      .fill(null)
      .map(() => Condition.Dead);
  }, [columns, rows]);

  const exceedsBottomRow = (idx: number) => idx > columns * rows - 1;

  const t = (idx: number) =>
    idx - columns < 0 ? columns * rows - columns + idx : idx - columns;
  const l = (idx: number) => idx - 1;
  const b = (idx: number) =>
    idx + columns > columns * rows - 1 ? idx % columns : idx + columns;
  const r = (idx: number) => idx + 1;
  const tl = (idx: number) => l(t(idx));
  const tr = (idx: number) => r(t(idx));
  const bl = (idx: number) => l(b(idx));
  const br = (idx: number) => r(b(idx));

  if (activeCell != null) {
    debugger;
  }

  const getFill = React.useCallback(
    (condition: Condition, idx: number) => {
      console.log("activeCell", activeCell);
      if (idx === activeCell) {
        return "white";
      } else if (
        activeCell != null &&
        [t, tl, tr, l, r, b, bl, br].some((fn) => fn(activeCell) === idx)
      ) {
        return "green";
      } else {
        return condition === Condition.Alive ? "black" : "red";
      }
    },
    [activeCell]
  );

  const getXOffset = React.useCallback(
    (_, i: number) => {
      return (i % columns) * cellWidth;
    },
    [cellWidth, columns]
  );

  const getYOffset = React.useCallback(
    (_, i: number) => {
      return Math.floor(i / rows) * cellHeight;
    },
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
              .attr("y", getYOffset)
              .on("click", (_, idx) => setActiveCell(idx)),
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
    getFill,
    getXOffset,
    getYOffset,
  ]);

  return <svg ref={boardRef} />;
};

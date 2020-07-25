import React from "react";
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
  const boardRef = React.useRef<SVGSVGElement>(null);
  const boardWidth = useDebounce(containerRect.width, 1000);
  const boardHeight = useDebounce(containerRect.height, 1000);
  const columns = Math.floor((boardWidth / boardHeight) * 10);
  const rows = Math.floor((boardWidth / boardHeight) * 10);

  const cellWidth = boardWidth / columns;
  const cellHeight = boardHeight / rows;
  const gameState = React.useMemo(() => {
    return Array(columns * rows)
      .fill(null)
      .map(() => (Math.random() >= 0.5 ? Condition.Alive : Condition.Dead));
  }, [columns, rows]);

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
              .attr("fill", (d) => (d === Condition.Alive ? "green" : "yellow"))
              .attr("x", (_, i) => (i % columns) * cellWidth)
              .attr("y", (_, i) => Math.floor(i / rows) * cellHeight),
          (update) =>
            update
              .attr("width", cellWidth)
              .attr("height", cellHeight)
              .attr("fill", (d) => (d === Condition.Alive ? "green" : "yellow"))
              .attr("x", (_, i) => (i % columns) * cellWidth)
              .attr("y", (_, i) => Math.floor(i / rows) * cellHeight),

          (exit) => {
            console.log("fart!");
            exit.remove();
          }
        );
    }
  }, [
    gameState,
    cellHeight,
    cellWidth,
    rows,
    columns,
    containerRect.width,
    containerRect.height,
  ]);

  console.log("rects", document.querySelectorAll("rect").length);
  console.log("gameState", gameState.length);

  return <svg ref={boardRef} />;
};

import React from "react";
import { select } from "d3";
import chroma from "chroma-js";
import { cellMachine, Condition, Event as CellEvent } from "./Machines";

function getNeighborPositions(columns: number, rows: number, idx: number) {
  const exceedsTop = (i: number) => i - columns < 0;
  const exceedsRight = (i: number) => (i + 1) % columns === 0;
  const exceedsBottom = (i: number) => i + columns > columns * rows - 1; // this -1 is suspicious, test l8r
  const exceedsLeft = (i: number) => (i % columns) - 1 < 0;
  const toBottom = (i: number) => columns * rows - columns + i;
  const toLeft = (i: number) => i - (columns - 1);
  const toRight = (i: number) => i + (columns - 1);
  const toTop = (i: number) => i % columns;
  const t = (i: number) => (exceedsTop(i) ? toBottom(i) : i - columns);
  const r = (i: number) => (exceedsRight(i) ? toLeft(i) : i + 1);
  const b = (i: number) => (exceedsBottom(i) ? toTop(i) : i + columns);
  const l = (i: number) => (exceedsLeft(i) ? toRight(i) : i - 1);
  const tl = (i: number) => l(t(i));
  const tr = (i: number) => r(t(i));
  const bl = (i: number) => l(b(i));
  const br = (i: number) => r(b(i));
  return [t, r, b, l, tl, tr, bl, br].map((fn) => fn(idx));
}

function initializeGameState(columns: number, rows: number) {
  return Array(columns * rows)
    .fill(null)
    .map(() => (Math.random() >= 0.5 ? Condition.DEAD : Condition.ALIVE));
}

export const Board: React.FC<{ containerRect: DOMRect }> = ({
  containerRect,
}) => {
  const boardRef = React.useRef<SVGSVGElement>(null);
  const boardWidth = containerRect.width;
  const boardHeight = containerRect.height;
  const columns = Math.floor((boardWidth / boardHeight) * 20);
  const rows = Math.floor((boardWidth / boardHeight) * 20);
  const cellWidth = boardWidth / columns;
  const cellHeight = boardHeight / rows;

  const [deadColor, setDeadColor] = React.useState(chroma.random().hex());
  const [aliveColor, setAliveColor] = React.useState(chroma.random().hex());
  const [gameState, setGameState] = React.useState(
    initializeGameState(columns, rows)
  );

  const resetBoard = React.useCallback(() => {
    setDeadColor(chroma.random().hex());
    setAliveColor(chroma.random().hex());
    setGameState(initializeGameState(columns, rows));
  }, [rows, columns, setDeadColor, setAliveColor]);

  React.useEffect(() => {
    setGameState(initializeGameState(columns, rows));
  }, [columns, rows]);

  const getFill = React.useCallback(
    (c: Condition) => {
      return c === Condition.ALIVE ? aliveColor : deadColor;
    },
    [deadColor, aliveColor]
  );

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
              .attr("cx", "100%")
              .attr("x", getXOffset)
              .attr("y", getYOffset)
              .on("click", resetBoard),
          (update) =>
            update
              .attr("width", cellWidth)
              .attr("height", cellHeight)
              .attr("fill", getFill)
              .attr("x", getXOffset)
              .attr("y", getYOffset),
          (exit) => exit.remove()
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
    getFill,
    resetBoard,
  ]);

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setGameState(
        gameState.map((cell, idx) => {
          const neighborPositions = getNeighborPositions(columns, rows, idx);
          const neighbors = neighborPositions
            .map((idx) => gameState[idx])
            .filter((cell) => cell === Condition.ALIVE).length;

          const next = cellMachine.transition(cell, CellEvent.TICK, {
            neighbors,
          }).value;

          if (next === Condition.ALIVE) {
            return Condition.ALIVE;
          } else {
            return Condition.DEAD;
          }
        })
      );
    });
    return () => {
      window.cancelAnimationFrame(frame);
    };
  });

  return <svg ref={boardRef} />;
};

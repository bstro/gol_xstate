import { Machine } from "xstate";

export enum Condition {
  ALIVE = "ALIVE",
  DEAD = "DEAD",
}

export enum Event {
  TICK = "TICK",
}

interface CellContext {
  neighbors: number;
}

type CellStateSchema = {
  states: {
    [Condition.ALIVE]: {};
    [Condition.DEAD]: {};
  };
};

export const cellMachine = Machine<
  CellContext,
  CellStateSchema,
  { type: Event.TICK }
>({
  id: "toggle",
  initial: Condition.DEAD,
  context: { neighbors: 0 },
  states: {
    [Condition.ALIVE]: {
      on: {
        TICK: {
          target: Condition.DEAD,
          cond: ({ neighbors }) => neighbors !== 2 && neighbors !== 3,
        },
      },
    },
    [Condition.DEAD]: {
      on: {
        TICK: {
          target: Condition.ALIVE,
          cond: ({ neighbors }) => neighbors === 3,
        },
      },
    },
  },
});

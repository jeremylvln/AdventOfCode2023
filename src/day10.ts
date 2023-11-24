import { match } from 'ts-pattern';

import { day } from './lib';
import { impossible, chunkArray } from './utils';

type State = {
  // CPU
  readonly cycle: number;
  readonly instructionIndex: number;
  readonly cooldown: number;
  readonly registerX: number;
  readonly remarkableValues: Map<number, number>;

  // GPU
  readonly screenBuffer: ('#' | '.')[];
};

type Instruction =
  | {
      type: 'noop';
      time: 0;
    }
  | {
      type: 'addx';
      time: 1;
      value: number;
    };

const INITIAL_STATE: State = {
  // CPU
  cycle: 1,
  instructionIndex: 0,
  cooldown: 0,
  registerX: 1,
  remarkableValues: new Map(),

  // GPU
  screenBuffer: Array.from({ length: 240 }, () => '.'),
};

const decodeProgram = (input: readonly string[]): readonly Instruction[] =>
  input
    .map((line) => line.split(' '))
    .map(([inst, ...args]) =>
      match<string, Instruction>(inst!)
        .with('noop', () => ({ type: 'noop', time: 0 }))
        .with('addx', () => ({ type: 'addx', time: 1, value: Number(args[0]) }))
        .otherwise(impossible),
    );

const tick = (program: readonly Instruction[], state: State): State => {
  if (state.instructionIndex === program.length) return state;

  const remarkableValues = new Map(state.remarkableValues);
  if ((state.cycle - 20) % 40 === 0)
    remarkableValues.set(state.cycle, state.registerX);

  const instruction = program[state.instructionIndex]!;
  const nextCooldown =
    state.cooldown > 0 ? state.cooldown - 1 : instruction.time;

  const screenIndex = state.cycle - 1;
  const newScreenBuffer = Array.from(state.screenBuffer);
  newScreenBuffer[screenIndex] =
    state.registerX === (screenIndex % 40) - 1 ||
    state.registerX === screenIndex % 40 ||
    state.registerX === (screenIndex % 40) + 1
      ? '#'
      : '.';

  if (nextCooldown === 0) {
    let nextRegisterX = state.registerX;

    if (instruction.type === 'addx') nextRegisterX += instruction.value;

    return tick(program, {
      ...state,
      cycle: state.cycle + 1,
      instructionIndex: state.instructionIndex + 1,
      cooldown: 0,
      registerX: nextRegisterX,
      remarkableValues,
      screenBuffer: newScreenBuffer,
    });
  }

  return tick(program, {
    ...state,
    cycle: state.cycle + 1,
    cooldown: nextCooldown,
    remarkableValues,
    screenBuffer: newScreenBuffer,
  });
};

day(10, (input, part) => {
  const program = decodeProgram(input);
  const result = tick(program, INITIAL_STATE);

  part(1, () =>
    Array.from(result.remarkableValues.entries()).reduce(
      (acc, [k, v]) => acc + k * v,
      0,
    ),
  );

  part(2, () => {
    const screenLines = chunkArray(result.screenBuffer, 40).map((line) =>
      line.join(''),
    );
    return `\n${screenLines.join('\n')}`;
  });
});

import { day } from './lib';

type Stack = string[];
type State = Stack[];

const MOVE_LINE_REGEX = /^move\s(\d+)\sfrom\s(\d+)\sto\s(\d+)$/;

const readInitialState = (input: readonly string[]): [State, number] => {
  const stackCount = (input[0]!.length + 1) / 4;
  const state: State = Array.from({ length: stackCount }, () => []);

  const stackNameLineIndex = input.findIndex((line) => line.startsWith(' 1 '));
  const stackLines = input.slice(0, stackNameLineIndex);

  stackLines.forEach((line) => {
    const stackLetters = Array.from({ length: stackCount }, (_, stackIndex) =>
      line.charAt(stackIndex * 4 + 1),
    );

    stackLetters.forEach((letter, stackIndex) => {
      if (letter !== ' ') state[stackIndex]!.unshift(letter);
    });
  });

  return [state, stackLines.length + 2];
};

const cloneState = (state: State): State => JSON.parse(JSON.stringify(state));

const applyMoveToState = (
  state: State,
  moveLine: string,
  fast: boolean,
): State => {
  const res = MOVE_LINE_REGEX.exec(moveLine)!;
  const nb = Number(res[1]);
  const from = Number(res[2]) - 1;
  const to = Number(res[3]) - 1;

  const newState = cloneState(state);
  const toStack = newState[to]!;
  const fromStack = newState[from]!;

  if (fast) toStack.push(...fromStack.splice(fromStack.length - nb));
  else Array.from({ length: nb }, () => toStack.push(fromStack.pop()!));

  return newState;
};

day(5, (input, part) => {
  const [state, currentLineIndex] = readInitialState(input);

  part(1, () => {
    const finalState = input
      .slice(currentLineIndex)
      .reduce((state, line) => applyMoveToState(state, line, false), state);

    return finalState
      .map((stack) => stack[stack.length - 1]!)
      .reduce((acc, letter) => acc + letter, '');
  });

  part(2, () => {
    const finalState = input
      .slice(currentLineIndex)
      .reduce((state, line) => applyMoveToState(state, line, true), state);

    return finalState
      .map((stack) => stack[stack.length - 1]!)
      .reduce((acc, letter) => acc + letter, '');
  });
});

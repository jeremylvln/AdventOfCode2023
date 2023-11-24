import { match } from 'ts-pattern';

import { day } from './lib';

type WorryLevel = number;
type OperationSymbol = '+' | '-' | '*' | '/';
type PredicateFactor = number;

type MonkeyIndex = number;
type MonkeyOperation = (worryLevel: WorryLevel) => WorryLevel;
type MonkeyPredicate = (worryLevel: WorryLevel) => MonkeyIndex;

type MonkeyHandle = {
  inventory: WorryLevel[];
  operationFn: MonkeyOperation;
  predicateFn: MonkeyPredicate;
  itemCount: number;
};

// ---
// Big thanks to https://todd.ginsberg.com/post/advent-of-code/2022/day11/
// for explaining my the math logic around the "magic factor modulo"
// for the Part 2!
// ---

const parseOperation = (line: string): MonkeyOperation => {
  const [tokenA, op, tokenB] = line
    .slice('Operation: new = '.length)
    .split(' ') as [string, OperationSymbol, string];

  const createOperationFn = (
    worryLevel: WorryLevel,
    mathOp: (a: WorryLevel, b: WorryLevel) => WorryLevel,
  ) =>
    mathOp(
      tokenA === 'old' ? worryLevel : Number(tokenA),
      tokenB === 'old' ? worryLevel : Number(tokenB),
    );

  return match<OperationSymbol, MonkeyOperation>(op)
    .with(
      '+',
      () => (worryLevel) => createOperationFn(worryLevel, (a, b) => a + b),
    )
    .with(
      '-',
      () => (worryLevel) => createOperationFn(worryLevel, (a, b) => a - b),
    )
    .with(
      '*',
      () => (worryLevel) => createOperationFn(worryLevel, (a, b) => a * b),
    )
    .with(
      '/',
      () => (worryLevel) => createOperationFn(worryLevel, (a, b) => a / b),
    )
    .exhaustive();
};

const parsePredicate = (
  line: string,
  lineNext: string,
  lineNext2: string,
): [MonkeyPredicate, PredicateFactor] => {
  const ifTrueLine = lineNext.trimStart();
  const ifFalseLine = lineNext2.trimStart();

  const divideBy = Number(line.slice('Test: divisible by '.length));
  const trueMonkeyIndex = Number(
    ifTrueLine.slice('If true: throw to monkey '.length),
  );
  const falseMonkeyIndex = Number(
    ifFalseLine.slice('If false: throw to monkey '.length),
  );

  return [
    (worryLevel) =>
      worryLevel % divideBy === 0 ? trueMonkeyIndex : falseMonkeyIndex,
    divideBy,
  ];
};

const parseInitialState = (
  input: readonly string[],
): [readonly MonkeyHandle[], PredicateFactor] => {
  const monkeys: MonkeyHandle[] = [];
  let magicFactor: PredicateFactor = 1;

  for (let i = 0; i < input.length; i += 1) {
    const line = input[i]!.trimStart();

    if (line.startsWith('Monkey')) {
      monkeys.push({
        inventory: [],
        operationFn: () => 0,
        predicateFn: () => 0,
        itemCount: 0,
      });
    } else if (line.startsWith('Starting items: ')) {
      const items = line
        .slice('Starting items: '.length)
        .split(', ')
        .map(Number);

      monkeys[monkeys.length - 1]!.inventory.push(...items);
    } else if (line.startsWith('Operation: ')) {
      monkeys[monkeys.length - 1]!.operationFn = parseOperation(line);
    } else if (line.startsWith('Test: ')) {
      const ifTrueLine = input[i + 1]!.trimStart();
      const ifFalseLine = input[i + 2]!.trimStart();

      const [predicateFn, predicateFactor] = parsePredicate(
        line,
        ifTrueLine,
        ifFalseLine,
      );

      monkeys[monkeys.length - 1]!.predicateFn = predicateFn;
      magicFactor *= predicateFactor;
    }
  }

  return [monkeys, magicFactor];
};

const playMonkeyTurn = (
  monkeys: readonly MonkeyHandle[],
  index: number,
  worryLevelModifier: 'chill' | number,
): void => {
  const monkey = monkeys[index]!;

  while (monkey.inventory.length > 0) {
    const item = monkey.inventory.shift()!;
    const inspectedLevel = monkey.operationFn(item);
    const fixedLevel =
      worryLevelModifier === 'chill'
        ? Math.floor(inspectedLevel / 3)
        : inspectedLevel % worryLevelModifier;
    const targetMonkeyIndex = monkey.predicateFn(fixedLevel);
    monkeys[targetMonkeyIndex]!.inventory.push(fixedLevel);
    monkey.itemCount += 1;
  }
};

const playRound = (
  monkeys: readonly MonkeyHandle[],
  worryLevelModifier: 'chill' | number,
): void =>
  monkeys.forEach((_, i) => playMonkeyTurn(monkeys, i, worryLevelModifier));

day(11, (input, part) => {
  part(1, () => {
    const [monkeys] = parseInitialState(input);
    for (let i = 0; i < 20; i += 1) playRound(monkeys, 'chill');

    const sortedItemCounts = monkeys
      .map((monkey) => monkey.itemCount)
      .sort((a, b) => b - a);
    return sortedItemCounts[0]! * sortedItemCounts[1]!;
  });

  part(2, () => {
    const [monkeys, magicFactor] = parseInitialState(input);
    for (let i = 0; i < 10_000; i += 1) playRound(monkeys, magicFactor);

    const sortedItemCounts = monkeys
      .map((monkey) => monkey.itemCount)
      .sort((a, b) => b - a);
    return sortedItemCounts[0]! * sortedItemCounts[1]!;
  });
});

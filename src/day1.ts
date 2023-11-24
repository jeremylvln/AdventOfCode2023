import { day } from './lib';

day(1, (input, part) => {
  const inventories = input.reduce((acc, line) => {
    if (line === '') acc.push(0);
    else acc[acc.length - 1] += parseInt(line, 10);
    return acc;
  }, [] as number[]);

  part(1, () => inventories.sort((a, b) => a - b)[0] as number);
  part(2, () => inventories.slice(0, 3).reduce((acc, nb) => acc + nb, 0));
});

import { Option } from '@swan-io/boxed';

import { day } from './lib.js';
import { impossible, sum } from './utils.js';

type WorkflowName = string;
type Category = 'x' | 'm' | 'a' | 's';

type Condition =
  | {
      type: 'compare';
      category: Category;
      comparison: '>' | '<';
      value: number;
      redirectTo: WorkflowName;
    }
  | {
      type: 'direct';
      redirectTo: WorkflowName;
    };

type Workflow = {
  name: string;
  conditions: readonly Condition[];
};

type WorkflowMap = Map<WorkflowName, Workflow>;
type WorkflowPartsMap = Map<WorkflowName, Part[]>;

type Part = {
  [category in Category]: number;
};

type Outcome = {
  part: Part;
  outcome: 'A' | 'R';
};

const parseWorkflow = (line: string): Workflow => {
  const name = line.split('{')[0]!;
  const rawConditions = line
    .slice(line.indexOf('{') + 1, line.indexOf('}'))!
    .split(',');

  const conditions = rawConditions.map((rawCondition): Condition => {
    if (rawCondition.includes(':')) {
      const [rawComparison, redirectTo] = rawCondition.split(':') as [
        string,
        string,
      ];

      const compareLocation = [...rawComparison].findIndex((char) =>
        ['>', '<'].includes(char),
      );

      return {
        type: 'compare',
        category: rawComparison.slice(0, compareLocation) as Category,
        comparison: rawComparison[compareLocation] as '>' | '<',
        value: Number.parseInt(rawComparison.slice(compareLocation + 1)),
        redirectTo,
      };
    } else {
      return {
        type: 'direct',
        redirectTo: rawCondition,
      };
    }
  });

  return {
    name,
    conditions,
  };
};

const parsePart = (line: string): Part => {
  const categories = line
    .slice(1, -1)
    .split(',')
    .map((rawCategory) => rawCategory.split('=') as [Category, string])
    .map(([category, value]) => [category, Number.parseInt(value)] as const);

  const part: Part = {
    x: 0,
    m: 0,
    a: 0,
    s: 0,
  };

  for (const [category, value] of categories) {
    part[category] = value;
  }

  return part;
};

const parseWorkflowsAndParts = (
  input: readonly string[],
): [workflows: WorkflowMap, parts: readonly Part[]] => {
  const workflows: WorkflowMap = new Map();
  const parts: Part[] = [];
  let hasSeenEmptyLine = false;

  for (const line of input) {
    if (line === '') {
      hasSeenEmptyLine = true;
      continue;
    }

    if (hasSeenEmptyLine) {
      parts.push(parsePart(line));
    } else {
      const workflow = parseWorkflow(line);
      workflows.set(workflow.name, workflow);
    }
  }

  return [workflows, parts];
};

const applyWorkflowToPart = (
  partsOnWorkflows: WorkflowPartsMap,
  workflow: Workflow,
  part: Part,
): Option<Outcome> => {
  let redirectTo = Option.None<WorkflowName>();

  for (const condition of workflow.conditions) {
    if (condition.type === 'direct') {
      redirectTo = Option.Some(condition.redirectTo);
      break;
    }

    if (
      (condition.comparison === '<' &&
        part[condition.category] < condition.value) ||
      (condition.comparison === '>' &&
        part[condition.category] > condition.value)
    ) {
      redirectTo = Option.Some(condition.redirectTo);
      break;
    }
  }

  if (redirectTo.isNone()) {
    return impossible();
  }

  if (redirectTo.value === 'A' || redirectTo.value === 'R') {
    return Option.Some({
      part,
      outcome: redirectTo.value,
    });
  }

  if (partsOnWorkflows.has(redirectTo.value)) {
    partsOnWorkflows.get(redirectTo.value)!.push(part);
  } else {
    partsOnWorkflows.set(redirectTo.value, [part]);
  }

  return Option.None();
};

const sortParts = (
  workflows: WorkflowMap,
  parts: readonly Part[],
): Outcome[] => {
  const partsOnWorkflows: WorkflowPartsMap = new Map();
  const outcomes: Outcome[] = [];
  partsOnWorkflows.set('in', [...parts]);

  while (partsOnWorkflows.size > 0) {
    for (const [workflowName, parts] of partsOnWorkflows) {
      const workflow = workflows.get(workflowName)!;

      for (const part of parts.splice(0)) {
        const outcome = applyWorkflowToPart(partsOnWorkflows, workflow, part);
        if (outcome.isSome()) {
          outcomes.push(outcome.value);
        }
      }

      if (parts.length === 0) {
        partsOnWorkflows.delete(workflowName);
      }
    }
  }

  return outcomes;
};

day(19, (input, part) => {
  const [workflows, parts] = parseWorkflowsAndParts(input);
  const sortedParts = sortParts(workflows, parts);

  part(1, () =>
    sum(
      sortedParts
        .filter((outcome) => outcome.outcome === 'A')
        .map((outcome) => sum(Object.values(outcome.part))),
    ),
  );
  part(2, () => 0);
});

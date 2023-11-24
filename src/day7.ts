import { day } from './lib';

type NodeAttributes = {
  type: string;
  name: string;
  size: number;
};

type DirectoryNode = NodeAttributes & {
  type: 'directory';
  children: Node[];
};

type FileNode = NodeAttributes & {
  type: 'file';
};

type Node = DirectoryNode | FileNode;

type RootNode = Node & {
  type: 'directory';
  name: '/';
};

const discoverFileSystem = (input: readonly string[]): RootNode => {
  const root: RootNode = {
    type: 'directory',
    name: '/',
    size: 0,
    children: [],
  };

  const getDirectoryAtPath = (
    node: DirectoryNode,
    path: string[],
  ): DirectoryNode | null => {
    if (path.length === 0) return node;

    const directChild = node.children.find(
      (node): node is DirectoryNode =>
        node.type === 'directory' && node.name === path[0],
    );

    if (!directChild) return null;
    if (path.length === 1) return directChild;
    else return getDirectoryAtPath(directChild, path.slice(1));
  };

  const currentPath: string[] = [];

  input.forEach((line) => {
    if (line.startsWith('$ ')) {
      const command = line.substring('$ '.length).split(' ');

      if (command[0] === 'cd') {
        const cdPath = command[1]!;
        if (cdPath === '..') currentPath.pop();
        else currentPath.push(cdPath);
      }
    } else {
      const currentDirectoryNode = getDirectoryAtPath(root, currentPath)!;
      const [typeOrSize, name] = line.split(' ') as ['dir' | string, string];

      if (typeOrSize === 'dir') {
        currentDirectoryNode.children.push({
          type: 'directory',
          name,
          size: 0,
          children: [],
        });
      } else {
        currentDirectoryNode.children.push({
          type: 'file',
          name,
          size: Number(typeOrSize),
        });
      }
    }
  });

  const updateDirectorySize = (node: DirectoryNode) => {
    node.children
      .filter((node): node is DirectoryNode => node.type === 'directory')
      .forEach((node) => updateDirectorySize(node));
    node.size = node.children.reduce((acc, node) => acc + node.size, 0);
  };

  updateDirectorySize(root);
  return root;
};

const extractDirectoriesFlatten = (node: DirectoryNode): DirectoryNode[] => [
  node,
  ...node.children
    .filter((child): child is DirectoryNode => child.type === 'directory')
    .flatMap(extractDirectoriesFlatten),
];

day(7, (input, part) => {
  const fs = discoverFileSystem(input.slice(1));

  part(1, () =>
    extractDirectoriesFlatten(fs)
      .filter((node) => node.size < 100000)
      .reduce((acc, node) => acc + node.size, 0),
  );

  part(2, () => {
    const freeSpace = 70000000 - fs.size;
    const neededSpace = 30000000 - freeSpace;
    return extractDirectoriesFlatten(fs)
      .filter((node) => node.size >= neededSpace)
      .sort((a, b) => a.size - b.size)[0]!.size;
  });
});

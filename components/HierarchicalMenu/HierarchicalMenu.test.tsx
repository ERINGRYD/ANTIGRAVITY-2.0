// @ts-nocheck
import { hasCycles } from './utils';
import { HierarchyTree } from './types';

describe('HierarchicalMenu Utils', () => {
  it('detects cycles correctly', () => {
    const nodeA = { id: 'A', label: 'Node A', children: [] };
    const nodeB = { id: 'B', label: 'Node B', children: [nodeA] };
    // Create cycle
    nodeA.children.push(nodeB);

    const treeWithCycle: HierarchyTree = [nodeA];
    expect(hasCycles(treeWithCycle)).toBe(true);
  });

  it('passes on valid tree', () => {
    const validTree: HierarchyTree = [
      {
        id: '1',
        label: 'Node 1',
        children: [
          { id: '2', label: 'Node 2' }
        ]
      }
    ];
    expect(hasCycles(validTree)).toBe(false);
  });
});

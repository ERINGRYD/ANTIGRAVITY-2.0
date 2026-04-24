import { HierarchyTree } from './types';

/**
 * Detecção de ciclos em uma estrutura de árvore hierárquica.
 * Retorna true se houver ciclo, false caso contrário.
 * @param tree Array raiz de itens da hierarquia.
 */
export function hasCycles(tree: HierarchyTree): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodes: HierarchyTree | undefined): boolean {
    if (!nodes) return false;
    for (const node of nodes) {
      if (recursionStack.has(node.id)) {
        return true; // Ciclo detectado!
      }
      if (visited.has(node.id)) {
        continue;
      }
      
      visited.add(node.id);
      recursionStack.add(node.id);
      
      if (dfs(node.children)) {
        return true;
      }
      
      recursionStack.delete(node.id);
    }
    return false;
  }

  return dfs(tree);
}

/**
 * Funções para persistência de estado do menu no LocalStorage
 */
const STORAGE_PREFIX = 'hierarchical_menu_expanded_';

export function getExpandedState(id: string, defaultState: boolean = false): boolean {
  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
    if (item !== null) {
      return JSON.parse(item) === true;
    }
  } catch (e) {
    console.warn('Erro ao ler localStorage', e);
  }
  return defaultState;
}

export function setExpandedState(id: string, state: boolean): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(state));
  } catch (e) {
    console.warn('Erro ao salvar no localStorage', e);
  }
}

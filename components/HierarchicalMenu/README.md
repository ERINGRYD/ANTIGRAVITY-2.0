# Menu Hierárquico (6 Níveis)

Este módulo fornece um componente React `HierarchicalMenu` completo e acessível, capaz de renderizar até 6 níveis de profundidade de navegação com recuo progressivo, persistência de estado (localStorage) e navegação completa por teclado.

## Especificações Atendidas

1. **Visuais**: Recuo progressivo (20px por nível), ícone de chevrons, estilos tipográficos que variam de acordo com a profundidade (`font-weight`, `font-size`).
2. **Responsividade**: Layout que se adapta a telas mobile (com menu hambúrguer interativo), tablets e desktops.
3. **Acessibilidade**: Atributos `aria-expanded`, `aria-level`, `aria-selected`, `role="tree"` / `role="treeitem"`, navegação nativa com `Tab` e auxílio de navegação com Setas, suporte NVDA/JAWS/VoiceOver.
4. **Persistência**: O estado de expansão de cada nó é salvo em `localStorage`.
5. **Algoritmo Anti-Ciclo**: Antes da renderização, a função analítica `hasCycles` roda uma Busca em Profundidade (DFS) verificando estruturas circulares infinitas, reportando erro visual caso encontre falhas estruturais, evitando crash da página.
6. **Testes Unitários**: Scripts contêm a suíte básica Jest para testar detecção de ciclo. Suíte 100% preparada nativamente.

## Exemplo de Uso

```tsx
import { HierarchicalMenu } from './components/HierarchicalMenu/HierarchicalMenu';
import { HierarchyTree } from './components/HierarchicalMenu/types';

const exampleData: HierarchyTree = [
  {
    id: "raiz-1",
    label: "Compreensão de Textos",
    icon: <span className="material-icons-round">book</span>,
    children: [
      {
        id: "sub-1-1",
        label: "Tipologia Textual (Nível 2)",
        children: [
          {
            id: "sub-1-1-1",
            label: "Textos Narrativos (Nível 3)",
            children: [
              {
                id: "sub-1-1-1-1",
                label: "Foco Narrativo (Nível 4)",
                children: [
                  {
                    id: "sub-1-1-1-1-1",
                    label: "Primeira Pessoa (Nível 5)",
                    children: [
                      {
                        id: "sub-1-1-1-1-1-1",
                        label: "Narrador Personagem (Nível 6)",
                        href: "/topico/narrador-personagem"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

export function AppView() {
  return (
    <div className="flex h-screen w-full">
      <HierarchicalMenu data={exampleData} title="Estrutura de Conteúdo" />
      <main className="flex-1 p-8">Conteúdo principal...</main>
    </div>
  );
}
```

## Guia de Estilos

- Os ícones utilizam `material-icons-round` baseados pelo Google. O projeto também está adaptado com TailwindCSS.
- As identações são controladas no `paddingLeft` geradas via cálculo `(level - 1) * 20` acoplado com uma margem de segurança visual da UI.

## Documentação Técnica
- DFS Stack Check: A função de HasCycles usa validação algorítmica de Set(visited, stack) onde O(n) complexidade linear valida milhares de campos rapidamente, prevenindo "Maximum Call Stack Size Exceeded".

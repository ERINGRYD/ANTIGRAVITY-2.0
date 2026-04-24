export interface HierarchyItem {
  id: string;
  label: string;
  children?: HierarchyItem[];
  href?: string;
  icon?: React.ReactNode;
}

export type HierarchyTree = HierarchyItem[];

import React, { useState, useEffect, useRef } from 'react';
import { HierarchyItem } from './types';
import { getExpandedState, setExpandedState } from './utils';

interface HierarchicalNodeProps {
  item: HierarchyItem;
  level: number;
}

const getLevelStyles = (level: number) => {
  switch (level) {
    case 1:
      return 'text-[18px] font-bold text-slate-900 dark:text-white';
    case 2:
      return 'text-[16px] font-semibold text-slate-800 dark:text-slate-100';
    case 3:
      return 'text-[15px] font-medium text-slate-700 dark:text-slate-300';
    case 4:
      return 'text-[14px] font-normal text-slate-600 dark:text-slate-400';
    case 5:
      return 'text-[13px] font-normal text-slate-500 dark:text-slate-400';
    default: // 6+
      return 'text-[12px] font-normal text-slate-400 dark:text-slate-500';
  }
};

export const HierarchicalNode: React.FC<HierarchicalNodeProps> = ({ item, level }) => {
  const hasChildren = item.children && item.children.length > 0;
  
  // Níveis de 1 a 6 são permitidos, limitamos visualmente
  const visualLevel = Math.min(level, 6);
  
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    // Apenas nós com filhos podem ser expandidos
    if (!hasChildren) return false;
    return getExpandedState(item.id, level <= 2);
  });

  const nodeRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  const toggleExpand = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (hasChildren) {
      const newState = !isExpanded;
      setIsExpanded(newState);
      setExpandedState(item.id, newState);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      toggleExpand(e);
      if (item.href && !hasChildren) {
        window.location.href = item.href;
      }
    } else if (e.key === 'ArrowRight') {
      if (hasChildren && !isExpanded) {
        toggleExpand(e);
      } else if (hasChildren && isExpanded) {
        // Move focus to first child
        setTimeout(() => {
          const nextElement = nodeRef.current?.closest('li')?.querySelector('ul li button, ul li a') as HTMLElement;
          if (nextElement) nextElement.focus();
        }, 0);
      }
    } else if (e.key === 'ArrowLeft') {
      if (hasChildren && isExpanded) {
        toggleExpand(e);
      } else {
        // Move focus to parent
        const parentList = nodeRef.current?.closest('ul')?.closest('li');
        const parentBtn = parentList?.querySelector('button, a') as HTMLElement;
        if (parentBtn) parentBtn.focus();
      }
    } else if (e.key === 'ArrowDown') {
      // Basic vertical navigation
      e.preventDefault();
      const allNodes = Array.from(document.querySelectorAll('[data-treenode="true"]')) as HTMLElement[];
      const currentIndex = allNodes.indexOf(nodeRef.current as HTMLElement);
      if (currentIndex >= 0 && currentIndex < allNodes.length - 1) {
        allNodes[currentIndex + 1].focus();
      }
    } else if (e.key === 'ArrowUp') {
      // Basic vertical navigation
      e.preventDefault();
      const allNodes = Array.from(document.querySelectorAll('[data-treenode="true"]')) as HTMLElement[];
      const currentIndex = allNodes.indexOf(nodeRef.current as HTMLElement);
      if (currentIndex > 0) {
        allNodes[currentIndex - 1].focus();
      }
    }
  };

  const paddingLeft = (level - 1) * 20;

  const content = (
    <>
      <div className={`flex items-center gap-2 flex-1 w-full text-left py-2 px-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-slate-50 dark:focus:bg-slate-800`} style={{ paddingLeft: `${paddingLeft + 12}px` }}>
        {hasChildren && (
          <span 
            className={`material-icons-round text-sm transition-transform duration-200 text-slate-400 ${isExpanded ? 'rotate-90' : ''}`}
            aria-hidden="true"
          >
            chevron_right
          </span>
        )}
        {!hasChildren && <span className="w-4" />} {/* Spacer for alignment */}
        {item.icon && <span className="text-slate-500" aria-hidden="true">{item.icon}</span>}
        <span className={`block truncate ${getLevelStyles(visualLevel)}`}>
          {item.label}
        </span>
      </div>
    </>
  );

  return (
    <li role="none" className="block w-full">
      {hasChildren ? (
        <button
          ref={nodeRef as React.RefObject<HTMLButtonElement>}
          role="treeitem"
          aria-expanded={isExpanded}
          aria-selected="false"
          aria-level={level}
          data-treenode="true"
          onClick={toggleExpand}
          onKeyDown={handleKeyDown}
          className="w-full flex"
          tabIndex={0}
        >
          {content}
        </button>
      ) : (
        <a
          ref={nodeRef as React.RefObject<HTMLAnchorElement>}
          role="treeitem"
          aria-selected="false"
          aria-level={level}
          data-treenode="true"
          href={item.href || '#'}
          onClick={(e) => {
            if (!item.href) e.preventDefault();
          }}
          onKeyDown={handleKeyDown}
          className="w-full flex"
          tabIndex={0}
        >
          {content}
        </a>
      )}

      {hasChildren && isExpanded && (
        <ul role="group" className="flex flex-col w-full text-left">
          {item.children!.map((child) => (
            <HierarchicalNode key={child.id} item={child} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { NodeView, ViewMutationRecord } from '@tiptap/pm/view';
import { getColStyleDeclaration } from './utilities/colStyle';
import { unstable_batchedUpdates } from 'react-dom';

export function updateColumns(
  node: ProseMirrorNode,
  colgroup: HTMLTableColElement,
  table: HTMLTableElement,
  cellMinWidth: number,
  overrideCol?: number,
  overrideValue?: number,
) {
  let totalWidth = 0;
  let fixedWidth = true;
  let nextDOM = colgroup.firstChild as HTMLTableColElement | null;
  const row = node.firstChild;
  const updates: Array<() => void> = [];

  if (row !== null) {
    for (let i = 0, col = 0; i < row.childCount; i += 1) {
      const { colspan, colwidth } = row.child(i).attrs;

      for (let j = 0; j < colspan; j += 1, col += 1) {
        const hasWidth = overrideCol === col ? overrideValue : (colwidth && colwidth[j]);
        const cssWidth = hasWidth ? `${hasWidth}px` : '';

        totalWidth += hasWidth || cellMinWidth;

        if (!hasWidth) {
          fixedWidth = false;
        }

        if (!nextDOM) {
          const colElement = document.createElement('col');
          updates.push(() => {
            const [propertyKey, propertyValue] = getColStyleDeclaration(cellMinWidth, hasWidth);
            colElement.style.setProperty(propertyKey, propertyValue);
            colgroup.appendChild(colElement);
          });
        } else {
          if (nextDOM.style && nextDOM.style.width !== cssWidth) {
            updates.push(() => {
              const [propertyKey, propertyValue] = getColStyleDeclaration(cellMinWidth, hasWidth);
              if (nextDOM) {
                nextDOM.style.setProperty(propertyKey, propertyValue);
              }
            });
          }
          nextDOM = nextDOM.nextSibling as HTMLTableColElement | null;
        }
      }
    }
  }

  while (nextDOM) {
    const after = nextDOM.nextSibling as HTMLTableColElement | null;
    const currentDOM = nextDOM; // Capture current DOM node in closure
    updates.push(() => currentDOM.parentNode?.removeChild(currentDOM));
    nextDOM = after;
  }

  // Batch all DOM updates
  unstable_batchedUpdates(() => {
    updates.forEach(update => update());

    if (fixedWidth) {
      table.style.width = `${totalWidth}px`;
      table.style.minWidth = '';
    } else {
      table.style.width = '';
      table.style.minWidth = `${totalWidth}px`;
    }
  });
}

export class CustomTableView implements NodeView {
  node: ProseMirrorNode;
  cellMinWidth: number;
  dom: HTMLDivElement;
  table: HTMLTableElement;
  colgroup: HTMLTableColElement;
  contentDOM: HTMLTableSectionElement;

  constructor(node: ProseMirrorNode, cellMinWidth: number) {
    this.node = node;
    this.cellMinWidth = cellMinWidth;
    this.dom = document.createElement('div');
    this.dom.className = 'tableWrapper';
    this.table = this.dom.appendChild(document.createElement('table'));
    
    // Batch setting attributes
    unstable_batchedUpdates(() => {
      this.table.setAttribute('data-table-type', node.attrs['data-table-type'] || 'normal');
      this.table.setAttribute('data-table-resizable', 'true');
    });

    this.colgroup = this.table.appendChild(document.createElement('colgroup'));
    updateColumns(node, this.colgroup, this.table, cellMinWidth);
    this.contentDOM = this.table.appendChild(document.createElement('tbody'));
  }

  update(node: ProseMirrorNode) {
    if (node.type !== this.node.type) return false;
    this.node = node;

    // Batch attribute updates
    unstable_batchedUpdates(() => {
      this.table.setAttribute('data-table-type', node.attrs['data-table-type'] || 'normal');
      this.table.setAttribute('data-table-resizable', 'true');
    });

    updateColumns(node, this.colgroup, this.table, this.cellMinWidth);
    return true;
  }

  ignoreMutation(mutation: ViewMutationRecord) {
    return (
      mutation.type === 'attributes' &&
      (mutation.target === this.table || this.colgroup.contains(mutation.target))
    );
  }
}

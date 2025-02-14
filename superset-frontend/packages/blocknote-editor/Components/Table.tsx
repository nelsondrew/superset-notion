import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { BubbleMenu } from '@tiptap/react';
import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Extension } from '@tiptap/core';
import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';

const TableMenu = styled.div`
  display: flex;
  background-color: #ffffff;
  padding: 8px;
  border-radius: 6px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  gap: 6px;
  flex-wrap: wrap;
  max-width: 400px;
  z-index: 1000;
`;

const MenuButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #f8f9fa;
    border-color: #ccc;
    color: #000;
  }

  &:active {
    background: #e9ecef;
  }
`;

const TableWrapper = styled.div`
  position: relative;
  margin: 2rem 0;
`;

const TableEditButton = styled.button`
  position: absolute;
  top: -30px;
  right: 0;
  padding: 6px 12px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #f8f9fa;
    border-color: #ccc;
  }
`;

const CustomTable = Node.create({
  name: 'customTable',
  group: 'block',
  content: 'table',

  parseHTML() {
    return [{ tag: 'div.table-wrapper' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'table-wrapper', ...HTMLAttributes }, 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(({ node, editor }) => {
      const [showMenu, setShowMenu] = useState(false);
      
      return (
        <NodeViewWrapper>
          <TableWrapper>
            <TableEditButton onClick={() => setShowMenu(!showMenu)}>
              ⚙️ Edit Table
            </TableEditButton>
            {showMenu && <TableBubbleMenu editor={editor} />}
          </TableWrapper>
          <NodeViewContent className="table-content">
            {/* Table content will render here */}
          </NodeViewContent>
        </NodeViewWrapper>
      );
    });
  },
});

export const TableBubbleMenu = ({ editor }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const menuRef = useRef(null);

  if (!editor) return null;

  return (
    <>
      {isMenuVisible && (
        <BubbleMenu
          editor={editor}
          shouldShow={() => isMenuVisible}
          tippyOptions={{ 
            duration: 100,
            placement: 'top',
            reference: menuRef.current,
          }}
        >
          <TableMenu>
            <MenuButton onClick={() => editor.chain().focus().addColumnBefore().run()}>
              + Column Before
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().addColumnAfter().run()}>
              + Column After
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().deleteColumn().run()}>
              - Delete Column
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().addRowBefore().run()}>
              + Row Above
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().addRowAfter().run()}>
              + Row Below
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().deleteRow().run()}>
              - Delete Row
            </MenuButton>
            <MenuButton 
              onClick={() => editor.chain().focus().deleteTable().run()}
              style={{ color: '#dc3545' }}
            >
              Delete Table
            </MenuButton>
          </TableMenu>
        </BubbleMenu>
      )}
    </>
  );
};

export const TableExtension = Table.configure({
  resizable: false,
  HTMLAttributes: {
    class: 'table-container',
  },
});

export const TableRowExtension = TableRow;
export const TableHeaderExtension = TableHeader;
export const TableCellExtension = TableCell;

// Update the table item to create a simpler structure
export const tableItem = {
  title: 'Insert Table',
  command: ({ editor, range }) => {
    editor
      .chain()
      .focus()
      .deleteRange(range)
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  },
};

export { CustomTable }; 
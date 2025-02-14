import React from 'react';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import styled from "styled-components";
import { Node } from '@tiptap/core';

const CustomComponentWrapper = styled.div`
  background: #f1f3f5;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
`;

const LineContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  margin: 4px 0;
  background: white;
  border-radius: 4px;
  position: relative;
  
  &:hover {
    background: #f8f9fa;
    
    .line-buttons {
      opacity: 1;
      visibility: visible;
    }
  }
`;

const ButtonsContainer = styled.div`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 4px;
  padding: 0 8px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  background: inherit;
`;

const DragButton = styled.button`
  cursor: grab;
  padding: 4px;
  border: none;
  background: none;
  color: #666;
  display: flex;
  align-items: center;
  
  &:hover {
    color: #000;
  }
`;

const PlusButton = styled.button`
  cursor: pointer;
  padding: 4px;
  border: none;
  background: none;
  color: #666;
  display: flex;
  align-items: center;
  
  &:hover {
    color: #000;
  }
`;

const Content = styled.div`
  flex: 1;
  padding-right: 80px;
`;

interface Line {
  id: string;
  content: string;
}

export const MyEditorComponent = ({ node, updateAttributes }) => {
  const [lines, setLines] = React.useState<Line[]>([
    { id: '1', content: 'Line 1' },
    { id: '2', content: 'Line 2' },
  ]);

  const handleAddLine = (index: number) => {
    const newLines = [...lines];
    newLines.splice(index + 1, 0, {
      id: Math.random().toString(36).substr(2, 9),
      content: `Line ${newLines.length + 1}`,
    });
    setLines(newLines);
    updateAttributes({ lines: newLines });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const newLines = [...lines];
    const [removed] = newLines.splice(dragIndex, 1);
    newLines.splice(dropIndex, 0, removed);
    setLines(newLines);
    updateAttributes({ lines: newLines });
  };

  return (
    <NodeViewWrapper className="custom-component">
      <CustomComponentWrapper>
        {lines.map((line, index) => (
          <LineContainer
            key={line.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <Content>{line.content}</Content>
            <ButtonsContainer className="line-buttons">
              <PlusButton onClick={() => handleAddLine(index)}>+</PlusButton>
              <DragButton>⋮⋮</DragButton>
            </ButtonsContainer>
          </LineContainer>
        ))}
      </CustomComponentWrapper>
    </NodeViewWrapper>
  );
};

export const CustomComponent = Node.create({
  name: 'customComponent',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      lines: {
        default: [
          { id: '1', content: 'Line 1' },
          { id: '2', content: 'Line 2' },
        ]
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="custom-component"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'custom-component', ...HTMLAttributes }, 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MyEditorComponent)
  },
}); 
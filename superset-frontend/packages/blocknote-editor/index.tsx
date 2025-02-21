import React, { useState, useRef, useEffect } from 'react';
import styled from "styled-components";
import 'tippy.js/dist/tippy.css';
import TipTapEditor from "./components-tip-tap/TipTapEditor"
import { useSelector} from 'react-redux';
import { Plus, GripVertical } from 'lucide-react';

const EditorContainer = styled.div`
  text-align: left;
  border: 1px solid #eee;
  border-radius: 4px;
  min-height: 200px;

  .ProseMirror {
    padding: 16px;
    min-height: 100vh;
    position: relative;
    
    &:focus {
      outline: none;
    }

    > * + * {
      margin-top: 0.75em;
    }

    p {
      margin: 0;
      position: relative;
      padding-left: 2rem; /* Make space for the buttons */
    }

    /* Create hover area */
    p::before {
      content: "";
      position: absolute;
      left: -2rem;
      top: 0;
      width: calc(100% + 4rem);
      height: 100%;
      pointer-events: none;
    }

    /* Button container */
    .line-buttons {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      display: none;
      gap: 0.5rem;
      align-items: center;
    }

    /* Show buttons on hover */
    p:hover .line-buttons {
      display: flex;
    }

    /* Button styles */
    .line-button {
      background: none;
      border: none;
      cursor: pointer;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      color: #666;
      
      &:hover {
        background: #f1f3f5;
      }
    }

    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
      margin: 0;
      overflow: hidden;
    }

    td, th {
      min-width: 1em;
      border: 2px solid #ced4da;
      padding: 3px 5px;
      vertical-align: top;
      box-sizing: border-box;
      position: relative;
      
      > * {
        margin-bottom: 0;
      }
    }

    th {
      font-weight: bold;
      background-color: #f8f9fa;
    }

    .table-container {
      position: relative;
      margin: 2rem 0;

      .table-edit-button {
        position: absolute;
        top: -30px;
        right: 0;
        padding: 4px 8px;
        background: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        color: #333;
        opacity: 0;
        transition: opacity 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        &:hover {
          background: #f8f9fa;
          border-color: #ccc;
        }
      }

      &:hover .table-edit-button {
        opacity: 1;
      }
    }
  }

  .slash-menu {
    padding: 0.5rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0px 10px 20px rgba(0, 0, 0, 0.1);
  }

  .slash-menu-item {
    display: block;
    width: 100%;
    padding: 0.5rem;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;

    &:hover {
      background: #f1f3f5;
      border-radius: 0.3rem;
    }
  }
`;

// Update HoverIndicator styling
const HoverIndicator = styled.div`
  position: absolute;
  left: 0px;
  display: flex;
  gap: 4px;
  /* background: #fff; */
  /* border: 1px solid #eee; */
  padding: 4px;
  border-radius: 4px;
  z-index: 50;
  /* box-shadow: 0 2px 4px rgba(0,0,0,0.1); */
`;

const IconButton = styled.button`
  width: 24px;
  height: 24px;
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #6B7280;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #F3F4F6;
    color: #111827;
  }
`;

export default function BlockNoteEditor({ component, hoveredPos, setHoveredPos, setHeadings, parentId }) {
  const editMode = useSelector(state => state?.dashboardState?.editMode);
  const [editorContent, setEditorContent] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const editorRef = useRef(null);

  const handleMouseMove = (event) => {
    const editor = window.editor;
    if (!editor?.view) return;

    const pos = editor.view.posAtCoords({
      left: event.clientX,
      top: event.clientY
    });

    if (pos) {
      const $pos = editor.state.doc.resolve(pos.pos);
      const node = editor.state.doc.nodeAt(pos.pos);
      let foundNode = node;
      let depth = $pos.depth;
      
      while (depth > 0) {
        const parentNode = $pos.node(depth);
        if (
          parentNode.type.name === 'chart' || 
          parentNode.type.name === 'customVideo' ||
          parentNode.type.name === 'customImage' ||
          parentNode.isBlock
        ) {
          foundNode = parentNode;
          break;
        }
        depth--;
      }

      if (foundNode) {
        // Get coordinates of the node
        const coords = editor.view.coordsAtPos(pos.pos);
        
        setHoverInfo({
          type: foundNode.type.name,
          position: pos.pos,
          top: coords.top,
          left: coords.left
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setHoverInfo(null);
  };

  const handleAdd = () => {
    console.log('Add clicked at position:', hoverInfo.position);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    console.log('Drag started at position:', hoverInfo.position);
  };

  return (
    <EditorContainer 
      ref={editorRef}
      className="blocknote-editor"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {hoverInfo && (
        <HoverIndicator
          style={{
            position: 'absolute',
            top: `${hoverInfo.top - 172.52 + 17}px`,
          }}
        >
          <IconButton onClick={handleAdd} title="Add block">
            <Plus size={16} />
          </IconButton>
          <IconButton onMouseDown={handleDrag} title="Drag to move">
            <GripVertical size={16} />
          </IconButton>
        </HoverIndicator>
      )}
      <TipTapEditor 
        editMode={editMode}
        initialContent={editorContent}
        component={component}
        hoveredPos={hoveredPos}
        setHoveredPos={setHoveredPos}
        setHeadings={setHeadings}
        parentId={parentId}
      />
    </EditorContainer>
  );
}
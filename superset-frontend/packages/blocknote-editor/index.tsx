import React, { useState, useRef, useEffect } from 'react';
import styled, { createGlobalStyle } from "styled-components";
import 'tippy.js/dist/tippy.css';
import TipTapEditor from "./components-tip-tap/TipTapEditor"
import { useSelector} from 'react-redux';
import { Plus, GripVertical, Trash2, Palette, Check } from 'lucide-react';
import AddBlockMenu from './components-tip-tap/AddBlockMenu';
import { Popover, Menu } from 'antd';
import { DecorationSet, Decoration } from 'prosemirror-view';
import { Plugin } from 'prosemirror-state';

const GlobalPopoverStyles = createGlobalStyle`
  .ant-popover-inner {
    background: #1a1a1a;
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    padding: 0;
    overflow: hidden;
  }

  .ant-popover-inner-content {
    padding: 0;
  }

  .ant-popover-arrow {
    color: black;
    border-top-color: black !important;
    border-left-color: black !important;
  }

  .ant-popover {
    z-index: 1000;
  }
`;

const EditorContainer = styled.div`
  text-align: left;
  border: 1px solid #eee;
  border-radius: 4px;
  min-height: 200px;
  position: relative;

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
  width: 28px;
  height: 28px;
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

// Add color options
const TEXT_COLORS = [
  { name: 'Default', color: '#FFFFFF', hasCheck: true },
  { name: 'Gray', color: '#9CA3AF' },
  { name: 'Brown', color: '#A47148' },
  { name: 'Red', color: '#EF4444' },
  { name: 'Orange', color: '#F97316' },
  { name: 'Yellow', color: '#EAB308' },
  { name: 'Green', color: '#22C55E' },
  { name: 'Blue', color: '#3B82F6' },
  { name: 'Purple', color: '#A855F7' },
  { name: 'Pink', color: '#EC4899' },
];

const BACKGROUND_COLORS = [
  { name: 'Default', color: 'transparent', hasCheck: true },
  { name: 'Gray', color: '#6B7280' },
  { name: 'Brown', color: '#92400E' },
  { name: 'Red', color: '#991B1B' },
  { name: 'Orange', color: '#9A3412' },
  { name: 'Yellow', color: '#854D0E' },
  { name: 'Green', color: '#166534' },
  { name: 'Blue', color: '#1E40AF' },
  { name: 'Purple', color: '#6B21A8' },
  { name: 'Pink', color: '#9D174D' },
];

// Update the styled menu
const StyledMenu = createGlobalStyle`
  .ant-menu {
    background: #1a1a1a !important;
    padding: 4px;
    min-width: 220px;
    border-radius: 8px;
  }

  .ant-menu-submenu-title,
  .ant-menu-item {
    color: #ffffff !important;
    padding: 8px 12px !important;
    height: auto !important;
    line-height: 1.2 !important;
    margin: 0 !important;
    border-radius: 4px;
    display: flex !important;
    align-items: center;
    gap: 8px;
    font-size: 14px;

    &:hover {
      background: #2d2d2d !important;
      color: #ffffff !important;
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .ant-menu-submenu-popup {
    .ant-menu {
      background: #1a1a1a !important;
    }
  }

  .color-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .color-letter {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
    }

    .check-icon {
      margin-left: auto;
    }
  }

  .color-section-title {
    color: #6B7280;
    font-size: 12px;
    padding: 8px 12px 4px;
    font-weight: 500;
  }
`;

export default function BlockNoteEditor({ component, hoveredPos, setHoveredPos, setHeadings, parentId }) {
  const editMode = useSelector(state => state?.dashboardState?.editMode);
  const [editorContent, setEditorContent] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const editorRef = useRef(null);
  const [isOverPopup, setIsOverPopup] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [showDragMenu, setShowDragMenu] = useState(false);
  const [editorInstance, setEditorInstance] = useState(null);
  const editorInstanceRef= useRef(null);
  
  // Add color state here
  const [selectedTextColor, setSelectedTextColor] = useState('Default');
  const [selectedBgColor, setSelectedBgColor] = useState('Default');


  

  // Move ColorMenu inside component
  const ColorMenu = () => (
    <Menu>
      <div className="color-section-title">Text</div>
      {TEXT_COLORS.map(color => (
        <Menu.Item 
          key={`text-${color.name.toLowerCase()}`}
          onClick={() => {
            // setSelectedTextColor(color.name);
            console.log(editorRef)
            console.log('Selected text color:', color.name);
            editorInstanceRef?.current?.updateNodeAtPosition(hoverInfo?.position, color.name)
          }}
        >
          <div className="color-item">
            <span 
              className="color-letter" 
              style={{ color: color.color }}
            >
              A
            </span>
            {color.name}
            {selectedTextColor === color.name && (
              <Check size={16} className="check-icon" />
            )}
          </div>
        </Menu.Item>
      ))}
      <div className="color-section-title">Background</div>
      {BACKGROUND_COLORS.map(color => (
        <Menu.Item 
          key={`bg-${color.name.toLowerCase()}`}
          onClick={() => {
            // setSelectedBgColor(color.name);
            console.log('Selected background color:', color.name);
            editorInstanceRef?.current?.updateNodeAtPosition(hoverInfo?.position, color.name, true)

          }}
        >
          <div className="color-item">
            <span 
              className="color-letter" 
              style={{ 
                background: color.color === 'transparent' ? '#1a1a1a' : color.color,
                border: color.color === 'transparent' ? '1px solid #4A4A4A' : 'none'
              }}
            >
              A
            </span>
            {color.name}
            {selectedBgColor === color.name && (
              <Check size={16} className="check-icon" />
            )}
          </div>
        </Menu.Item>
      ))}
    </Menu>
  );

  // Move DragMenu inside component too
  const DragMenu = () => (
    <Menu>
      <Menu.Item onClick={() => {
        editorInstanceRef.current.deleteNodeAtPosition(hoverInfo?.position);
      }} key="delete">
        <Trash2 size={16} />
        Delete
      </Menu.Item>
      <Menu.SubMenu 
        key="colors" 
        title={
          <>
            <Palette size={16} />
            Colors
          </>
        }
        popupOffset={[0, -4]}
      >
        <ColorMenu />
      </Menu.SubMenu>
    </Menu>
  );

  useEffect(() => {
    setShowDragMenu(false);
  },[selectedBgColor , selectedTextColor])

  const handleMouseMove = (event) => {
    if(showPopover || showDragMenu) {
      return;
    }

    const editor = editorInstance;
    if (!editor?.view) return;

    const editorContainer = editorRef.current;
    if (!editorContainer) return;
    const containerRect = editorContainer.getBoundingClientRect();

    const pos = editor.view.posAtCoords({
      left: event.clientX,
      top: event.clientY
    });

    if (!pos) {
      setHoverInfo(null);
      return;
    }

    try {
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
        const coords = editor.view.coordsAtPos(pos.pos);
        
        setHoverInfo(prev => {
          if (
            !prev || 
            prev.position !== pos.pos ||
            prev.type !== foundNode.type.name ||
            prev.top !== (coords.top - containerRect.top) ||
            prev.left !== (coords.left - containerRect.left)
          ) {
            return {
              type: foundNode.type.name,
              position: pos.pos,
              top: coords.top - containerRect.top,
              left: coords.left - containerRect.left,
              node : foundNode
            };
          }
          return prev;
        });
      } else {
        setHoverInfo(null);
      }
    } catch (error) {
      console.error('Error in handleMouseMove:', error);
      setHoverInfo(null);
    }
  };

  const handleMouseLeave = (event) => {
    // Only clear hover info if not over popup
    if (!isOverPopup) {
      setHoverInfo(null);
    }
  };


  const handleAdd = () => {
    const editor = editorInstance;
    if (!editor || !hoverInfo) return;
    setShowPopover(true);
  };

  const handlePopoverClose = () => {
    console.log("called popover close")
    setShowPopover(false);
    setIsOverPopup(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    console.log('Drag started at position:', hoverInfo.position);
  };

  const handleDragMenuClose = () => {
    setShowDragMenu(false);
    setIsOverPopup(false);
  };

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      setHoverInfo(null);
      setShowPopover(false);
      setIsOverPopup(false);
    };
  }, []);

  useEffect(() => {
    console.log(hoverInfo?.node, "hover node")
    if(hoverInfo?.node) {
      setSelectedTextColor(hoverInfo?.node?.attrs['data-text-color']);
      setSelectedBgColor(hoverInfo?.node?.attrs['data-bg-color'])
    }
   
  },[hoverInfo])

  return (
    <>
      <GlobalPopoverStyles />
      <StyledMenu />
      <EditorContainer 
        ref={editorRef}
        className="blocknote-editor"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {editMode && hoverInfo && (
          <HoverIndicator
            style={{
              position: 'absolute',
              top: `${hoverInfo.top - 8}px`,
            }}
          >
            <Popover
              visible={showPopover}
              onVisibleChange={(visible) => {
                if (!visible) {
                  handlePopoverClose();
                }
                setIsOverPopup(visible);
              }}
              content={
                <AddBlockMenu
                  editor={editorInstance}
                  position={hoverInfo.position}
                  onClose={handlePopoverClose}
                  onMouseEnter={() => setIsOverPopup(true)}
                  onMouseLeave={() => setIsOverPopup(false)}
                />
              }
              trigger="click"
              placement="bottomLeft"
              destroyTooltipOnHide
            >
              <IconButton onClick={handleAdd} title="Add block">
                <Plus size={32} />
              </IconButton>
            </Popover>
            <Popover
              visible={showDragMenu}
              onVisibleChange={(visible) => {
                if (!visible) {
                  handleDragMenuClose();
                }
                setIsOverPopup(visible);
              }}
              content={<DragMenu />}
              trigger="click"
              placement="bottomLeft"
              destroyTooltipOnHide
            >
              <IconButton 
                onClick={() => setShowDragMenu(true)} 
                title="More options"
              >
                <GripVertical size={32} />
              </IconButton>
            </Popover>
          </HoverIndicator>
        )}
        <TipTapEditor 
          ref={editorInstanceRef}
          editMode={editMode}
          initialContent={editorContent}
          component={component}
          hoveredPos={hoveredPos}
          setHoveredPos={setHoveredPos}
          setHeadings={setHeadings}
          parentId={parentId}
          setEditorInstance={setEditorInstance}
        />
      </EditorContainer>
    </>
  );
}
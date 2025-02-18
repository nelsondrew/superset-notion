'use client'

import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Color from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Typography from '@tiptap/extension-typography'
import { SlashCommand, getSuggestionItems, renderItems } from './extensions/SlashCommand'
import styled from 'styled-components'
import 'tippy.js/dist/tippy.css'
import { useEffect, useState } from 'react'
import { ChartExtension } from './extensions/ChartExtension'
import { ChartBubbleMenu } from './ChartBubbleMenu'
import { EmojiSuggestion } from './extensions/EmojiSuggestion'
import { TextBubbleMenu } from './TextBubbleMenu'
import { FontSize } from './extensions/FontSizeExtension'
import { CustomEmojiUploader } from './CustomEmojiUploader'
import { CustomEmoji } from './extensions/CustomEmojiExtension'
import { AddEmojiModal } from './AddEmojiModal'
import { customEmojiStorage } from '../utils/customEmojiStorage'
import { useDispatch } from 'react-redux'
import { updateComponents } from 'src/dashboard/actions/dashboardLayout'
import { debounce } from 'lodash'
import { Moon, Sun  } from 'lucide-react'

const EditorContainer = styled.div`
  background: ${props => props.$isDarkMode ? '#1A1B1E' : '#fff'};
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  position: relative;
  transition: all 0.3s ease;
  
  .ProseMirror {
    padding: 16px;
    min-height: 100vh;
    position: relative;
    background: ${props => props.$isDarkMode ? '#1A1B1E' : '#fff'};
    color: ${props => props.$isDarkMode ? '#fff' : '#1f2937'};
    border: 1px solid ${props => props.$isDarkMode ? '#2D2D2D' : '#e5e7eb'};
    border-radius: 4px;
    
    &:focus {
      outline: none;
      border-color: ${props => props.$isDarkMode ? '#3b82f6' : '#2563eb'};
    }
    
    > * + * {
      margin-top: 0.75em;
    }
    
    p {
      margin: 0;
      position: relative;
      padding-left: 2rem;
    }
    
    p.is-empty::before {
      color: ${props => props.$isDarkMode ? '#6B7280' : '#9ca3af'};
    }
    
    code {
      background-color: ${props => props.$isDarkMode ? '#2D2D2D' : '#f3f4f6'};
      color: ${props => props.$isDarkMode ? '#fff' : '#111827'};
    }
    
    pre {
      background: ${props => props.$isDarkMode ? '#2D2D2D' : '#1f2937'};
      color: ${props => props.$isDarkMode ? '#fff' : '#f3f4f6'};
    }

    table {
      td, th {
        border-color: ${props => props.$isDarkMode ? '#2D2D2D' : '#ced4da'};
        color: ${props => props.$isDarkMode ? '#fff' : 'inherit'};
        }

      th {
        background-color: ${props => props.$isDarkMode ? '#2D2D2D' : '#f8f9fa'};
      }
    }
  }
`

const MenuBar = styled.div`
  padding: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid ${props => props.$isDarkMode ? '#2D2D2D' : '#e5e7eb'};
  background: ${props => props.$isDarkMode ? '#242526' : '#f9fafb'};
  border-radius: 6px 6px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  transition: all 0.3s ease;
  
  .table-buttons {
    border-left: 1px solid ${props => props.$isDarkMode ? '#2D2D2D' : '#e5e7eb'};
  }
`

const Button = styled.button`
  padding: 6px 12px;
  border: 1px solid ${props => props.$isDarkMode ? '#2D2D2D' : '#d1d5db'};
  border-radius: 6px;
  background: ${props => props.$isDarkMode 
    ? props.$active ? '#3A3B3C' : '#242526'
    : props.$active ? '#e5e7eb' : '#ffffff'};
  color: ${props => props.$isDarkMode ? '#fff' : '#374151'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$isDarkMode ? '#3A3B3C' : '#f3f4f6'};
    border-color: ${props => props.$isDarkMode ? '#4D4D4D' : '#9ca3af'};
  }
  
  &:active {
    background: ${props => props.$isDarkMode ? '#4D4D4D' : '#e5e7eb'};
  }
  
  ${props => props.$active && `
    background: ${props.$isDarkMode ? '#4D4D4D' : '#e5e7eb'};
    border-color: ${props.$isDarkMode ? '#4D4D4D' : '#9ca3af'};
    color: ${props.$isDarkMode ? '#fff' : '#111827'};
  `}
`

// Add file input for image upload
const HiddenInput = styled.input`
  display: none;
`

const ThemeToggleContainer = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
`

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 70px;
  height: 32px;
  background: #E4E6EB;
  border-radius: 50px;
  cursor: pointer;
  padding: 4px;
  border: ${props => props.$isDarkMode ? '1px solid white' : ''};

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50px;
    background: #E4E6EB;
    transition: all 0.4s ease;
    display: flex;
    align-items: center;
    padding: 4px;

    &:before {
      content: "";
      position: absolute;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: white;
      transition: transform 0.4s ease;
      transform: ${props => props.$isDarkMode ? 'translateX(38px)' : 'translateX(0)'};
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .icon {
      position: absolute;
      width: 16px;
      height: 16px;
      color: '#000';
      z-index: 1;
      transition: all 0.4s ease;

      &.sun {
        left: 8px;
        opacity: ${props => props.$isDarkMode ? '0' : '1'};
      }

      &.moon {
        right: 8px;
        opacity: ${props => props.$isDarkMode ? '1' : '0'};
      }
    }
  }

  input:checked + span {
    background: #1A1B1E;
  }
`

const ControlsContainer = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  display: flex;
  gap: 8px;
`

const FullscreenButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50px;
  background: ${props => props.$isDarkMode ? '#1A1B1E' : '#fff'};
  border: ${props => props.$isDarkMode ? '1px solid white' : '1px solid #E4E6EB'};
  cursor: pointer;
  color: ${props => props.$isDarkMode ? '#fff' : '#000'};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$isDarkMode ? '#2D2D2D' : '#f8fafc'};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

const FullscreenContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.$isDarkMode ? '#1A1B1E' : '#fff'};
  z-index: 9999;
  padding: 20px;
  overflow-y: auto;

  .editor-container {
    max-width: 1200px;
    margin: 0 auto;
    height: 100%;
  }

  /* Force chart re-render in fullscreen */
  .portable-chart-component {
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  /* Maintain chart visibility */
  [data-type="chart"] {
    transform: translateZ(0);
    will-change: transform;
  }
`

// Create custom table extension with attributes
const CustomTable = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-table-id': {
        default: null,
        parseHTML: element => element.getAttribute('data-table-id'),
        renderHTML: attributes => ({
          'data-table-id': attributes['data-table-id']
        })
      },
      'data-table-type': {
        default: null,
        parseHTML: element => element.getAttribute('data-table-type'),
        renderHTML: attributes => ({
          'data-table-type': attributes['data-table-type']
        })
      },
      'data-created-at': {
        default: null,
        parseHTML: element => element.getAttribute('data-created-at'),
        renderHTML: attributes => ({
          'data-created-at': attributes['data-created-at']
        })
      },
      'data-creator': {
        default: null,
        parseHTML: element => element.getAttribute('data-creator'),
        renderHTML: attributes => ({
          'data-creator': attributes['data-creator']
        })
      },
      'data-version': {
        default: null,
        parseHTML: element => element.getAttribute('data-version'),
        renderHTML: attributes => ({
          'data-version': attributes['data-version']
        })
      }
    }
  }
})

export const TipTapEditor = ({ editMode, initialContent, component }) => {
  const [isMounted, setIsMounted] = useState(false)
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const id = component?.id;
  
  const dispatch = useDispatch();

  const updateEditorComponentMeta = (editorJsonContent) => {
    if(component) {
      dispatch(
        updateComponents({
          [component?.id]: {
            ...component,
            meta: {
              ...component.meta,
              editorJson: editorJsonContent
            },
          },
        }),
      );
    }
  }

  const debounceUpdateEditorComponent = debounce(updateEditorComponentMeta, 300);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2]
        },
        typography: false,
      }),
      Color,
      FontFamily,
      Highlight,
      Link,
      FontSize.configure({
        types: ['textStyle'],
      }),
      Placeholder.configure({
        placeholder: 'Enter text or type "/" for commands...',
        emptyNodeClass: 'is-empty',
        showOnlyWhenEditable: true,
        includeChildren: true,
      }),
      Subscript,
      Superscript,
      CustomTable.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'my-custom-table',
        }
      }),
      TableCell,
      TableHeader,
      TableRow,
      TaskItem.configure({
        nested: true,
      }),
      TaskList,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle.configure({
        types: ['textStyle']
      }),
      Typography.configure({
        spaces: false,
        quotes: false,
        apostrophe: false,
        ellipsis: false,
        emDash: false,
        enDash: false,
      }),
      SlashCommand.configure({
        suggestion: {
          items: getSuggestionItems,
          render: renderItems,
        },
      }),
      ChartExtension.configure({
        parentId: id
      }),
      CustomEmoji,
      EmojiSuggestion,
    ],
    editable: editMode,
    injectCSS: false,
    content: component?.meta?.editorJson || initialContent, 
    onCreate() {
      setIsMounted(true)
    },
    onUpdate: ({ editor }) => {
      debounceUpdateEditorComponent(editor.getJSON())
    },
    onFocus: () => {
      // When editor is focused, set data attribute on parent
      const editorContainer = document.querySelector('.blocknote-editor');
      if (editorContainer) {
        editorContainer.setAttribute('data-editor-focused', 'true');
      }
    },
    onBlur: () => {
      // When editor loses focus, remove data attribute from parent
      const editorContainer = document.querySelector('.blocknote-editor');
      if (editorContainer) {
        editorContainer.setAttribute('data-editor-focused', 'false');
      }
    },
  })

  // Add this useEffect to update editable state when editMode changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(editMode)
    }
  }, [editor, editMode])

  // Don't render until client-side
  if (!isMounted) {
    return null;
  }

  if (!editor) {
    return null;
  }

  // Function for inserting normal table without attributes
  const insertNormalTable = () => {
    editor.chain()
      .focus()
      .insertContent({
        type: 'table',
        content: [{
          type: 'tableRow',
          content: Array(3).fill({
            type: 'tableHeader',
            content: [{ type: 'paragraph' }]
          })
        },
        ...Array(2).fill({
          type: 'tableRow',
          content: Array(3).fill({
            type: 'tableCell',
            content: [{ type: 'paragraph' }]
          })
        })]
      })
      .run();
  };

  // Function for inserting chart table with attributes
  const insertChartTable = () => {
    const tableId = Math.random().toString(36).substr(2, 9);
    
    editor.chain()
      .focus()
      .insertContent({
        type: 'table',
        attrs: {
          'data-table-id': tableId,
          'data-table-type': 'chart',
          'data-created-at': new Date().toISOString(),
          'data-creator': 'user',
          'data-version': '1.0'
        },
        content: [{
          type: 'tableRow',
          content: Array(3).fill({
            type: 'tableHeader',
            content: [{ type: 'paragraph' }]
          })
        },
        ...Array(2).fill({
          type: 'tableRow',
          content: Array(3).fill({
            type: 'tableCell',
            content: [{ type: 'paragraph' }]
          })
        })]
      })
      .run();
  };

  const handleCustomEmojiAdded = async (newEmoji) => {
    try {
      // Add to storage
      const updatedEmojis = customEmojiStorage.add(newEmoji)
      
      // Force editor to re-render emoji suggestions
      editor.commands.focus()
      
      return updatedEmojis
    } catch (error) {
      console.error('Error adding custom emoji:', error)
      throw error // Re-throw to be handled by the modal
    }
  }

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newTheme = !prev;
      return newTheme;
    });
  };

  return (
    <EditorContainer 
      className="editor-container" 
      data-editor-focused={editor?.isFocused}
      editMode={editMode}
      $isDarkMode={isDarkMode}
    >
      <ControlsContainer>
        <ToggleSwitch $isDarkMode={isDarkMode}>
          <input 
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleTheme}
          />
          <span>
            <Moon className="icon moon" size={16} />
            <Sun className="icon sun" size={16} />
          </span>
        </ToggleSwitch>
      </ControlsContainer>
      <MenuBar style={{ display: editMode ? 'flex' : 'none' }} $isDarkMode={isDarkMode}>
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          $isDarkMode={isDarkMode}
          $active={editor.isActive('bold')}
        >
          Bold
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          $isDarkMode={isDarkMode}
        >
          Italic
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          $isDarkMode={isDarkMode}
        >
          Strike
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          $isDarkMode={isDarkMode}
        >
          Code
        </Button>
        <Button onClick={() => editor.chain().focus().unsetAllMarks().run()}>
          Clear Marks
        </Button>
        <Button onClick={() => editor.chain().focus().clearNodes().run()}>
          Clear Nodes
        </Button>
        <Button
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive('paragraph')}
          $isDarkMode={isDarkMode}
        >
          Paragraph
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          $isDarkMode={isDarkMode}
        >
          H1
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          $isDarkMode={isDarkMode}
        >
          H2
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          $isDarkMode={isDarkMode}
        >
          Bullet List
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          $isDarkMode={isDarkMode}
        >
          Ordered List
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          $isDarkMode={isDarkMode}
        >
          Code Block
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          $isDarkMode={isDarkMode}
        >
          Blockquote
        </Button>
        <Button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          Horizontal Rule
        </Button>
        <div className="table-buttons">
          <Button
            onClick={insertNormalTable}
            title="Insert Normal Table"
            $isDarkMode={isDarkMode}
          >
            Insert Table
          </Button>
          <Button
            onClick={insertChartTable}
            title="Insert Chart Table"
            $isDarkMode={isDarkMode}
          >
            Insert Chart Table
          </Button>
          <Button
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            disabled={!editor.can().addColumnBefore()}
            $isDarkMode={isDarkMode}
          >
            Add Column Before
          </Button>
          <Button
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.can().addColumnAfter()}
            $isDarkMode={isDarkMode}
          >
            Add Column After
          </Button>
          <Button
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!editor.can().deleteColumn()}
            $isDarkMode={isDarkMode}
          >
            Delete Column
          </Button>
          <Button
            onClick={() => editor.chain().focus().addRowBefore().run()}
            disabled={!editor.can().addRowBefore()}
            $isDarkMode={isDarkMode}
          >
            Add Row Before
          </Button>
          <Button
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.can().addRowAfter()}
            $isDarkMode={isDarkMode}
          >
            Add Row After
          </Button>
          <Button
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!editor.can().deleteRow()}
            $isDarkMode={isDarkMode}
          >
            Delete Row
          </Button>
          <Button
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={!editor.can().deleteTable()}
            $isDarkMode={isDarkMode}
          >
            Delete Table
          </Button>
        </div>
        <Button onClick={() => setIsEmojiModalOpen(true)}>
          Add Emoji
        </Button>
      </MenuBar>
      {editor && <TextBubbleMenu editor={editor} />}
      {editor && <ChartBubbleMenu editor={editor} />}
      <AddEmojiModal
        isOpen={isEmojiModalOpen}
        onClose={() => setIsEmojiModalOpen(false)}
        onEmojiAdded={handleCustomEmojiAdded}
      />
      <EditorContent editor={editor} />
    </EditorContainer>
  );
};

export default TipTapEditor  
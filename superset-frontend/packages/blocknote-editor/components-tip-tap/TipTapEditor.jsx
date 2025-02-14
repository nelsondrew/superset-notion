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

const EditorContainer = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  
  .ProseMirror {
    min-height: 200px;
    padding: 16px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    color: #1f2937;
    
    &:focus {
      outline: none;
      border-color: #2563eb;
      ring: 2px rgba(37, 99, 235, 0.2);
    }
    
    > * + * {
      margin-top: 0.75em;
    }
    
    ul, ol {
      padding: 0 1rem;
    }
    
    h1, h2, h3, h4, h5, h6 {
      line-height: 1.1;
      color: #111827;
    }
    
    code {
      background-color: #f3f4f6;
      padding: 0.2em 0.4em;
      border-radius: 4px;
      color: #111827;
    }
    
    pre {
      background: #1f2937;
      color: #f3f4f6;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      
      code {
        color: inherit;
        padding: 0;
        background: none;
      }
    }
    
    img {
      max-width: 100%;
      height: auto;
      &.ProseMirror-selectednode {
        outline: 3px solid #68cef8;
      }
      
      &.resizable-image {
        display: inline-block;
        position: relative;
        margin: 1rem 0;
      }
    }
    
    .image-resizer {
      display: inline-block;
      position: relative;
      margin: 1rem 0;

      img {
        max-width: 100%;
        height: auto;
        transition: all 0.1s ease;
      }

      &.ProseMirror-selectednode img {
        outline: 3px solid #68cef8;
      }
    }
    
    blockquote {
      padding-left: 1rem;
      border-left: 4px solid #e5e7eb;
      color: #4b5563;
    }
    
    hr {
      border: none;
      border-top: 2px solid #e5e7eb;
      margin: 2rem 0;
    }

    table {
      border-collapse: collapse;
      margin: 0;
      overflow: hidden;
      table-layout: fixed;
      width: 100%;

      td, th {
        border: 2px solid #e5e7eb;
        box-sizing: border-box;
        min-width: 1em;
        padding: 8px;
        position: relative;
        vertical-align: top;

        > * {
          margin-bottom: 0;
        }
      }

      th {
        background-color: #f9fafb;
        font-weight: bold;
        text-align: left;
      }
    }

    div[data-type="chart"] {
      padding: 1rem;
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-weight: 500;
      color: #475569;
      text-align: center;
      position: relative;

      &.ProseMirror-selectednode {
        outline: ${props => props.editMode ? '2px solid #3b82f6' : 'none'};
      }

      .react-resizable-handle {
        position: absolute;
        width: 8px;
        height: 8px;
        background-color: #3b82f6;
        border: 1px solid white;
        border-radius: 4px;
        z-index: 100;
        
        &:hover {
          background-color: #2563eb;
        }
      }
    }

    .resize-handle {
      position: absolute;
      width: 8px;
      height: 8px;
      background-color: #3b82f6;
      border: 1px solid white;
      border-radius: 4px;
      z-index: 100;

      &:hover {
        background-color: #2563eb;
      }
    }

    p.is-empty::before {
      color: #9ca3af;
      content: attr(data-placeholder);
      height: 0;
      pointer-events: none;
      font-style: italic;
      position: absolute;
      left:  26px;
      opacity: 0.75;
    }

    p.is-empty {
      position: relative;
    }

    .custom-emoji {
      display: inline;
      height: 1.25em;
      width: auto;
      vertical-align: text-bottom;
      object-fit: contain;
    }

    h1 .custom-emoji {
      height: 1.25em;
    }

    h2 .custom-emoji {
      height: 1.25em;
    }

    .chart-caption {
      text-align: center;
      color: #4b5563;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      font-style: italic;
    }
  }
`

const MenuBar = styled.div`
  padding: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 6px 6px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  
  .table-buttons {
    display: flex;
    gap: 6px;
    padding-left: 12px;
    margin-left: 12px;
    border-left: 1px solid #e5e7eb;
  }

  .chart-controls {
    display: flex;
    gap: 4px;
    padding: 0 8px;
    border-left: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
    margin: 0 8px;
  }
`

const Button = styled.button`
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: ${props => props.active ? '#e5e7eb' : '#ffffff'};
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }
  
  &:focus {
    outline: none;
    ring: 2px rgba(37, 99, 235, 0.2);
  }
  
  &:active {
    background: #e5e7eb;
  }
  
  ${props => props.active && `
    background: #e5e7eb;
    border-color: #9ca3af;
    color: #111827;
  `}
`

// Add file input for image upload
const HiddenInput = styled.input`
  display: none;
`

export const TipTapEditor = ({ editMode, initialContent , component }) => {
 
  const [isMounted, setIsMounted] = useState(false)
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false)

  
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
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'my-custom-table',
        },
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
      ChartExtension,
      CustomEmoji,
      EmojiSuggestion,
    ],
    editable: editMode,
    injectCSS: false,
    content: component?.meta?.editorJson || initialContent, 
    onCreate() {
      setIsMounted(true)
      console.log('Editor created with content:', editor?.getJSON())
    },
    onUpdate: ({ editor }) => {
      debounceUpdateEditorComponent(editor.getJSON())
      console.log('Editor updated:', editor.getJSON())
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
    return null
  }

  if (!editor) {
    return null
  }

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

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

  return (
    <EditorContainer 
      className="editor-container" 
      data-editor-focused={editor?.isFocused}
      editMode={editMode}
    >
      <MenuBar style={{ display: editMode ? 'flex' : 'none' }}>
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
        >
          Bold
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
        >
          Italic
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
        >
          Strike
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
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
        >
          Paragraph
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
        >
          H1
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
        >
          H2
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
        >
          Bullet List
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
        >
          Ordered List
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
        >
          Code Block
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
        >
          Blockquote
        </Button>
        <Button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          Horizontal Rule
        </Button>
        <div className="table-buttons">
          <Button
            onClick={insertTable}
            title="Insert Table"
          >
            Insert Table
          </Button>
          <Button
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            disabled={!editor.can().addColumnBefore()}
          >
            Add Column Before
          </Button>
          <Button
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.can().addColumnAfter()}
          >
            Add Column After
          </Button>
          <Button
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!editor.can().deleteColumn()}
          >
            Delete Column
          </Button>
          <Button
            onClick={() => editor.chain().focus().addRowBefore().run()}
            disabled={!editor.can().addRowBefore()}
          >
            Add Row Before
          </Button>
          <Button
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.can().addRowAfter()}
          >
            Add Row After
          </Button>
          <Button
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!editor.can().deleteRow()}
          >
            Delete Row
          </Button>
          <Button
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={!editor.can().deleteTable()}
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
  )
}

export default TipTapEditor 
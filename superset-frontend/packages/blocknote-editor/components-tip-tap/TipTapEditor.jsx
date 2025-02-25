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
import { TabIndent } from './extensions/TabIndentExtension'
import { exportToDocx } from '../utils/documentExport'
import { Comment } from './extensions/CommentExtension'
import { CommentBubbleMenu } from './CommentBubbleMenu'
import { CommentsThread } from './CommentsThread'
import { v4 as uuidv4 } from 'uuid'
import { createPortal } from 'react-dom'
import { DecorationSet, Decoration } from 'prosemirror-view'

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

    .comment-highlight {
      background-color: #fef08a;
      cursor: pointer;
    }

    .comment-mark {
      background-color: #fef08a;
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

const PopoverContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1000;

  /* Add this to allow clicks on children */
  & > * {
    pointer-events: auto;
  }
`

export const TipTapEditor = ({ editMode, initialContent, component, hoveredPos, setHoveredPos }) => {
  const [editorKey, setEditorKey] = useState(0); // Add key to force editor recreation
  const [isMounted, setIsMounted] = useState(false)
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [comments, setComments] = useState({}) // Map of commentId -> array of comments
  const [activeCommentMark, setActiveCommentMark] = useState(null)
  const [commentAnchorEl, setCommentAnchorEl] = useState(null)
  // const [hoveredPos, setHoveredPos] = useState(null)
  
  const id = component?.id
  const dispatch = useDispatch()

  // Add state for popover portal container
  const [portalContainer, setPortalContainer] = useState(null)

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
        allowTableNodeSelection: true,
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
      ChartExtension.configure({
        parentId: id
      }),
      CustomEmoji,
      EmojiSuggestion,
      TabIndent,
      Comment,
    ],
    editable: true,
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
    editorProps: {
      decorations: (state) => {
        if (hoveredPos === null) return DecorationSet.empty;
        console.log("received the para", hoveredPos);

        try {
          const $pos = state.doc.resolve(hoveredPos);
          let depth = $pos.depth;
          
          while (depth > 0) {
            const node = $pos.node(depth);
            if (node.type.name === 'paragraph') {
              return DecorationSet.create(state.doc, [
                Decoration.node($pos.before(depth), $pos.after(depth), {
                  style: 'border-top: 2px solid #3b82f6'
                })
              ]);
            }
            depth--;
          }
        } catch (error) {
          console.error('Error creating decoration:', error);
        }
        
        return DecorationSet.empty;
      }
    },
    onBeforeCreate: ({ editor }) => {
      // Make editor instance available globally when created
      window.editor = editor;
    },
    onDestroy: () => {
      // Clean up global reference when editor is destroyed
      window.editor = null;
    }
  })

  // Also set it when editor instance changes
  useEffect(() => {
    if (editor) {
      window.editor = editor;
      editor.setHoveredPos = setHoveredPos;
    }
    return () => {
      window.editor = null;
    };
  }, [editor]);

  useEffect(() => {
    if (editor) {
      // Set editable state
      editor.setEditable(editMode);
      
      if (editMode) {
        // Force update to ensure table handlers are initialized
        const tr = editor.state.tr;
        editor.view.dispatch(tr);
        
        // Focus to ensure handlers are attached
        setTimeout(() => {
          editor.commands.focus();
        }, 0);
      }
    }
  }, [editor, editMode])

  // Move handleClick inside useEffect to avoid recreating it on every render
  useEffect(() => {
    if (!editor) return

    const handleClick = (event) => {
      // Get the clicked element
      const clickedElement = event.target
      
      // Check if we clicked inside a highlighted text
      if (clickedElement.closest('.comment-highlight')) {
        // Get the position in the document
        const pos = editor.view.posAtDOM(clickedElement, 0)
        if (typeof pos !== 'undefined') {
          // Get the parent nodes at this position
          const $pos = editor.state.doc.resolve(pos)
          
          // Find the comment mark by traversing up through parent nodes
          let commentMark = null
          
          // First check immediate marks at this position
          const marks = $pos.marks()
          commentMark = marks.find(mark => mark.type.name === 'comment')
          
          // If not found, check the current node's marks
          if (!commentMark) {
            const node = $pos.node()
            if (node.marks) {
              commentMark = node.marks.find(mark => mark.type.name === 'comment')
            }
          }
          
          // If still not found, traverse up through parent nodes
          if (!commentMark) {
            for (let depth = $pos.depth; depth >= 0; depth--) {
              const node = $pos.node(depth)
              if (node.type.name === 'listItem' || node.type.name === 'paragraph' || node.type.name === 'text') {
                // Check node's own marks
                if (node.marks) {
                  commentMark = node.marks.find(mark => mark.type.name === 'comment')
                  if (commentMark) break
                }
                
                // Check all text nodes within this node
                node.descendants((childNode, childPos) => {
                  if (childNode.type.name === 'text' && childNode.marks) {
                    const mark = childNode.marks.find(m => m.type.name === 'comment')
                    if (mark) {
                      commentMark = mark
                      return false // Stop traversing once found
                    }
                  }
                })
                
                if (commentMark) break
              }
            }
          }

          if (commentMark) {
            setActiveCommentMark(commentMark.attrs)
            setCommentAnchorEl(clickedElement)
          }
        }
      }
    }

    const editorContent = document.querySelector('.ProseMirror')
    if (editorContent) {
      editorContent.addEventListener('click', handleClick)
      return () => editorContent.removeEventListener('click', handleClick)
    }
  }, [editor])

  useEffect(() => {
    // Create container for popovers
    const container = document.createElement('div')
    container.className = 'popover-portal-container'
    document.body.appendChild(container)
    setPortalContainer(container)

    return () => {
      document.body.removeChild(container)
    }
  }, [])

  useEffect(() => {
    if (!editor) return;

    const handleMouseMove = (event) => {
      const pos = editor.view.posAtCoords({
        left: event.clientX,
        top: event.clientY
      });

      if (pos) {
        console.log(pos.pos)
        setHoveredPos(pos.pos);
      } else {
        setHoveredPos(null);
      }
    };

    const handleMouseLeave = () => {
      setHoveredPos(null);
    };

    // const editorElement = editor.view.dom;
    // editorElement.addEventListener('mousemove', handleMouseMove);
    // editorElement.addEventListener('mouseleave', handleMouseLeave);

    // return () => {
    //   editorElement.removeEventListener('mousemove', handleMouseMove);
    //   editorElement.removeEventListener('mouseleave', handleMouseLeave);
    // };
  }, [editor]);

  // Don't render until client-side
  if (!isMounted) {
    return null;
  }

  if (!editor) {
    return null;
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

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newTheme = !prev
      return newTheme
    })
  }

  const handleAddComment = (selection, anchorEl) => {
    const from = selection.from
    const $from = editor.state.doc.resolve(from)
    
    // Check for existing comment marks in the current node and its parents
    let existingCommentMark = null
    
    // Check immediate marks
    const marks = $from.marks()
    existingCommentMark = marks.find(mark => mark.type.name === 'comment')
    
    // If not found, check parent nodes
    if (!existingCommentMark) {
      for (let depth = $from.depth; depth > 0; depth--) {
        const node = $from.node(depth)
        if (node.type.name === 'listItem' || node.type.name === 'paragraph') {
          node.descendants((node, pos) => {
            if (node.type.name === 'text') {
              const marks = node.marks
              const mark = marks.find(m => m.type.name === 'comment')
              if (mark) {
                existingCommentMark = mark
                return false
              }
            }
          })
          if (existingCommentMark) break
        }
      }
    }

    if (existingCommentMark) {
      setActiveCommentMark(existingCommentMark.attrs)
    } else {
      // Only create the mark object, but don't apply it yet
      const newMark = { 
        commentId: uuidv4(),
        comments: []
      }
      // Just set the active mark without applying it to the text
      setActiveCommentMark(newMark)
    }
    setCommentAnchorEl(anchorEl)
  }

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
            onClick={insertTable}
            title="Insert Table"
            $isDarkMode={isDarkMode}
          >
            Insert Table
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
        <Button
          onClick={async () => {
            try {
              setIsExporting(true)
              await exportToDocx(editor)
            } catch (error) {
              console.error('Failed to export document:', error)
            } finally {
              setIsExporting(false)
            }
          }}
          disabled={isExporting}
          $isDarkMode={isDarkMode}
        >
          {isExporting ? 'Exporting...' : 'Export to DOCX'}
        </Button>
      </MenuBar>
      {editor && (
        <TextBubbleMenu 
          editor={editor} 
          onAddComment={handleAddComment}
        />
      )}
      {editor && <ChartBubbleMenu editor={editor} />}
      {portalContainer && createPortal(
        <PopoverContainer>
          {activeCommentMark && (
            <CommentsThread
              comments={activeCommentMark.comments || []}
              editor={editor}
              activeCommentMark={activeCommentMark}
              setActiveCommentMark={setActiveCommentMark}
              onClose={() => {
                setActiveCommentMark(null)
                setCommentAnchorEl(null)
              }}
              anchorEl={commentAnchorEl}
            />
          )}
        </PopoverContainer>,
        portalContainer
      )}
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
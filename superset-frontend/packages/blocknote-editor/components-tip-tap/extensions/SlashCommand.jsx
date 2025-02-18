import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import CommandList from '../CommandList'

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }) => {
          props.command({ editor, range })
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

export const getSuggestionItems = ({ query }) => {
  const items = [
    {
      title: 'Basic Formatting',
      subtitle: null,
      children: [
        {
          title: 'Bold',
          subtitle: 'Make text bold',
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBold().run()
          }
        },
        {
          title: 'Italic',
          subtitle: 'Make text italic',
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleItalic().run()
          }
        },
        {
          title: 'Strike',
          subtitle: 'Strikethrough text',
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleStrike().run()
          }
        },
        {
          title: 'Code',
          subtitle: 'Inline code',
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleCode().run()
          }
        },
      ],
    },
    {
      title: 'Blocks',
      subtitle: null,
      children: [
        {
          title: 'Paragraph',
          subtitle: 'Basic text block',
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setParagraph().run()
          }
        },
        {
          title: 'Heading 1',
          subtitle: 'Large heading',
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run()
          }
        },
        {
          title: 'Heading 2',
          subtitle: 'Medium heading',
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run()
          }
        },
        {
          title: 'Bullet List',
          subtitle: 'Create a bullet list',
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run()
          }
        },
        {
          title: 'Ordered List',
          subtitle: 'Create a numbered list',
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run()
          }
        },
        {
          title: 'Code Block',
          subtitle: 'Add a code block',
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
          }
        },
        {
          title: 'Blockquote',
          subtitle: 'Add a quote block',
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBlockquote().run()
          }
        },
        {
          title: 'Horizontal Rule',
          subtitle: 'Add a horizontal line',
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHorizontalRule().run()
          }
        },
        {
          title: 'Image',
          subtitle: 'Upload an image',
          command: ({ editor }) => {
            const fileInput = document.querySelector('input[type="file"]')
            fileInput?.click()
          }
        },
        {
          title: 'Chart',
          subtitle: 'Add a chart block',
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertContent({ type: 'chart' })
              .run()
          }
        },
      ],
    },
    {
      title: 'Tables',
      subtitle: null,
      children: [
        {
          title: 'Insert Table',
          subtitle: 'Add a 3x3 table',
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        },
        {
          title: 'Add Column Before',
          subtitle: 'Insert column before selection',
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .addColumnBefore()
              .run()
          }
        },
        {
          title: 'Add Column After',
          subtitle: 'Insert column after selection',
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .addColumnAfter()
              .run()
          }
        },
        {
          title: 'Add Row Before',
          subtitle: 'Insert row before selection',
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .addRowBefore()
              .run()
          }
        },
        {
          title: 'Add Row After',
          subtitle: 'Insert row after selection',
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .addRowAfter()
              .run()
          }
        },
        {
          title: 'Delete Table',
          subtitle: 'Remove the entire table',
          command: ({ editor, range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .deleteTable()
              .run()
          }
        },
        {
          title: 'Chart Table',
          subtitle: 'Insert a table for charts',
          command: ({ editor, range }) => {
            const tableId = Math.random().toString(36).substr(2, 9);
            
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertContent({
                type: 'table',
                attrs: {
                  'data-table-id': tableId,
                  'data-table-type': 'chart',
                  'data-created-at': new Date().toISOString(),
                  'data-creator': 'user',
                  'data-version': '1.0',
                  'data-is-chart-table': 'true',
                  'data-locked-rows': 'true'
                },
                content: [{
                  type: 'tableRow',
                  content: [
                    {
                      type: 'tableCell',
                      content: [
                        { type: 'paragraph', content: [{ type: 'text', text: 'First Column' }] },
                        { type: 'paragraph', content: [] },
                        { type: 'paragraph', content: [] },
                        { type: 'paragraph', content: [] }
                      ]
                    },
                    {
                      type: 'tableCell',
                      content: [
                        { type: 'paragraph', content: [{ type: 'text', text: 'Second Column' }] },
                        { type: 'paragraph', content: [] },
                        { type: 'paragraph', content: [] },
                        { type: 'paragraph', content: [] }
                      ]
                    },
                    {
                      type: 'tableCell',
                      content: [
                        { type: 'paragraph', content: [{ type: 'text', text: 'Third Column' }] },
                        { type: 'paragraph', content: [] },
                        { type: 'paragraph', content: [] },
                        { type: 'paragraph', content: [] }
                      ]
                    }
                  ]
                }]
              })
              .run()
          }
        },
      ],
    },
    {
      title: 'Clear',
      subtitle: null,
      children: [
        {
          title: 'Clear Marks',
          subtitle: 'Remove all formatting',
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).unsetAllMarks().run()
          }
        },
        {
          title: 'Clear Nodes',
          subtitle: 'Convert to plain text',
          command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).clearNodes().run()
          }
        }
      ]
    },
  ]

  if (typeof query === 'string' && query.length > 0) {
    const search = query.toLowerCase()
    return items
      .map(group => ({
        ...group,
        children: group.children.filter(item =>
          item.title.toLowerCase().includes(search) ||
          item.subtitle?.toLowerCase().includes(search)
        ),
      }))
      .filter(group => group.children.length > 0)
  }

  return items
}

export const renderItems = () => {
  let component = null
  let popup = null

  return {
    onStart: props => {
      const commandListRef = {
        onKeyDown: (event) => {
          console.log('Default handler', event)
        }
      }

      component = new ReactRenderer(CommandList, {
        props: {
          ...props,
          onRef: (methods) => {
            if (methods) {
              commandListRef.onKeyDown = methods.onKeyDown
            }
          }
        },
        editor: props.editor,
      })

      component.ref = commandListRef

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
      })
    },

    onKeyDown(props) {
      if (!component?.ref?.onKeyDown) return false

      if (props.event.key === 'Escape') {
        popup?.[0].hide()
        return true
      }

      if (['ArrowUp', 'ArrowDown', 'Enter'].includes(props.event.key)) {
        props.event.preventDefault()
        const result = component.ref.onKeyDown(props.event)
        
        if (props.event.key === 'Enter') {
          popup?.[0].hide()
        }
        
        return result
      }

      return false
    },

    onUpdate(props) {
      component?.updateProps(props)

      popup?.[0].setProps({
        getReferenceClientRect: props.clientRect,
      })
    },

    onExit() {
      popup?.[0].destroy()
      component?.destroy()
    },
  }
} 